import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CalendarDays, Clock, Search } from 'lucide-react';
import { Container } from '@/components/shared/Container';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { BlogCard } from '@/components/content/BlogCard';
import { blogPosts, getPost } from '@/content/blog';
import { formatDate, initials } from '@/lib/format';
import { siteConfig } from '@/config/site';

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
    return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const { slug } = await params;
    const post = getPost(slug);
    if (!post) return { title: 'Article not found' };
    return {
        title: post.title,
        description: post.excerpt,
        authors: [{ name: post.author }],
        openGraph: {
            type: 'article',
            title: post.title,
            description: post.excerpt,
            publishedTime: post.date,
            authors: [post.author],
            siteName: siteConfig.name,
            images: [{ url: post.coverImage, width: 1600, alt: post.title }],
        },
        twitter: { card: 'summary_large_image', title: post.title, description: post.excerpt, images: [post.coverImage] },
    };
}

const slugify = (text: string) =>
    text
        .toLowerCase()
        .replace(/[’']/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

export default async function BlogArticlePage({ params }: { params: Params }) {
    const { slug } = await params;
    const post = getPost(slug);
    if (!post) notFound();

    const more = [
        ...blogPosts.filter((p) => p.slug !== post.slug && p.category === post.category),
        ...blogPosts.filter((p) => p.slug !== post.slug && p.category !== post.category),
    ].slice(0, 3);

    return (
        <>
            <article>
                <header className="border-b border-border bg-muted/40">
                    <Container className="py-10 sm:py-14">
                        <div className="mx-auto max-w-3xl space-y-5">
                            <Link
                                href="/blog"
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary"
                            >
                                <ArrowLeft className="h-4 w-4" /> All articles
                            </Link>
                            <p className="text-sm font-medium text-primary">{post.category}</p>
                            <h1 className="font-serif text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
                                {post.title}
                            </h1>
                            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">{post.excerpt}</p>
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-1 text-sm text-muted-foreground">
                                <span className="flex items-center gap-2.5">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                                        {initials(post.author)}
                                    </span>
                                    <span className="font-medium text-foreground">{post.author}</span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <CalendarDays className="h-4 w-4" />
                                    <time dateTime={post.date}>{formatDate(post.date, { dateStyle: 'long', timeZone: 'UTC' })}</time>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Clock className="h-4 w-4" /> {post.readMinutes} min read
                                </span>
                            </div>
                        </div>
                    </Container>
                </header>

                <Container className="pt-8 sm:pt-12">
                    <div className="relative mx-auto aspect-[16/9] max-w-5xl overflow-hidden rounded-2xl bg-muted shadow-sm">
                        <Image
                            src={post.coverImage}
                            alt={post.title}
                            fill
                            priority
                            sizes="(min-width: 1024px) 1024px, 100vw"
                            className="object-cover"
                        />
                    </div>
                </Container>

                <Container className="py-12 sm:py-16">
                    <div className="mx-auto max-w-2xl space-y-10 text-base leading-[1.8] text-foreground/90 sm:text-[1.0625rem]">
                        {post.sections.map((section, i) => (
                            <section key={section.heading ?? i} className="space-y-4">
                                {section.heading && (
                                    <h2
                                        id={slugify(section.heading)}
                                        className="scroll-mt-24 font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
                                    >
                                        {section.heading}
                                    </h2>
                                )}
                                {section.paragraphs.map((paragraph, j) => (
                                    <p key={j} className={i === 0 && j === 0 ? 'text-lg leading-relaxed text-foreground' : undefined}>
                                        {paragraph}
                                    </p>
                                ))}
                                {section.bullets && (
                                    <ul className="space-y-2.5 pl-1">
                                        {section.bullets.map((bullet) => (
                                            <li key={bullet} className="flex gap-3">
                                                <span aria-hidden className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                                <span>{bullet}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </section>
                        ))}

                        <aside className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
                            <h2 className="font-serif text-xl font-semibold tracking-tight text-foreground">
                                Ready to find your next home?
                            </h2>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                Browse available properties, request your dates for free and only pay once the landlord approves.
                            </p>
                            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                                <Link
                                    href="/properties"
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                                >
                                    <Search className="h-4 w-4" /> Explore properties
                                </Link>
                                <Link
                                    href="/register?role=LANDLORD"
                                    className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card px-5 text-sm font-semibold text-foreground hover:bg-muted"
                                >
                                    List your property
                                </Link>
                            </div>
                        </aside>
                    </div>
                </Container>
            </article>

            {more.length > 0 && (
                <section className="border-t border-border bg-muted/30 py-16 sm:py-20">
                    <Container>
                        <SectionHeading
                            eyebrow="Keep reading"
                            title="More articles"
                            action={
                                <Link href="/blog" className="text-sm font-semibold text-primary hover:underline">
                                    View all articles
                                </Link>
                            }
                        />
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {more.map((p) => (
                                <BlogCard key={p.slug} post={p} />
                            ))}
                        </div>
                    </Container>
                </section>
            )}
        </>
    );
}
