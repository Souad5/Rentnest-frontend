import type { Metadata } from 'next';
import Link from 'next/link';
import { Clock, Mail, MessageSquareText, Phone } from 'lucide-react';
import { Container } from '@/components/shared/Container';
import { PageHero } from '@/components/content/PageHero';
import { HelpCenter } from '@/components/content/HelpCenter';
import { OpenChatButton } from '@/components/ai/OpenChatButton';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
    title: 'Help center',
    description:
        'Answers to common questions about renting, listing, payments and accounts on RentNest — plus ways to reach our support team.',
};

export default function HelpPage() {
    const phoneHref = `tel:${siteConfig.contact.phone.replace(/[^\d+]/g, '')}`;

    return (
        <>
            <PageHero
                eyebrow="Help center"
                title="How can we help?"
                description="Search our answers about requesting a home, approvals, Stripe payments, listing a property and managing your account."
            />

            <section className="py-16 sm:py-20">
                <Container>
                    <HelpCenter />
                </Container>
            </section>

            <section className="pb-16 sm:pb-20">
                <Container>
                    <div className="overflow-hidden rounded-2xl bg-ink text-ink-foreground shadow-sm">
                        <div className="grid gap-10 p-8 sm:p-10 lg:grid-cols-[1.2fr_1fr] lg:p-12">
                            <div className="space-y-5">
                                <div className="space-y-3">
                                    <p className="text-sm font-medium text-highlight">Still need help?</p>
                                    <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
                                        Talk to us, or ask the assistant
                                    </h2>
                                    <p className="max-w-xl text-sm leading-relaxed text-ink-foreground/75 sm:text-base">
                                        Our AI assistant answers instantly and can suggest available homes. For anything about a
                                        specific request, payment or your account, our support team will reply by email.
                                    </p>
                                </div>
                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <OpenChatButton />
                                    <Link
                                        href="/contact"
                                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-ink-foreground/25 px-5 text-sm font-semibold text-ink-foreground transition-colors hover:bg-ink-foreground/10"
                                    >
                                        <MessageSquareText className="h-4 w-4" />
                                        Contact support
                                    </Link>
                                </div>
                            </div>
                            <ul className="grid content-start gap-3 text-sm">
                                <li>
                                    <a
                                        href={`mailto:${siteConfig.contact.email}`}
                                        className="flex items-center gap-3 rounded-xl bg-ink-foreground/5 p-4 transition-colors hover:bg-ink-foreground/10"
                                    >
                                        <Mail className="h-5 w-5 shrink-0 text-highlight" />
                                        <span>
                                            <span className="block text-xs text-ink-foreground/60">Email</span>
                                            <span className="font-medium break-all">{siteConfig.contact.email}</span>
                                        </span>
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href={phoneHref}
                                        className="flex items-center gap-3 rounded-xl bg-ink-foreground/5 p-4 transition-colors hover:bg-ink-foreground/10"
                                    >
                                        <Phone className="h-5 w-5 shrink-0 text-highlight" />
                                        <span>
                                            <span className="block text-xs text-ink-foreground/60">Phone</span>
                                            <span className="font-medium">{siteConfig.contact.phone}</span>
                                        </span>
                                    </a>
                                </li>
                                <li className="flex items-center gap-3 rounded-xl bg-ink-foreground/5 p-4">
                                    <Clock className="h-5 w-5 shrink-0 text-highlight" />
                                    <span>
                                        <span className="block text-xs text-ink-foreground/60">Support hours</span>
                                        <span className="font-medium">{siteConfig.contact.hours}</span>
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </Container>
            </section>
        </>
    );
}
