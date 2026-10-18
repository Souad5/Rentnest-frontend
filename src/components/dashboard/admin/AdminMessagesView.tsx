'use client';

import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Inbox, Mail, MailOpen, Newspaper, Reply, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { AppDataTable } from '@/components/shared/AppDataTable';
import { EmptyState } from '@/components/shared/EmptyState';
import StatusBadge from '@/components/shared/StatusBadge';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { adminApi } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { ContactMessage, NewsletterSubscriber } from '@/types/api';
import { ConfirmDialog } from './ConfirmDialog';
import { CopyButton } from './CopyButton';
import { CountPills, ErrorState, TableSkeleton } from './AdminStates';
import { adminKeys, errorMessage, useAdminCache, useAdminQuery } from './useAdminQuery';

const replyHref = (m: ContactMessage) =>
    `mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}&body=${encodeURIComponent(
        `Hi ${m.name.split(' ')[0]},\n\n\n\n— RentNest Support\n\n> ${m.message.split('\n').join('\n> ')}`,
    )}`;

function ContactMessagesTab() {
    const query = useAdminQuery<ContactMessage[]>(adminKeys.messages, adminApi.messages);
    const cache = useAdminCache<ContactMessage>(adminKeys.messages);
    const [openId, setOpenId] = useState<string | null>(null);
    const [toDelete, setToDelete] = useState<ContactMessage | null>(null);
    const [deleting, setDeleting] = useState(false);

    const messages = useMemo(() => query.data ?? [], [query.data]);
    const opened = messages.find((m) => m.id === openId) ?? null;
    const unread = messages.filter((m) => !m.isRead).length;

    const setRead = async (message: ContactMessage, isRead: boolean, silent = false) => {
        if (message.isRead === isRead) return;
        const previous = cache.snapshot();
        cache.patch(message.id, { isRead });
        try {
            await adminApi.markMessage(message.id, isRead);
            cache.invalidateStats();
            if (!silent) toast.success(isRead ? 'Marked as read' : 'Marked as unread');
        } catch (error) {
            cache.restore(previous);
            toast.error(errorMessage(error, 'Could not update the message'));
        }
    };

    const openMessage = (message: ContactMessage) => {
        setOpenId(message.id);
        void setRead(message, true, true);
    };

    const confirmDelete = async () => {
        if (!toDelete) return;
        setDeleting(true);
        try {
            await adminApi.deleteMessage(toDelete.id);
            cache.remove(toDelete.id);
            cache.invalidateStats();
            toast.success('Message deleted');
            if (openId === toDelete.id) setOpenId(null);
            setToDelete(null);
        } catch (error) {
            toast.error(errorMessage(error, 'Could not delete this message'));
        } finally {
            setDeleting(false);
        }
    };

    // Rebuilt every render on purpose: the cell handlers close over the latest cache state.
    const columns: ColumnDef<ContactMessage>[] = [
        {
            id: 'sender',
            header: 'From',
            accessorFn: (m) => `${m.name} ${m.email}`,
            cell: ({ row }) => (
                <div className="min-w-[160px]">
                    <p className={cn('truncate text-sm text-foreground', !row.original.isRead && 'font-semibold')}>{row.original.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{row.original.email}</p>
                </div>
            ),
        },
        {
            id: 'subject',
            header: 'Message',
            accessorFn: (m) => `${m.subject} ${m.message}`,
            enableSorting: false,
            cell: ({ row }) => (
                <button type="button" onClick={() => openMessage(row.original)} className="block min-w-[220px] max-w-md text-left">
                    <span className={cn('line-clamp-1 text-sm text-foreground hover:text-primary', !row.original.isRead && 'font-semibold')}>
                        {row.original.subject}
                    </span>
                    <span className="line-clamp-1 text-xs text-muted-foreground">{row.original.message}</span>
                </button>
            ),
        },
        {
            id: 'status',
            header: 'Status',
            accessorFn: (m) => (m.isRead ? 'READ' : 'UNREAD'),
            filterFn: 'equalsString',
            enableGlobalFilter: false,
            cell: ({ getValue }) => <StatusBadge status={getValue<string>()} />,
        },
        {
            id: 'received',
            header: 'Received',
            enableGlobalFilter: false,
            accessorFn: (m) => m.createdAt,
            cell: ({ row }) => (
                <span className="whitespace-nowrap text-sm text-muted-foreground">
                    {formatDate(row.original.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
            ),
        },
        {
            id: 'actions',
            header: '',
            enableSorting: false,
            cell: ({ row }) => {
                const m = row.original;
                return (
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon-sm" className="rounded-xl" aria-label={`Open message from ${m.name}`} onClick={() => openMessage(m)}>
                            <MailOpen />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            className="rounded-xl"
                            aria-label={m.isRead ? 'Mark as unread' : 'Mark as read'}
                            title={m.isRead ? 'Mark as unread' : 'Mark as read'}
                            onClick={() => setRead(m, !m.isRead)}
                        >
                            {m.isRead ? <Mail /> : <MailOpen className="text-primary" />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            className="rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            aria-label={`Delete message from ${m.name}`}
                            onClick={() => setToDelete(m)}
                        >
                            <Trash2 />
                        </Button>
                    </div>
                );
            },
        },
    ];

    if (query.isPending) return <TableSkeleton columns={5} />;
    if (query.isError) return <ErrorState message={errorMessage(query.error)} onRetry={() => query.refetch()} retrying={query.isFetching} />;

    return (
        <div className="space-y-4">
            {messages.length === 0 ? (
                <EmptyState icon={Inbox} title="Inbox is empty" description="Messages sent through the Contact page will land here." />
            ) : (
                <>
                    <CountPills
                        items={[
                            { label: 'Messages', value: messages.length },
                            { label: 'Unread', value: unread },
                        ]}
                    />
                    <AppDataTable
                        columns={columns}
                        data={messages}
                        searchPlaceholder="Search name, email, subject or message…"
                        filters={[
                            {
                                columnId: 'status',
                                placeholder: 'All messages',
                                options: [
                                    { label: 'Unread', value: 'UNREAD' },
                                    { label: 'Read', value: 'READ' },
                                ],
                            },
                        ]}
                        emptyMessage="No messages match your search or filters."
                    />
                </>
            )}

            <Dialog open={!!opened} onOpenChange={(open) => !open && setOpenId(null)}>
                <DialogContent className="rounded-2xl sm:max-w-xl">
                    {opened && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="pr-8 font-serif text-lg leading-snug tracking-tight">{opened.subject}</DialogTitle>
                                <DialogDescription>
                                    From <span className="font-medium text-foreground">{opened.name}</span> &lt;{opened.email}&gt; ·{' '}
                                    {formatDate(opened.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="max-h-[50vh] overflow-y-auto rounded-xl border border-border bg-muted/40 p-4">
                                <p className="whitespace-pre-line break-words text-sm leading-relaxed text-foreground">{opened.message}</p>
                            </div>
                            <DialogFooter className="rounded-b-2xl sm:justify-between">
                                <div className="flex flex-col-reverse gap-2 sm:flex-row">
                                    <Button variant="destructive" className="rounded-xl" onClick={() => setToDelete(opened)}>
                                        <Trash2 />
                                        Delete
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="rounded-xl"
                                        onClick={() => {
                                            void setRead(opened, false);
                                            setOpenId(null);
                                        }}
                                    >
                                        <Mail />
                                        Mark unread
                                    </Button>
                                </div>
                                <Button asChild className="rounded-xl">
                                    <a href={replyHref(opened)}>
                                        <Reply />
                                        Reply by email
                                    </a>
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={!!toDelete}
                onOpenChange={(open) => !open && setToDelete(null)}
                title="Delete this message?"
                description={`"${toDelete?.subject}" from ${toDelete?.name} will be permanently removed.`}
                confirmLabel="Delete message"
                destructive
                loading={deleting}
                onConfirm={confirmDelete}
            />
        </div>
    );
}

const subscriberColumns: ColumnDef<NewsletterSubscriber>[] = [
    {
        id: 'email',
        header: 'Email',
        accessorFn: (s) => s.email,
        cell: ({ getValue }) => (
            <a href={`mailto:${getValue<string>()}`} className="break-all text-sm text-foreground hover:text-primary">
                {getValue<string>()}
            </a>
        ),
    },
    {
        id: 'subscribed',
        header: 'Subscribed',
        enableGlobalFilter: false,
        accessorFn: (s) => s.createdAt,
        cell: ({ row }) => <span className="whitespace-nowrap text-sm text-muted-foreground">{formatDate(row.original.createdAt)}</span>,
    },
];

function SubscribersTab() {
    const query = useAdminQuery<NewsletterSubscriber[]>(adminKeys.subscribers, adminApi.subscribers);
    const subscribers = useMemo(() => query.data ?? [], [query.data]);
    const allEmails = useMemo(() => subscribers.map((s) => s.email).join(', '), [subscribers]);

    if (query.isPending) return <TableSkeleton columns={2} />;
    if (query.isError) return <ErrorState message={errorMessage(query.error)} onRetry={() => query.refetch()} retrying={query.isFetching} />;
    if (subscribers.length === 0) {
        return <EmptyState icon={Newspaper} title="No subscribers yet" description="Visitors who join the newsletter from the site footer appear here." />;
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CountPills items={[{ label: 'Subscribers', value: subscribers.length }]} />
                <CopyButton value={allEmails} label="Copy all subscriber emails" successMessage={`${subscribers.length} emails copied`}>
                    Copy all emails
                </CopyButton>
            </div>
            <AppDataTable
                columns={subscriberColumns}
                data={subscribers}
                searchPlaceholder="Search subscribers…"
                emptyMessage="No subscribers match your search."
            />
        </div>
    );
}

export function AdminMessagesView() {
    const messages = useAdminQuery<ContactMessage[]>(adminKeys.messages, adminApi.messages);
    const unread = messages.data?.filter((m) => !m.isRead).length ?? 0;

    return (
        <div className="space-y-6">
            <DashboardPageHeader title="Messages" description="Questions from the Contact page and the newsletter audience." />
            <Tabs defaultValue="messages" className="gap-4">
                <TabsList className="h-10 w-full rounded-xl sm:w-fit">
                    <TabsTrigger value="messages" className="rounded-lg px-3">
                        <Inbox />
                        <span className="sm:hidden">Messages</span>
                        <span className="hidden sm:inline">Contact messages</span>
                        {unread > 0 && (
                            <span className="ml-1 rounded-full bg-highlight px-1.5 text-[11px] font-semibold text-highlight-foreground">{unread}</span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="subscribers" className="rounded-lg px-3">
                        <Newspaper />
                        <span className="sm:hidden">Subscribers</span>
                        <span className="hidden sm:inline">Newsletter subscribers</span>
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="messages">
                    <ContactMessagesTab />
                </TabsContent>
                <TabsContent value="subscribers">
                    <SubscribersTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}
