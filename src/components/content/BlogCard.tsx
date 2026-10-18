import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Clock } from 'lucide-react';
import type { BlogPost } from '@/content/blog';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';

export function BlogCard({ post, featured = false, className }: { post: BlogPost; featured?: boolean; className?: string }) {
    return (
        <article
            className={cn(
                'group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md',
                featured && 'lg:grid lg:grid-cols-2',
                className,
            )}
        >
            <div className={cn('relative aspect-[16/10] overflow-hidden bg-muted', featured && 'lg:aspect-auto lg:min-h-80')}>
                <Image
                    src={post.coverImage}
                    alt=""
                    fill
                    sizes={featured ? '(min-width: 1024px) 50vw, 100vw' : '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'}
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-3 left-3 rounded-full bg-card/90 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur">
                    {post.category}
                </span>
            </div>
            <div className={cn('flex flex-1 flex-col gap-3 p-5 sm:p-6', featured && 'lg:justify-center lg:p-10')}>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <time dateTime={post.date}>{formatDate(post.date, { dateStyle: 'long', timeZone: 'UTC' })}</time>
                    <span aria-hidden>·</span>
                    <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {post.readMinutes} min read
                    </span>
                </div>
                <h3
                    className={cn(
                        'font-serif font-semibold tracking-tight text-foreground group-hover:text-primary',
                        featured ? 'text-2xl sm:text-3xl' : 'text-xl',
                    )}
                >
                    <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
                        {post.title}
                    </Link>
                </h3>
                <p className={cn('text-sm leading-relaxed text-muted-foreground', !featured && 'line-clamp-3')}>{post.excerpt}</p>
                <div className="mt-auto flex items-center justify-between pt-2 text-sm">
                    <span className="font-medium text-foreground">{post.author}</span>
                    <span className="flex items-center gap-1 font-semibold text-primary">
                        Read article <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                </div>
            </div>
        </article>
    );
}
