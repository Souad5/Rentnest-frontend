import Link from 'next/link';
import { ArrowRight, LifeBuoy, Mail } from 'lucide-react';
import { Container } from '@/components/shared/Container';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';
import { faqs } from '@/content/faq';
import { Accordion } from './Accordion';
import { cn } from '@/lib/utils';
import { Reveal } from './Reveal';
import { toneClass, type SectionTone } from './tone';

export function FaqSection({ tone = 'muted' }: { tone?: SectionTone }) {
    const items = faqs.slice(0, 6);
    if (items.length === 0) return null;

    return (
        <section className={cn(toneClass[tone], 'py-16 sm:py-20')}>
            <Container>
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
                    <Reveal>
                        <SectionHeading
                            eyebrow="FAQ"
                            title="Questions renters and landlords ask us most"
                            description="Quick answers about requests, payments and accounts. Can’t find yours? The Help Center has the full list."
                            className="mb-6"
                        />
                        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-start">
                            <Button asChild className="h-11 rounded-xl px-5 font-semibold">
                                <Link href="/help">
                                    <LifeBuoy className="h-4 w-4" /> Visit help center <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="h-11 rounded-xl px-5">
                                <a href={`mailto:${siteConfig.contact.email}`}>
                                    <Mail className="h-4 w-4" /> {siteConfig.contact.email}
                                </a>
                            </Button>
                        </div>
                    </Reveal>
                    <Reveal delay={0.08}>
                        <Accordion items={items} />
                    </Reveal>
                </div>
            </Container>
        </section>
    );
}
