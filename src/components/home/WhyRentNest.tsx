import type { LucideIcon } from 'lucide-react';
import { BadgeCheck, Headset, LayoutDashboard, MessageSquareQuote, ShieldCheck, Sparkles } from 'lucide-react';
import { Container } from '@/components/shared/Container';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { siteConfig } from '@/config/site';
import { Reveal } from './Reveal';

const FEATURES: Array<{ title: string; body: string; icon: LucideIcon }> = [
    {
        title: 'Verified listings',
        body: 'Every listing belongs to a registered landlord account, and our moderation team can pull any listing that misrepresents a home.',
        icon: BadgeCheck,
    },
    {
        title: 'Secure Stripe payments',
        body: 'Rent is paid online through Stripe only after the landlord approves your dates — no advance cash, no bKash screenshots to chase.',
        icon: ShieldCheck,
    },
    {
        title: 'Dashboards for every role',
        body: 'Tenants track requests, payments and reviews; landlords see earnings and requests; admins keep the marketplace healthy.',
        icon: LayoutDashboard,
    },
    {
        title: 'AI-powered search',
        body: 'Type “3 bed near Dhanmondi Lake under $800” and RentNest extracts the area, bedrooms and budget for you.',
        icon: Sparkles,
    },
    {
        title: 'Honest reviews from real tenants',
        body: 'Only tenants with an approved rental for a home can review it, so ratings come from people who actually lived there — not anonymous opinions.',
        icon: MessageSquareQuote,
    },
    {
        title: 'Responsive local support',
        body: `Our Dhaka team answers by email and phone, ${siteConfig.contact.hours}, and the Help Center covers the most common questions any time.`,
        icon: Headset,
    },
];

export function WhyRentNest() {
    return (
        <section className="bg-muted/40 py-16 sm:py-20">
            <Container>
                <Reveal>
                    <SectionHeading
                        eyebrow="Why RentNest"
                        title="Built to make renting in Bangladesh feel safe"
                        description="We focused on the parts of renting that usually go wrong — unclear listings, risky advance payments and zero accountability — and fixed them."
                    />
                </Reveal>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {FEATURES.map(({ title, body, icon: Icon }, i) => (
                        <Reveal key={title} delay={(i % 3) * 0.07} className="h-full">
                            <div className="group flex h-full gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                    <Icon className="h-5 w-5" />
                                </span>
                                <div>
                                    <h3 className="font-serif text-lg font-semibold tracking-tight text-foreground">{title}</h3>
                                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </Container>
        </section>
    );
}
