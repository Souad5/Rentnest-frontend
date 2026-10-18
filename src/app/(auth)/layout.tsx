import Image from 'next/image';
import Link from 'next/link';
import { CalendarCheck, LayoutDashboard, ShieldCheck, Sparkles } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { siteConfig } from '@/config/site';

const valueProps = [
    {
        icon: CalendarCheck,
        title: 'Request first, pay after approval',
        text: 'Send your dates for free. You only pay the first month’s rent once the landlord says yes.',
    },
    {
        icon: ShieldCheck,
        title: 'Secure payments with Stripe',
        text: 'Card details go straight to Stripe and never touch RentNest’s servers.',
    },
    {
        icon: LayoutDashboard,
        title: 'One dashboard for everything',
        text: 'Requests, approvals, payments and reviews — for tenants and landlords alike.',
    },
    {
        icon: Sparkles,
        title: 'An AI assistant that knows the listings',
        text: 'Describe the home you want and get matching available properties in seconds.',
    },
];

const PANEL_IMAGE = 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1400&q=80';

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="grid min-h-dvh flex-1 bg-background lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,5fr)_minmax(0,4fr)]">
            {/* Form column */}
            <div className="flex min-w-0 flex-col">
                <header className="flex h-16 items-center justify-between gap-4 px-4 sm:px-8">
                    <Logo />
                    <ThemeToggle />
                </header>
                <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-8">
                    <div className="w-full max-w-md">{children}</div>
                </main>
                <footer className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 pb-6 text-xs text-muted-foreground">
                    <span>
                        © {new Date().getFullYear()} {siteConfig.name}
                    </span>
                    <Link href="/privacy" className="hover:text-foreground">
                        Privacy
                    </Link>
                    <Link href="/terms" className="hover:text-foreground">
                        Terms
                    </Link>
                    <Link href="/help" className="hover:text-foreground">
                        Help
                    </Link>
                </footer>
            </div>

            {/* Brand panel (desktop) */}
            <aside className="relative hidden overflow-hidden bg-ink text-ink-foreground lg:block">
                <Image
                    src={PANEL_IMAGE}
                    alt="Bright, furnished apartment living room"
                    fill
                    priority
                    sizes="(min-width: 1280px) 45vw, 50vw"
                    className="object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/85 to-ink/40" aria-hidden />
                <div className="relative flex h-full flex-col justify-end gap-10 p-10 xl:p-14">
                    <div className="space-y-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-highlight">{siteConfig.name}</p>
                        <h2 className="max-w-md font-serif text-4xl font-semibold leading-tight tracking-tight">
                            {siteConfig.tagline}.
                        </h2>
                        <p className="max-w-md text-sm leading-relaxed text-ink-foreground/75">{siteConfig.description}</p>
                    </div>
                    <ul className="grid max-w-lg gap-5">
                        {valueProps.map(({ icon: Icon, title, text }) => (
                            <li key={title} className="flex gap-4">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink-foreground/10 text-highlight">
                                    <Icon className="h-5 w-5" />
                                </span>
                                <div>
                                    <p className="text-sm font-semibold">{title}</p>
                                    <p className="mt-0.5 text-sm leading-relaxed text-ink-foreground/70">{text}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>
        </div>
    );
}
