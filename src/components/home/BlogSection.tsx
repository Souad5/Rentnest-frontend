import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import { Container } from '@/components/shared/Container';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Button } from '@/components/ui/button';
import { blogPosts } from '@/content/blog';
import { formatDate } from '@/lib/format';
import { canOptimizeImage } from '@/lib/images';
import { cn } from '@/lib/utils';
import { Reveal } from './Reveal';
import { toneClass, type SectionTone } from './tone';

export function BlogSection({ tone = 'plain' }: { tone?: SectionTone }) {
    const latest = [...blogPosts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
    if (latest.length === 0) return null;

    return (
        <section className={cn(toneClass[tone], 'py-16 sm:py-20')}>
            <Container>
                <Reveal>
                    <SectionHeading
                        eyebrow="From the blog"
                        title="Guides for smarter renting"
                        description="Practical advice on neighbourhoods, budgets, contracts and getting the most from your listing."
                        action={
                            <Button asChild variant="outline" className="h-10 rounded-xl px-4">
                                <Link href="/blog">
                                    All articles <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        }
                    />
                </Reveal>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {latest.map((post, i) => (
                        <Reveal key={post.slug} delay={i * 0.07} className="h-full">
                            <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                                <Link href={`/blog/${post.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-muted" tabIndex={-1} aria-hidden>
                                    <Image
                                        src={post.coverImage}
                                        alt=""
                                        fill
                                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                                        unoptimized={!canOptimizeImage(post.coverImage)}
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-[11px] font-semibold text-foreground backdrop-blur">
                                        {post.category}
                                    </span>
                                </Link>
                                <div className="flex flex-1 flex-col p-5">
                                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <time dateTime={post.date}>{formatDate(post.date, { dateStyle: 'medium', timeZone: 'UTC' })}</time>
                                        <span aria-hidden>·</span>
                                        <span className="inline-flex items-center gap-1">
                                            <Clock className="h-3 w-3" /> {post.readMinutes} min read
                                        </span>
                                    </p>
                                    <h3 className="mt-2 line-clamp-2 font-serif text-xl font-semibold leading-snug tracking-tight text-foreground">
                                        <Link href={`/blog/${post.slug}`} className="hover:text-primary focus-visible:text-primary focus-visible:outline-none">
                                            {post.title}
                                        </Link>
                                    </h3>
                                    <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
                                    <Link
                                        href={`/blog/${post.slug}`}
                                        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
                                        aria-label={`Read article: ${post.title}`}
                                    >
                                        Read article <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                    </Link>
                                </div>
                            </article>
                        </Reveal>
                    ))}
                </div>
            </Container>
        </section>
    );
}
