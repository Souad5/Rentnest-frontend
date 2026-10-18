import { BellRing, CalendarCheck, Newspaper } from 'lucide-react';
import { Container } from '@/components/shared/Container';
import { NewsletterForm } from '@/components/shared/NewsletterForm';
import { cn } from '@/lib/utils';
import { Reveal } from './Reveal';
import { toneClass, type SectionTone } from './tone';

const PERKS = [
    { icon: BellRing, text: 'New listings in popular areas' },
    { icon: Newspaper, text: 'Renting and landlord guides' },
    { icon: CalendarCheck, text: 'A short roundup, once a month' },
];

export function NewsletterSection({ tone = 'muted' }: { tone?: SectionTone }) {
    return (
        <section className={cn(toneClass[tone], 'py-16 sm:py-20')}>
            <Container>
                <Reveal>
                    <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-10 shadow-sm sm:px-10 sm:py-12">
                        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
                        <div className="relative grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Newsletter</p>
                                <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                                    Be first to hear about new homes
                                </h2>
                                <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
                                    Get a short monthly roundup of fresh listings, neighbourhood guides and RentNest product updates.
                                </p>
                                <ul className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-5">
                                    {PERKS.map(({ icon: Icon, text }) => (
                                        <li key={text} className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                            <Icon className="h-3.5 w-3.5 text-primary" /> {text}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <NewsletterForm />
                                <p className="mt-3 text-xs text-muted-foreground">We only use your email to send the newsletter. No spam, ever.</p>
                            </div>
                        </div>
                    </div>
                </Reveal>
            </Container>
        </section>
    );
}
