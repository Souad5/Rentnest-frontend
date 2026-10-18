'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, ArrowUp, BedDouble, Building2, Home, LifeBuoy, Loader2, Mail, MapPin, MessageCircle, RotateCcw, Bot, Star, Trash2, X } from 'lucide-react';
import { aiApi, ApiError } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import { coverImage, canOptimizeImage } from '@/lib/images';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { ChatMessage, PropertySummary } from '@/types/api';
import { ChatMarkdown } from './ChatMarkdown';
import { OPEN_CHAT_EVENT, type OpenChatDetail } from './chat-events';

const STORAGE_KEY = 'rentnest:chat';
const MAX_CHARS = 2000;
const MAX_HISTORY = 20;

const SUGGESTIONS = [
    'Find a 2-bed flat in Dhanmondi under $600',
    'How does payment work?',
    'How do I list my property?',
    'What should I check before renting a flat?',
];

interface ChatEntry {
    id: string;
    role: ChatMessage['role'];
    content: string;
    properties?: PropertySummary[];
}

type Status = 'unknown' | 'checking' | 'enabled' | 'disabled' | 'error';

let idCounter = 0;
const makeId = () => `${Date.now().toString(36)}-${(idCounter++).toString(36)}`;

function loadConversation(): ChatEntry[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = window.sessionStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(
            (m): m is ChatEntry =>
                !!m &&
                typeof m === 'object' &&
                typeof (m as ChatEntry).id === 'string' &&
                ((m as ChatEntry).role === 'user' || (m as ChatEntry).role === 'assistant') &&
                typeof (m as ChatEntry).content === 'string',
        );
    } catch {
        return [];
    }
}

function saveConversation(messages: ChatEntry[]) {
    try {
        if (messages.length) window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
        else window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
        // Storage can be unavailable (private mode, quota) — the chat still works in memory.
    }
}

/** Last ≤20 messages, starting with a user turn and ending with one. */
function toPayload(history: ChatEntry[]): ChatMessage[] {
    const recent = history.slice(-MAX_HISTORY).map(({ role, content }) => ({ role, content: content.slice(0, MAX_CHARS) }));
    while (recent.length && recent[0].role !== 'user') recent.shift();
    return recent;
}

const isMobile = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches;

function PropertyMiniCard({ property, onNavigate }: { property: PropertySummary; onNavigate: () => void }) {
    const image = coverImage(property);
    return (
        <Link
            href={`/properties/${property.id}`}
            onClick={onNavigate}
            className="group flex items-center gap-3 rounded-xl border border-border bg-card p-2 transition-colors hover:border-primary/50 hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                {image ? (
                    <Image
                        src={image}
                        alt={property.title}
                        fill
                        sizes="56px"
                        unoptimized={!canOptimizeImage(image)}
                        className="object-cover"
                    />
                ) : (
                    <Building2 className="absolute inset-0 m-auto h-5 w-5 text-muted-foreground" aria-hidden />
                )}
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary">{property.title}</p>
                <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{property.location}</span>
                </p>
                <div className="mt-0.5 flex items-center gap-2.5 text-xs">
                    <span className="font-semibold text-foreground">
                        {formatPrice(property.price)}
                        <span className="font-normal text-muted-foreground">/mo</span>
                    </span>
                    {property.bedrooms != null && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                            <BedDouble className="h-3 w-3" /> {property.bedrooms}
                        </span>
                    )}
                    {property.reviewCount > 0 && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                            <Star className="h-3 w-3 fill-highlight text-highlight" /> {property.avgRating.toFixed(1)}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}

function TypingIndicator() {
    return (
        <div className="flex items-center gap-2" role="status" aria-label="Assistant is typing">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Bot className="h-3.5 w-3.5" />
            </span>
            <span className="flex items-center gap-1 rounded-2xl rounded-tl-md bg-muted px-3.5 py-3">
                {[0, 1, 2].map((i) => (
                    <motion.span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
                        animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                    />
                ))}
            </span>
        </div>
    );
}

