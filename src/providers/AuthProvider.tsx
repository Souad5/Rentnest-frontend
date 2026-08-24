'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, ApiError } from '@/lib/api';

export type UserRole = 'TENANT' | 'LANDLORD' | 'ADMIN';

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    isBanned?: boolean;
    createdAt?: string;
}

interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
        token: string;
    };
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (credentials: Record<string, unknown>) => Promise<void>;
    register: (payload: Record<string, unknown>) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const router = useRouter();

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        // Clear both mirrored cookies so the middleware gate cannot admit or
        // misroute a session that no longer exists.
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        setUser(null);
        setToken(null);
        router.push('/login');
    }, [router]);

    // Middleware gates /dashboard/{role}/* off plain cookies; mirror the role
    // alongside the token so protected routes resolve for the right profile.
    const mirrorAuthCookies = useCallback((authToken: string, role: UserRole) => {
        document.cookie = `token=${authToken}; path=/; max-age=86400`;
        document.cookie = `role=${role}; path=/; max-age=86400`;
    }, []);

    useEffect(() => {
        let isMounted = true;

        const initAuth = async () => {
            await Promise.resolve();

            const storedToken = localStorage.getItem('token');
            if (!storedToken) {
                // Reconcile dual-tracked auth: drop stale mirrored cookies so
                // the middleware gate cannot admit a session with no token.
                document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                document.cookie = 'role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                if (isMounted) setIsLoading(false);
                return;
            }

            try {
                const response = await authApi.getMe();
                // Route through unknown first to avoid TS non-overlapping type errors
                const res = response as unknown as { data?: { user?: User } | User };

                let userData: User;
                if (res?.data && typeof res.data === 'object' && 'user' in res.data && res.data.user) {
                    userData = res.data.user;
                } else if (res?.data && 'id' in (res.data as object)) {
                    userData = res.data as User;
                } else {
                    userData = response as unknown as User;
                }

                if (isMounted) {
                    setToken(storedToken);
                    setUser(userData);
                    // Refresh mirrored cookies (same TTL as login) so reloads
                    // keep passing the middleware role gates.
                    mirrorAuthCookies(storedToken, userData.role);
                }
            } catch (error) {
                // Only an explicit auth rejection should end the session; a
                // transient network/5xx failure must not wipe localStorage
                // while protected pages are still mounted, or their API calls
                // go out tokenless ("No token provided").
                const status = error instanceof ApiError ? error.status : undefined;
                if (isMounted && (status === 401 || status === 403)) {
                    logout();
                }
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        initAuth();

        return () => {
            isMounted = false;
        };
    }, [logout, mirrorAuthCookies]);

    const login = async (credentials: Record<string, unknown>) => {
        setIsLoading(true);
        try {
            const res = (await authApi.login(credentials)) as unknown as AuthResponse;
            const authUser = res.data.user;
            const authToken = res.data.token;

            localStorage.setItem('token', authToken);
            mirrorAuthCookies(authToken, authUser.role);
            setToken(authToken);
            setUser(authUser);

            if (authUser.role === 'ADMIN') router.push('/dashboard/admin');
            else if (authUser.role === 'LANDLORD') router.push('/dashboard/landlord');
            else router.push('/dashboard/tenant');
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (payload: Record<string, unknown>) => {
        setIsLoading(true);
        try {
            const res = (await authApi.register(payload)) as unknown as AuthResponse;
            const authUser = res.data.user;
            const authToken = res.data.token;

            localStorage.setItem('token', authToken);
            mirrorAuthCookies(authToken, authUser.role);
            setToken(authToken);
            setUser(authUser);

            if (authUser.role === 'LANDLORD') router.push('/dashboard/landlord');
            else router.push('/dashboard/tenant');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
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