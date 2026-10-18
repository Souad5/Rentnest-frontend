'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { useTheme } from 'next-themes';
import { Loader2 } from 'lucide-react';
import { FaGoogle } from 'react-icons/fa6';
import { toast } from 'sonner';
import { useAuth } from '@/providers/AuthProvider';
import { ApiError } from '@/lib/api';

// Minimal typings for Google Identity Services (https://accounts.google.com/gsi/client).
interface GoogleCredentialResponse {
    credential?: string;
}
interface GoogleAccountsId {
    initialize: (config: {
        client_id: string;
        callback: (response: GoogleCredentialResponse) => void;
        ux_mode?: 'popup' | 'redirect';
        auto_select?: boolean;
        cancel_on_tap_outside?: boolean;
        context?: 'signin' | 'signup' | 'use';
    }) => void;
    renderButton: (
        parent: HTMLElement,
        options: {
            type?: 'standard' | 'icon';
            theme?: 'outline' | 'filled_blue' | 'filled_black';
            size?: 'large' | 'medium' | 'small';
            text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
            shape?: 'rectangular' | 'pill' | 'circle' | 'square';
            logo_alignment?: 'left' | 'center';
            width?: number;
        },
    ) => void;
}
declare global {
    interface Window {
        google?: { accounts?: { id?: GoogleAccountsId } };
    }
}

const GSI_SRC = 'https://accounts.google.com/gsi/client';

interface GoogleSignInButtonProps {
    /** Role for brand-new accounts (register page). */
    role?: 'TENANT' | 'LANDLORD';
    redirectTo?: string;
    /** Surface API errors in the parent form's banner. */
    onError?: (message: string) => void;
    text?: 'signin_with' | 'signup_with' | 'continue_with';
}

/** Placeholder / fallback button styled like the rest of the auth form. */
function StyledGoogleButton({
    onClick,
    loading,
    label = 'Continue with Google',
}: {
    onClick?: () => void;
    loading?: boolean;
    label?: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={loading}
            className="inline-flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-input bg-card px-4 text-sm font-semibold text-foreground shadow-xs transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-70"
        >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FaGoogle className="h-4 w-4 text-primary" aria-hidden />}
            {label}
        </button>
    );
}

export function GoogleSignInButton({ role, redirectTo, onError, text = 'continue_with' }: GoogleSignInButtonProps) {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const { loginWithGoogle } = useAuth();
    const { resolvedTheme } = useTheme();
    const containerRef = useRef<HTMLDivElement>(null);
    const [scriptState, setScriptState] = useState<'loading' | 'ready' | 'error'>(() =>
        typeof window !== 'undefined' && window.google?.accounts?.id ? 'ready' : 'loading',
    );
    const [rendered, setRendered] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Keep the latest props for the GIS callback, which is registered once.
    const latest = useRef({ role, redirectTo, onError, loginWithGoogle });
    useEffect(() => {
        latest.current = { role, redirectTo, onError, loginWithGoogle };
    });

    const handleCredential = useCallback(async (response: GoogleCredentialResponse) => {
        const { role: currentRole, redirectTo: target, onError: report, loginWithGoogle: signIn } = latest.current;
        if (!response.credential) {
            report?.('Google did not return a sign-in credential. Please try again.');
            return;
        }
        setSubmitting(true);
        try {
            await signIn(response.credential, currentRole, target);
            toast.success('Signed in with Google');
        } catch (err) {
            const message =
                err instanceof ApiError ? err.message : 'Google sign-in failed. Please try again or use your email and password.';
            report?.(message);
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    }, []);

    useEffect(() => {
        const gsi = window.google?.accounts?.id;
        const container = containerRef.current;
        if (!clientId || scriptState !== 'ready' || !gsi || !container) return;

        const draw = () => {
            gsi.initialize({ client_id: clientId, callback: handleCredential, ux_mode: 'popup', cancel_on_tap_outside: true });
            container.replaceChildren();
            const width = Math.round(Math.min(400, Math.max(200, container.offsetWidth || 320)));
            gsi.renderButton(container, {
                type: 'standard',
                theme: resolvedTheme === 'dark' ? 'filled_black' : 'outline',
                size: 'large',
                text,
                shape: 'rectangular',
                logo_alignment: 'center',
                width,
            });
            setRendered(true);
        };
        draw();

        // Redraw only when the available width changes (GIS buttons have a fixed pixel width).
        let frame = 0;
        let lastWidth = container.offsetWidth;
        const observer = new ResizeObserver(() => {
            if (Math.abs(container.offsetWidth - lastWidth) < 8) return;
            lastWidth = container.offsetWidth;
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(draw);
        });
        observer.observe(container);
        return () => {
            observer.disconnect();
            cancelAnimationFrame(frame);
        };
    }, [clientId, scriptState, resolvedTheme, text, handleCredential]);

    if (!clientId) {
        return (
            <StyledGoogleButton
                onClick={() =>
                    toast.info('Google sign-in isn’t configured yet', {
                        description: 'Please use your email and password, or try one of the demo accounts.',
                    })
                }
            />
        );
    }

    return (
        <div className="relative">
            <Script
                src={GSI_SRC}
                strategy="afterInteractive"
                onReady={() => setScriptState('ready')}
                onError={() => setScriptState('error')}
            />
            {scriptState === 'error' ? (
                <StyledGoogleButton
                    onClick={() =>
                        toast.error('Couldn’t load Google sign-in', {
                            description: 'Check your connection or disable content blockers, then reload the page.',
                        })
                    }
                />
            ) : (
                <>
                    {/* Google renders its own button (an iframe) into this container. */}
                    <div
                        ref={containerRef}
                        className="flex min-h-11 w-full justify-center overflow-hidden rounded-xl [&_iframe]:mx-auto!"
                        aria-busy={!rendered}
                    />
                    {!rendered && (
                        <div className="absolute inset-0">
                            <StyledGoogleButton loading label="Loading Google sign-in…" />
                        </div>
                    )}
                    {submitting && (
                        <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-xl bg-card/90 text-sm font-medium text-foreground">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" /> Signing you in…
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
