import type { Metadata } from 'next';
import Link from 'next/link';
import { Clock, ExternalLink, LifeBuoy, Mail, MapPin, Phone } from 'lucide-react';
import { Container } from '@/components/shared/Container';
import { PageHero } from '@/components/content/PageHero';
import { ContactForm } from '@/components/content/ContactForm';
import { OpenChatButton } from '@/components/ai/OpenChatButton';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
    title: 'Contact us',
    description: `Get in touch with the ${siteConfig.name} support team by email, phone or the contact form. We're based in Gulshan, Dhaka.`,
};

export default function ContactPage() {
    const { email, phone, address, hours } = siteConfig.contact;
    const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

    const cards = [
        {
            icon: Mail,
            title: 'Email',
            body: <span className="break-all">{email}</span>,
            href: `mailto:${email}`,
            cta: 'Send an email',
        },
        {
            icon: Phone,
            title: 'Phone',
            body: phone,
            href: `tel:${phone.replace(/[^\d+]/g, '')}`,
            cta: 'Call us',
        },
        {
            icon: MapPin,
            title: 'Office',
            body: address,
            href: mapsHref,
            cta: 'Open in Google Maps',
            external: true,
        },
        { icon: Clock, title: 'Support hours', body: hours },
    ];

    return (
        <>
            <PageHero
                eyebrow="Contact"
                title="We’re here to help"
                description="Questions about a listing, a rental request or a payment? Send us a message and a real person from our Dhaka team will reply."
            />

            <section className="py-16 sm:py-20">
                <Container className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
                    <div className="space-y-4">
                        {cards.map(({ icon: Icon, title, body, href, cta, external }) => (
                            <div key={title} className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <Icon className="h-5 w-5" />
                                </span>
                                <div className="min-w-0 space-y-1">
                                    <h2 className="text-sm font-semibold text-foreground">{title}</h2>
                                    <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
                                    {href && (
                                        <a
                                            href={href}
                                            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                                            className="inline-flex items-center gap-1 pt-1 text-sm font-semibold text-primary hover:underline"
                                        >
                                            {cta}
                                            {external && <ExternalLink className="h-3.5 w-3.5" aria-hidden />}
                                            {external && <span className="sr-only">(opens in a new tab)</span>}
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}

                        <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-5">
                            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                <LifeBuoy className="h-4 w-4 text-primary" /> Looking for a quick answer?
                            </h2>
                            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                Most questions about requests, approvals and payments are answered in our{' '}
                                <Link href="/help" className="font-medium text-primary hover:underline">
                                    help center
                                </Link>
                                , or ask the AI assistant right now.
                            </p>
                            <OpenChatButton className="mt-4 h-10 w-full sm:w-auto" />
                        </div>
                    </div>

                    <ContactForm />
                </Container>
            </section>
        </>
    );
}
