import Link from 'next/link';
import { ChevronDown, Mail } from 'lucide-react';
import { Container } from '@/components/shared/Container';
import { PageHero } from './PageHero';
import { siteConfig } from '@/config/site';

export interface LegalSection {
    id: string;
    title: string;
    paragraphs?: string[];
    bullets?: string[];
    /** Paragraphs rendered after the bullet list. */
    after?: string[];
}

interface LegalDocumentProps {
    eyebrow: string;
    title: string;
    lastUpdated: string;
    intro: string;
    sections: LegalSection[];
    related: { href: string; label: string };
}

/** Long-form policy layout: hero, sticky table of contents (desktop), numbered sections. */
export function LegalDocument({ eyebrow, title, lastUpdated, intro, sections, related }: LegalDocumentProps) {
    const toc = (
        <ol className="space-y-1 text-sm">
            {sections.map((s, i) => (
                <li key={s.id}>
                    <a
                        href={`#${s.id}`}
                        className="flex gap-2 rounded-lg px-2 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                        <span className="w-5 shrink-0 text-right tabular-nums text-primary">{i + 1}.</span>
                        <span>{s.title}</span>
                    </a>
                </li>
            ))}
        </ol>
    );

    return (
        <>
            <PageHero eyebrow={eyebrow} title={title} description={`Last updated: ${lastUpdated}`} />

            <section className="py-12 sm:py-16">
                <Container className="grid grid-cols-1 gap-10 lg:grid-cols-[16rem_minmax(0,1fr)] xl:gap-16">
                    {/* Desktop TOC */}
                    <aside className="hidden lg:block">
                        <nav aria-label="Table of contents" className="sticky top-24 max-h-[calc(100dvh-8rem)] overflow-y-auto">
                            <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">On this page</p>
                            {toc}
                        </nav>
                    </aside>

                    <div className="min-w-0 max-w-3xl space-y-10">
                        {/* Mobile TOC */}
                        <details className="group rounded-2xl border border-border bg-card p-4 shadow-sm lg:hidden">
                            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                                Table of contents
                                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
                            </summary>
                            <nav aria-label="Table of contents" className="mt-3">
                                {toc}
                            </nav>
                        </details>

                        <p className="text-base leading-relaxed text-foreground sm:text-lg">{intro}</p>

                        {sections.map((s, i) => (
                            <section key={s.id} id={s.id} className="scroll-mt-24 space-y-4">
                                <h2 className="font-serif text-2xl font-semibold tracking-tight text-foreground">
                                    <span className="mr-2 text-primary">{i + 1}.</span>
                                    {s.title}
                                </h2>
                                {s.paragraphs?.map((p) => (
                                    <p key={p} className="leading-relaxed text-muted-foreground">
                                        {p}
                                    </p>
                                ))}
                                {s.bullets && (
                                    <ul className="space-y-2.5">
                                        {s.bullets.map((b) => (
                                            <li key={b} className="flex gap-3 leading-relaxed text-muted-foreground">
                                                <span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                                <span>{b}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {s.after?.map((p) => (
                                    <p key={p} className="leading-relaxed text-muted-foreground">
                                        {p}
                                    </p>
                                ))}
                            </section>
                        ))}

                        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm font-semibold text-foreground">Questions about this document?</p>
                                <p className="mt-0.5 text-sm text-muted-foreground">
                                    Email{' '}
                                    <a href={`mailto:${siteConfig.contact.email}`} className="font-medium text-primary hover:underline">
                                        {siteConfig.contact.email}
                                    </a>{' '}
                                    or read our{' '}
                                    <Link href={related.href} className="font-medium text-primary hover:underline">
                                        {related.label}
                                    </Link>
                                    .
                                </p>
                            </div>
                            <Link
                                href="/contact"
                                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground hover:bg-muted"
                            >
                                <Mail className="h-4 w-4" /> Contact us
                            </Link>
                        </div>
                    </div>
                </Container>
            </section>
        </>
    );
}
