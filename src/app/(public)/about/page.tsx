import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
    BadgeCheck,
    Building2,
    CalendarCheck,
    CreditCard,
    Eye,
    HeartHandshake,
    LayoutDashboard,
    MessageSquareText,
    Search,
    ShieldCheck,
    Sparkles,
    Star,
} from 'lucide-react';
import { Container } from '@/components/shared/Container';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { PageHero } from '@/components/content/PageHero';
import { AboutStats } from '@/components/content/AboutStats';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
    title: 'About us',
    description:
        'RentNest is a Bangladesh-based rental marketplace where tenants request dates, landlords approve, and the first month’s rent is paid securely through Stripe.',
};

const forTenants = [
    { icon: Search, title: 'Search that respects your budget', text: 'Filter by area, category, price, bedrooms and rating, or describe what you want to our AI assistant.' },
    { icon: CalendarCheck, title: 'Request first, pay after approval', text: 'Sending a request is free. You only pay the first month’s rent once the landlord accepts your dates.' },
    { icon: Star, title: 'Reviews from real tenants', text: 'Only tenants with an approved rental can review a property, so ratings reflect real stays.' },
];

const forLandlords = [
    { icon: Building2, title: 'List in minutes', text: 'Add photos, rooms, floor area and amenities — with an AI helper to draft your description.' },
    { icon: LayoutDashboard, title: 'Decide on your terms', text: 'Approve or reject requests from one dashboard. Overlapping dates are blocked automatically.' },
    { icon: CreditCard, title: 'Track every payment', text: 'See first-month payments as they arrive, with monthly earnings and your top properties.' },
];

const values = [
    { icon: Eye, title: 'Transparency', text: 'The rent you see on a listing is the amount you pay through RentNest — calculated by our server, never edited at checkout.' },
    { icon: ShieldCheck, title: 'Safety', text: 'No money moves before approval, and card details go straight to Stripe. We never see or store card numbers.' },
    { icon: HeartHandshake, title: 'Fairness', text: 'Clear statuses — pending, approved, active — that both sides can see, so nobody is left guessing.' },
    { icon: BadgeCheck, title: 'Accountability', text: 'Listings are moderated and reviews are tied to real rentals, so good landlords and tenants stand out.' },
];

export default function AboutPage() {
    return (
        <>
            <PageHero
                eyebrow={`About ${siteConfig.name}`}
                title="Renting in Bangladesh, without the guesswork"
                description="RentNest connects tenants with landlords through a simple, transparent process: request your dates, get approved, pay securely, move in."
            />

            <AboutStats />

            {/* Mission + story */}
            <section className="py-16 sm:py-20">
                <Container className="grid items-center gap-12 lg:grid-cols-2">
                    <div className="space-y-6">
                        <SectionHeading
                            className="mb-0"
                            eyebrow="Our mission"
                            title="Make every rental a clear agreement between two people"
                        />
                        <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
                            <p>
                                Finding a flat in Dhaka has long meant scrolling through social-media groups, calling brokers
                                and handing over a “token” payment before anything was confirmed. Tenants rarely knew who else
                                had been promised the same flat, and landlords spent weeks fielding calls from people who were
                                never going to rent.
                            </p>
                            <p>
                                We built RentNest to put a clear order on that process. A tenant proposes specific dates. The
                                landlord says yes or no. Only then does money move — through Stripe, with a receipt both sides
                                can see. Everything else on the platform, from reviews to dashboards, follows from that
                                simple idea.
                            </p>
                        </div>
                    </div>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted shadow-sm">
                        <Image
                            src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=80"
                            alt="A bright, furnished apartment living area"
                            fill
                            sizes="(min-width: 1024px) 50vw, 100vw"
                            className="object-cover"
                        />
                    </div>
                </Container>
            </section>

            {/* What we do */}
            <section className="border-y border-border bg-muted/40 py-16 sm:py-20">
                <Container>
                    <SectionHeading
                        align="center"
                        eyebrow="What we do"
                        title="Built for both sides of the lease"
                        description="Tenants and landlords use the same platform, with the tools each of them actually needs."
                    />
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {[
                            { heading: 'For tenants', items: forTenants, cta: { href: '/properties', label: 'Explore properties' } },
                            { heading: 'For landlords', items: forLandlords, cta: { href: '/register?role=LANDLORD', label: 'List your property' } },
                        ].map((group) => (
                            <div key={group.heading} className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
                                <h3 className="font-serif text-2xl font-semibold tracking-tight text-foreground">{group.heading}</h3>
                                <ul className="mt-6 flex-1 space-y-5">
                                    {group.items.map(({ icon: Icon, title, text }) => (
                                        <li key={title} className="flex gap-4">
                                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                <Icon className="h-5 w-5" />
                                            </span>
                                            <div>
                                                <p className="text-sm font-semibold text-foreground">{title}</p>
                                                <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    href={group.cta.href}
                                    className="mt-8 inline-flex h-11 items-center justify-center rounded-xl border border-border bg-background px-5 text-sm font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary sm:self-start"
                                >
                                    {group.cta.label}
                                </Link>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* Values */}
            <section className="py-16 sm:py-20">
                <Container>
                    <SectionHeading
                        eyebrow="Our values"
                        title="What we hold ourselves to"
                        description="These aren’t slogans — each one is built into how the platform works."
                    />
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {values.map(({ icon: Icon, title, text }) => (
                            <div key={title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-highlight/20 text-foreground">
                                    <Icon className="h-5 w-5" />
                                </span>
                                <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
                                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* CTA */}
            <section className="pb-16 sm:pb-20">
                <Container>
                    <div className="flex flex-col items-start gap-8 rounded-2xl bg-ink p-8 text-ink-foreground shadow-sm sm:p-12 lg:flex-row lg:items-center lg:justify-between">
                        <div className="max-w-2xl space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-highlight">Get started</p>
                            <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
                                Your next home — or your next tenant — is a request away.
                            </h2>
                            <p className="text-sm leading-relaxed text-ink-foreground/75 sm:text-base">
                                Create a free account in under a minute. Questions first? Our team and our AI assistant are here to help.
                            </p>
                        </div>
                        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row lg:flex-col xl:flex-row">
                            <Link
                                href="/register"
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                            >
                                <Sparkles className="h-4 w-4" /> Create free account
                            </Link>
                            <Link
                                href="/contact"
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-ink-foreground/25 px-6 text-sm font-semibold text-ink-foreground hover:bg-ink-foreground/10"
                            >
                                <MessageSquareText className="h-4 w-4" /> Talk to us
                            </Link>
                        </div>
                    </div>
                </Container>
            </section>
        </>
    );
}
