'use client';

import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, ApiError, AUTH_EXPIRED_EVENT } from '@/lib/api';
import { dashboardHomeFor } from '@/config/site';
import type { AuthPayload, User as ApiUserType, UserRole as ApiUserRole } from '@/types/api';

export type UserRole = ApiUserRole;

/** Session user. Fields beyond id/name/email/role are filled by /auth/me. */
export type User = Pick<ApiUserType, 'id' | 'name' | 'email' | 'role'> & Partial<Omit<ApiUserType, 'id' | 'name' | 'email' | 'role'>>;

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (credentials: Record<string, unknown>, redirectTo?: string) => Promise<void>;
    register: (payload: Record<string, unknown>, redirectTo?: string) => Promise<void>;
    loginWithGoogle: (credential: string, role?: Exclude<UserRole, 'ADMIN'>, redirectTo?: string) => Promise<void>;
    logout: () => void;
    /** Re-fetches /auth/me (e.g. after a profile update). */
    refreshUser: () => Promise<void>;
    setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // matches the 7-day JWT lifetime

function clearAuthCookies() {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    document.cookie = 'role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
}

// The route proxy (src/proxy.ts) gates /dashboard/* off these cookies; the
// API itself authenticates with the Bearer token from localStorage.
function mirrorAuthCookies(authToken: string, role: UserRole) {
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `token=${authToken}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
    document.cookie = `role=${role}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
}

/** Only allow same-origin relative redirects (prevents open redirects via ?from=). */
function safeRedirect(target: string | undefined, fallback: string): string {
    // Browsers treat a backslash like "/" and strip tabs/newlines, so "/<backslash>evil.com"
    // or "/<tab>/evil.com" would leave the site: reject those and verify the origin.
    if (!target || !target.startsWith('/') || /[\\\s]/.test(target)) return fallback;
    try {
        const url = new URL(target, window.location.origin);
        if (url.origin !== window.location.origin) return fallback;
        return `${url.pathname}${url.search}${url.hash}`;
    } catch {
        return fallback;
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUserState] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const router = useRouter();

    /** Drops the session locally without navigating. */
    const clearSession = useCallback(() => {
        localStorage.removeItem('token');
        clearAuthCookies();
        setUserState(null);
        setToken(null);
    }, []);

    const logout = useCallback(() => {
        clearSession();
        router.push('/login');
    }, [clearSession, router]);

    // Any authenticated API call answered with 401 (expired/revoked JWT) ends
    // the session; protected pages then send the user to /login themselves.
    useEffect(() => {
        const onExpired = () => {
            if (localStorage.getItem('token')) clearSession();
        };
        window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
        return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
    }, [clearSession]);

    const fetchMe = useCallback(async (): Promise<User> => {
        const res = await authApi.me();
        return res.data;
    }, []);

    useEffect(() => {
        let isMounted = true;

        const initAuth = async () => {
            await Promise.resolve();

            const storedToken = localStorage.getItem('token');
            if (!storedToken) {
                clearAuthCookies();
                if (isMounted) setIsLoading(false);
                return;
            }

            try {
                const me = await fetchMe();
                if (isMounted) {
                    setToken(storedToken);
                    setUserState(me);
                    mirrorAuthCookies(storedToken, me.role);
                }
            } catch (error) {
                // Only an explicit auth rejection ends the session (without
                // navigating: public pages stay usable). Transient network/5xx
                // failures keep the token so the dashboard can offer a retry
                // instead of bouncing between /login and /dashboard (the proxy
                // still sees the auth cookies).
                const status = error instanceof ApiError ? error.status : undefined;
                if (isMounted) {
                    if (status === 401 || status === 403) clearSession();
                    else setToken(storedToken);
                }
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        initAuth();

        return () => {
            isMounted = false;
        };
    }, [clearSession, fetchMe]);

    const completeAuth = useCallback(
        (payload: AuthPayload, redirectTo?: string) => {
            const { user: authUser, token: authToken } = payload;
            localStorage.setItem('token', authToken);
            mirrorAuthCookies(authToken, authUser.role);
            setToken(authToken);
            setUserState(authUser);
            router.push(safeRedirect(redirectTo, dashboardHomeFor(authUser.role)));
            // Hydrate optional profile fields without blocking navigation.
            fetchMe().then(setUserState).catch(() => undefined);
        },
        [router, fetchMe],
    );

    const login = async (credentials: Record<string, unknown>, redirectTo?: string) => {
        setIsLoading(true);
        try {
            const res = (await authApi.login(credentials)) as unknown as { data: AuthPayload };
            completeAuth(res.data, redirectTo);
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (payload: Record<string, unknown>, redirectTo?: string) => {
        setIsLoading(true);
        try {
            const res = (await authApi.register(payload)) as unknown as { data: AuthPayload };
            completeAuth(res.data, redirectTo);
        } finally {
            setIsLoading(false);
        }
    };

    const loginWithGoogle = async (
        credential: string,
        role?: Exclude<UserRole, 'ADMIN'>,
        redirectTo?: string,
    ) => {
        setIsLoading(true);
        try {
            const res = await authApi.google(credential, role);
            completeAuth(res.data, redirectTo);
        } finally {
            setIsLoading(false);
        }
    };

    const refreshUser = useCallback(async () => {
        const me = await fetchMe();
        setUserState(me);
    }, [fetchMe]);

    const setUser = useCallback((next: User) => setUserState(next), []);

    return (
        <AuthContext.Provider
            value={{ user, token, isLoading, login, register, loginWithGoogle, logout, refreshUser, setUser }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
