'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, ClipboardCheck, LayoutDashboard, MessageCircle, PenLine, Wallet } from 'lucide-react';
import { Container } from '@/components/shared/Container';
import { Button } from '@/components/ui/button';
import { dashboardHomeFor } from '@/config/site';
import { useAuth } from '@/providers/AuthProvider';
import { Reveal } from './Reveal';

const POINTS = [
    'Free to list — publish photos, rent, size and amenities in minutes',
    'Approve only the dates that work for you; double-bookings are blocked',
    'First month’s rent collected online through Stripe',
    'Earnings, requests and reviews tracked in one dashboard',
];

const TOOLS = [
    { icon: PenLine, label: 'AI listing writer' },
    { icon: ClipboardCheck, label: 'Request queue' },
    { icon: Wallet, label: 'Payment history' },
    { icon: LayoutDashboard, label: 'Earnings dashboard' },
];

export function LandlordCTA() {
    const { user } = useAuth();
    const isManager = user?.role === 'LANDLORD' || user?.role === 'ADMIN';

    const primary = isManager
        ? { label: 'Go to your dashboard', href: dashboardHomeFor(user?.role) }
        : { label: 'Become a landlord', href: '/register?role=LANDLORD' };
    const secondary =
        user?.role === 'LANDLORD'
            ? { label: 'Add a new listing', href: '/dashboard/landlord/properties/new', icon: ArrowRight }
            : { label: 'Talk to our team', href: '/contact', icon: MessageCircle };

    return (
        <section className="bg-background py-16 sm:py-20">
            <Container>
                <Reveal>
                    <div className="grid overflow-hidden rounded-3xl bg-primary text-primary-foreground shadow-lg lg:grid-cols-2">
                        <div className="p-7 sm:p-10 lg:p-12">
                            <p className="text-sm font-medium text-primary-foreground/75">For landlords</p>
                            <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                                {user?.role === 'LANDLORD'
                                    ? `Welcome back, ${user.name.split(' ')[0]}. Your tenants are waiting.`
                                    : 'Rent out your property to tenants who are ready to pay.'}
                            </h2>
                            <p className="mt-4 max-w-lg text-sm leading-relaxed text-primary-foreground/85 sm:text-base">
                                Whether it is a single room in Mirpur or a duplex in Baridhara, RentNest handles the requests, the dates and the
                                first payment — so you spend less time on phone calls and site visits that go nowhere.
                            </p>
                            <ul className="mt-6 space-y-2.5">
                                {POINTS.map((point) => (
                                    <li key={point} className="flex items-start gap-2.5 text-sm">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-highlight" />
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <Button
                                    asChild
                                    className="h-11 rounded-xl bg-primary-foreground px-5 font-semibold text-primary hover:bg-primary-foreground/90"
                                >
                                    <Link href={primary.href}>
                                        {primary.label} <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="h-11 rounded-xl border-primary-foreground/40 bg-transparent px-5 font-semibold text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground dark:border-primary-foreground/40 dark:bg-transparent dark:hover:bg-primary-foreground/10"
                                >
                                    <Link href={secondary.href}>
                                        <secondary.icon className="h-4 w-4" /> {secondary.label}
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        <div className="relative min-h-72 lg:min-h-full">
                            <Image
                                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80"
                                alt="Contemporary house exterior with large glass windows at golden hour"
                                fill
                                sizes="(min-width: 1024px) 50vw, 100vw"
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-ink/60 via-transparent to-transparent lg:bg-linear-to-r lg:from-primary/40 lg:via-transparent" />
                            <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-border bg-card/95 p-4 text-card-foreground shadow-lg backdrop-blur sm:left-auto sm:w-72">
                                <p className="text-sm font-medium text-muted-foreground">Included for every landlord</p>
                                <ul className="mt-3 grid grid-cols-2 gap-2.5">
                                    {TOOLS.map(({ icon: Icon, label }) => (
                                        <li key={label} className="flex items-center gap-2 text-xs font-medium text-foreground">
                                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                <Icon className="h-3.5 w-3.5" />
                                            </span>
                                            {label}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </Reveal>
            </Container>
        </section>
    );
}
