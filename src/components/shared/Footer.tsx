import Link from 'next/link';
import { Mail, MapPin, Phone, Clock } from 'lucide-react';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter } from 'react-icons/fa6';
import { siteConfig } from '@/config/site';
import { Container } from './Container';
import { Logo } from './Logo';
import { NewsletterForm } from './NewsletterForm';

const socialIcons = [FaFacebookF, FaXTwitter, FaInstagram, FaLinkedinIn];

function LinkColumn({ title, links }: { title: string; links: ReadonlyArray<{ label: string; href: string }> }) {
    return (
        <div>
            <h3 className="mb-4 text-sm font-semibold text-ink-foreground">{title}</h3>
            <ul className="space-y-2.5 text-sm">
                {links.map((link) => (
                    <li key={link.href}>
                        <Link href={link.href} className="text-ink-foreground/70 transition-colors hover:text-ink-foreground">
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default function Footer() {
    const year = new Date().getFullYear();
    const { contact } = siteConfig;

    return (
        <footer className="mt-auto bg-ink text-ink-foreground">
            <Container className="py-14">
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
                    <div className="space-y-5 lg:col-span-4">
                        <Logo inverted />
                        <p className="max-w-sm text-sm leading-relaxed text-ink-foreground/70">{siteConfig.description}</p>
                        <ul className="space-y-2.5 text-sm text-ink-foreground/80">
                            <li className="flex items-start gap-2.5">
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {contact.address}
                            </li>
                            <li>
                                <a href={`mailto:${contact.email}`} className="flex items-center gap-2.5 hover:text-ink-foreground">
                                    <Mail className="h-4 w-4 shrink-0 text-primary" /> {contact.email}
                                </a>
                            </li>
                            <li>
                                <a href={`tel:${contact.phone.replace(/[^+\d]/g, '')}`} className="flex items-center gap-2.5 hover:text-ink-foreground">
                                    <Phone className="h-4 w-4 shrink-0 text-primary" /> {contact.phone}
                                </a>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <Clock className="h-4 w-4 shrink-0 text-primary" /> {contact.hours}
                            </li>
                        </ul>
                    </div>

                    <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-5">
                        <LinkColumn title="Explore" links={siteConfig.footerNav.explore} />
                        <LinkColumn title="Company" links={siteConfig.footerNav.company} />
                        <LinkColumn title="Support" links={siteConfig.footerNav.support} />
                    </div>

                    <div className="space-y-4 lg:col-span-3">
                        <h3 className="text-sm font-semibold text-ink-foreground">Get new listings by email</h3>
                        <p className="text-sm text-ink-foreground/70">A short monthly roundup of fresh homes and renting tips. Unsubscribe anytime.</p>
                        <NewsletterForm tone="ink" />
                        <div className="flex gap-2 pt-2">
                            {siteConfig.social.map((social, i) => {
                                const Icon = socialIcons[i] ?? FaFacebookF;
                                return (
                                    <a
                                        key={social.href}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={social.label}
                                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-ink-foreground/15 text-ink-foreground/80 transition-colors hover:bg-primary hover:text-primary-foreground"
                                    >
                                        <Icon className="h-3.5 w-3.5" />
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </Container>
            <div className="border-t border-ink-foreground/10">
                <Container className="flex flex-col items-center justify-between gap-3 py-5 text-xs text-ink-foreground/60 sm:flex-row">
                    <p>© {year} {siteConfig.name}. All rights reserved.</p>
                    <div className="flex gap-5">
                        <Link href="/privacy" className="hover:text-ink-foreground">Privacy</Link>
                        <Link href="/terms" className="hover:text-ink-foreground">Terms</Link>
                        <Link href="/help" className="hover:text-ink-foreground">Help</Link>
                    </div>
                </Container>
            </div>
        </footer>
    );
}

export { Footer };
