'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
    ArrowRight,
    CalendarRange,
    ClipboardCheck,
    CreditCard,
    KeyRound,
    LayoutDashboard,
    PenLine,
    Search,
    Wallet,
} from 'lucide-react';
import { Container } from '@/components/shared/Container';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Reveal } from './Reveal';

interface Step {
    title: string;
    body: string;
    icon: LucideIcon;
}

const FLOWS: Record<'tenants' | 'landlords', { steps: Step[]; cta: { label: string; href: string } }> = {
    tenants: {
        steps: [
            {
                title: 'Search & shortlist',
                body: 'Describe what you need in plain words — area, budget, bedrooms — and AI suggestions turn it into filters. Compare photos, amenities and real tenant ratings.',
                icon: Search,
            },
            {
                title: 'Request your dates',
                body: 'Pick a move-in and move-out date and send a rental request. Dates that clash with an existing approved booking are blocked automatically.',
                icon: CalendarRange,
            },
            {
                title: 'Get approved, pay securely',
                body: 'The landlord reviews and approves your request. Pay the first month from your dashboard through Stripe — your card details never touch our servers.',
                icon: CreditCard,
            },
            {
                title: 'Move in & review',
                body: 'Track the rental and every receipt in your tenant dashboard, then leave an honest review to help the next renter choose well.',
                icon: KeyRound,
            },
        ],
        cta: { label: 'Start searching', href: '/properties' },
    },
    landlords: {
        steps: [
            {
                title: 'List your property',
                body: 'Add photos, rent, bedrooms, size and amenities. Stuck on the description? The AI listing writer drafts one from your details in seconds.',
                icon: PenLine,
            },
            {
                title: 'Review requests',
                body: 'See each tenant’s requested dates in one queue and approve or decline. Overlapping approvals are prevented, so you never double-book.',
                icon: ClipboardCheck,
            },
            {
                title: 'Get paid',
                body: 'Approved tenants pay the first month online via Stripe. Every payment is recorded against the rental with its transaction ID.',
                icon: Wallet,
            },
            {
                title: 'Manage from your dashboard',
                body: 'Earnings charts, request status, top-performing listings and availability toggles — your whole portfolio on one screen.',
                icon: LayoutDashboard,
            },
        ],
        cta: { label: 'List your property', href: '/register?role=LANDLORD' },
    },
};

function StepGrid({ steps }: { steps: Step[] }) {
    return (
        <ol className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Connecting line on large screens */}
            <span aria-hidden className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-12 hidden h-px bg-border lg:block" />
            {steps.map(({ title, body, icon: Icon }, i) => (
                <li key={title} className="relative">
                    <Reveal delay={i * 0.08} className="h-full">
                        <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                                    <Icon className="h-6 w-6" />
                                    <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-highlight text-[11px] font-bold text-highlight-foreground">
                                        {i + 1}
                                    </span>
                                </span>
                                <h3 className="font-serif text-lg font-semibold leading-snug tracking-tight text-foreground">{title}</h3>
                            </div>
                            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{body}</p>
                        </div>
                    </Reveal>
                </li>
            ))}
        </ol>
    );
}

export function HowItWorks() {
    return (
        <section id="how-it-works" className="scroll-mt-20 bg-background py-16 sm:py-20">
            <Container>
                <Reveal>
                    <SectionHeading
                        align="center"
                        eyebrow="How it works"
                        title="From first search to move-in day"
                        description="One transparent flow for both sides of the rental — no middlemen, no cash handovers, no lost paperwork."
                    />
                </Reveal>

                <Tabs defaultValue="tenants" className="flex-col items-center gap-8">
                    <TabsList className="h-12 rounded-xl p-1 group-data-horizontal/tabs:h-12">
                        <TabsTrigger value="tenants" className="rounded-lg px-5 text-sm">
                            For tenants
                        </TabsTrigger>
                        <TabsTrigger value="landlords" className="rounded-lg px-5 text-sm">
                            For landlords
                        </TabsTrigger>
                    </TabsList>

                    {(Object.keys(FLOWS) as Array<keyof typeof FLOWS>).map((key) => (
                        <TabsContent key={key} value={key} className="w-full">
                            <StepGrid steps={FLOWS[key].steps} />
                            <div className="mt-8 flex justify-center">
                                <Button asChild className="h-11 rounded-xl px-5 font-semibold">
                                    <Link href={FLOWS[key].cta.href}>
                                        {FLOWS[key].cta.label} <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>
            </Container>
        </section>
    );
}