export function ChatAssistant() {
    const { user } = useAuth();
    const pathname = usePathname();
    const onPropertyDetail = /^\/properties\/[^/]+$/.test(pathname ?? '');
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState<Status>('unknown');
    const [messages, setMessages] = useState<ChatEntry[]>(loadConversation);
    const [input, setInput] = useState('');
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [atPageBottom, setAtPageBottom] = useState(false);

    const fabRef = useRef<HTMLButtonElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const conversationRef = useRef(0); // bumps on "clear" so stale replies are dropped
    const statusRef = useRef<Status>('unknown');

    const checkStatus = useCallback(async () => {
        statusRef.current = 'checking';
        setStatus('checking');
        try {
            const res = await aiApi.status();
            const next: Status = res.data?.enabled ? 'enabled' : 'disabled';
            statusRef.current = next;
            setStatus(next);
        } catch {
            statusRef.current = 'error';
            setStatus('error');
        }
    }, []);

    const openPanel = useCallback(
        (prompt?: string) => {
            setOpen(true);
            if (prompt) setInput(prompt.slice(0, MAX_CHARS));
            if (statusRef.current === 'unknown' || statusRef.current === 'error') void checkStatus();
        },
        [checkStatus, setInput],
    );

    const closePanel = useCallback(() => {
        setOpen(false);
        requestAnimationFrame(() => fabRef.current?.focus());
    }, []);

    // Open from anywhere via openChatAssistant().
    useEffect(() => {
        const onOpen = (event: Event) => openPanel((event as CustomEvent<OpenChatDetail>).detail?.prompt);
        window.addEventListener(OPEN_CHAT_EVENT, onOpen);
        return () => window.removeEventListener(OPEN_CHAT_EVENT, onOpen);
    }, [openPanel]);

    // Persist the conversation for this browser tab.
    useEffect(() => {
        saveConversation(messages);
    }, [messages]);

    // Slide the launcher away at the very bottom so it never covers the footer's last row.
    useEffect(() => {
        const onScroll = () => {
            const doc = document.documentElement;
            setAtPageBottom(window.innerHeight + window.scrollY >= doc.scrollHeight - 96);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, []);

    // Escape closes; lock page scroll behind the full-screen mobile sheet; focus the input.
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closePanel();
        };
        window.addEventListener('keydown', onKey);
        const previousOverflow = document.body.style.overflow;
        if (isMobile()) document.body.style.overflow = 'hidden';
        const frame = requestAnimationFrame(() => inputRef.current?.focus());
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = previousOverflow;
            cancelAnimationFrame(frame);
        };
    }, [open, closePanel]);

    // Keep the newest message in view.
    useEffect(() => {
        const list = listRef.current;
        if (list) list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' });
    }, [messages, pending, error, open, status]);

    const request = useCallback(async (history: ChatEntry[]) => {
        const conversation = conversationRef.current;
        setPending(true);
        setError(null);
        try {
            const res = await aiApi.chat(toPayload(history));
            if (conversation !== conversationRef.current) return;
            const reply = res.data?.reply?.trim() || 'Sorry, I couldn’t come up with an answer to that. Could you rephrase?';
            setMessages((prev) => [
                ...prev,
                { id: makeId(), role: 'assistant', content: reply, properties: res.data?.properties?.slice(0, 3) ?? [] },
            ]);
        } catch (err) {
            if (conversation !== conversationRef.current) return;
            if (err instanceof ApiError && err.status === 503) {
                statusRef.current = 'disabled';
                setStatus('disabled');
                return;
            }
            setError(
                err instanceof ApiError
                    ? err.status === 429
                        ? 'You’re sending messages too quickly. Please wait a moment and retry.'
                        : err.message
                    : 'Couldn’t reach the assistant. Check your connection and retry.',
            );
        } finally {
            if (conversation === conversationRef.current) setPending(false);
        }
    }, []);

    const send = (text: string) => {
        const content = text.trim().slice(0, MAX_CHARS);
        if (!content || pending || status !== 'enabled') return;
        const next = [...messages, { id: makeId(), role: 'user' as const, content }];
        setMessages(next);
        setInput('');
        void request(next);
    };

    const retry = () => {
        if (pending || !messages.length || messages[messages.length - 1].role !== 'user') return;
        void request(messages);
    };

    const clearChat = () => {
        conversationRef.current += 1;
        setMessages([]);
        setError(null);
        setPending(false);
        setInput('');
        inputRef.current?.focus();
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            send(input);
        }
    };

    const onNavigate = () => {
        if (isMobile()) closePanel();
    };

    const firstName = user?.name?.split(' ')[0];
    const lastIsUser = messages.length > 0 && messages[messages.length - 1].role === 'user';

    return (
        <>
            {/* Launcher */}
            <AnimatePresence>
                {!open && (
                    <motion.button
                        ref={fabRef}
                        type="button"
                        onClick={() => openPanel()}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: atPageBottom ? 0 : 1, scale: 1, y: atPageBottom ? 24 : 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        aria-label="Open the RentNest AI assistant"
                        aria-hidden={atPageBottom || undefined}
                        tabIndex={atPageBottom ? -1 : 0}
                        className={cn(
                            'fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:right-6 sm:bottom-6',
                            atPageBottom && 'pointer-events-none',
                            // Property details pages show a sticky booking bar on mobile/tablet; sit above it.
                            onPropertyDetail && 'max-lg:bottom-[calc(5.5rem+env(safe-area-inset-bottom))]',
                        )}
                    >
                        <Bot className="h-5 w-5" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Panel */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        role="dialog"
                        aria-modal="false"
                        aria-labelledby="chat-assistant-title"
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 24 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        className="fixed inset-0 z-[60] flex h-dvh flex-col overflow-hidden bg-card pt-[env(safe-area-inset-top)] text-card-foreground sm:inset-auto sm:right-6 sm:bottom-6 sm:h-[560px] sm:max-h-[calc(100dvh-3rem)] sm:w-[380px] sm:rounded-2xl sm:border sm:border-border sm:pt-0 sm:shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                                <Bot className="h-4 w-4" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <h2 id="chat-assistant-title" className="truncate text-sm font-semibold text-foreground">
                                    RentNest Assistant
                                </h2>
                                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <span className="rounded-full bg-highlight/20 px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-foreground">
                                        AI
                                    </span>
                                    Powered by Claude
                                </p>
                            </div>
                            {messages.length > 0 && status === 'enabled' && (
                                <button
                                    type="button"
                                    onClick={clearChat}
                                    aria-label="Clear chat"
                                    title="Clear chat"
                                    className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={closePanel}
                                aria-label="Close assistant"
                                className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Body */}
                        {status === 'checking' || status === 'unknown' ? (
                            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-sm text-muted-foreground">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                Connecting to the assistant…
                            </div>
                        ) : status === 'disabled' || status === 'error' ? (
                            <div className="flex flex-1 flex-col items-center justify-center gap-4 overflow-y-auto p-6 text-center">
                                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                                    {status === 'error' ? <AlertCircle className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
                                </span>
                                <div className="space-y-1.5">
                                    <h3 className="font-semibold text-foreground">
                                        {status === 'error' ? 'Couldn’t reach the assistant' : 'The assistant is unavailable right now'}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {status === 'error'
                                            ? 'Check your connection and try again — or browse homes and our help center in the meantime.'
                                            : 'You can still browse every available home, read our help center or send our team a message.'}
                                    </p>
                                </div>
                                {status === 'error' && (
                                    <button
                                        type="button"
                                        onClick={() => void checkStatus()}
                                        className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                                    >
                                        <RotateCcw className="h-4 w-4" /> Try again
                                    </button>
                                )}
                                <div className="grid w-full gap-2">
                                    {[
                                        { href: '/properties', label: 'Browse properties', icon: Home },
                                        { href: '/help', label: 'Help center', icon: LifeBuoy },
                                        { href: '/contact', label: 'Contact support', icon: Mail },
                                    ].map(({ href, label, icon: Icon }) => (
                                        <Link
                                            key={href}
                                            href={href}
                                            onClick={onNavigate}
                                            className="flex items-center gap-3 rounded-xl border border-border px-4 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-accent/50"
                                        >
                                            <Icon className="h-4 w-4 text-primary" /> {label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <>
                                <div
                                    ref={listRef}
                                    className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4"
                                    aria-live="polite"
                                    aria-relevant="additions"
                                >
                                    {/* Welcome */}
                                    <div className="flex gap-2">
                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <Bot className="h-3.5 w-3.5" />
                                        </span>
                                        <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-muted px-3.5 py-2.5 text-sm text-foreground">
                                            <p className="leading-relaxed">
                                                Hi{firstName ? ` ${firstName}` : ''}! I’m RentNest’s AI assistant. Tell me the area, budget
                                                and size you have in mind and I’ll suggest available homes — or ask me how renting on
                                                RentNest works.
                                            </p>
                                        </div>
                                    </div>

                                    {messages.length === 0 && (
                                        <div className="flex flex-wrap gap-2 pl-9">
                                            {SUGGESTIONS.map((s) => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => send(s)}
                                                    className="rounded-full border border-primary/30 bg-card px-3 py-1.5 text-left text-xs font-medium text-primary transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {messages.map((m) =>
                                        m.role === 'user' ? (
                                            <div key={m.id} className="flex justify-end">
                                                <div className="max-w-[85%] rounded-2xl rounded-tr-md bg-primary px-3.5 py-2.5 text-sm whitespace-pre-wrap break-words text-primary-foreground">
                                                    {m.content}
                                                </div>
                                            </div>
                                        ) : (
                                            <div key={m.id} className="flex gap-2">
                                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                    <Bot className="h-3.5 w-3.5" />
                                                </span>
                                                <div className="min-w-0 max-w-[85%] space-y-2">
                                                    <div className="rounded-2xl rounded-tl-md bg-muted px-3.5 py-2.5 text-sm break-words text-foreground">
                                                        <ChatMarkdown content={m.content} />
                                                    </div>
                                                    {m.properties && m.properties.length > 0 && (
                                                        <div className="space-y-2">
                                                            {m.properties.map((p) => (
                                                                <PropertyMiniCard key={p.id} property={p} onNavigate={onNavigate} />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ),
                                    )}

                                    {pending && <TypingIndicator />}

                                    {error && !pending && (
                                        <div
                                            role="alert"
                                            className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-xs text-destructive"
                                        >
                                            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                            <p className="flex-1 leading-relaxed">{error}</p>
                                            {lastIsUser && (
                                                <button
                                                    type="button"
                                                    onClick={retry}
                                                    className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-0.5 font-semibold hover:bg-destructive/10"
                                                >
                                                    <RotateCcw className="h-3 w-3" /> Retry
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Composer */}
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        send(input);
                                    }}
                                    className="border-t border-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
                                >
                                    <div className="flex items-end gap-2 rounded-xl border border-input bg-background p-1.5 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30">
                                        <label htmlFor="chat-assistant-input" className="sr-only">
                                            Message the RentNest assistant
                                        </label>
                                        <textarea
                                            id="chat-assistant-input"
                                            ref={inputRef}
                                            value={input}
                                            onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS))}
                                            onKeyDown={onKeyDown}
                                            maxLength={MAX_CHARS}
                                            rows={1}
                                            placeholder="Ask about homes, areas or renting…"
                                            className="field-sizing-content max-h-32 min-h-9 flex-1 resize-none bg-transparent px-2 py-2 text-base text-foreground placeholder:text-muted-foreground focus:outline-none sm:text-sm"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!input.trim() || pending}
                                            aria-label="Send message"
                                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
                                        >
                                            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <div className="mt-1.5 flex items-center justify-between gap-2 px-1 text-[11px] text-muted-foreground">
                                        <span>AI can make mistakes — check listing details before requesting.</span>
                                        <span className={cn('shrink-0 tabular-nums', input.length > MAX_CHARS * 0.9 && 'text-destructive')}>
                                            {input.length}/{MAX_CHARS}
                                        </span>
                                    </div>
                                </form>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
