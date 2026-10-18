'use client';

import Link from 'next/link';
import { MapPin, MessageSquareQuote, Quote, Star } from 'lucide-react';
import { Container } from '@/components/shared/Container';
import { EmptyState } from '@/components/shared/EmptyState';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Skeleton } from '@/components/ui/skeleton';
import { reviewsApi } from '@/lib/api';
import { formatDate, initials } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Reveal } from './Reveal';
import { SectionError } from './SectionError';
import { useAsync } from './useAsync';

function Stars({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5" role="img" aria-label={`Rated ${rating} out of 5`}>
            {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={cn('h-4 w-4', i < Math.round(rating) ? 'fill-highlight text-highlight' : 'text-border')} />
            ))}
        </div>
    );
}

export function Testimonials() {
    const { data, error, loading, retry } = useAsync(() => reviewsApi.latest(6, 4).then((res) => res.data ?? []));

    return (
        <section className="bg-muted/40 py-16 sm:py-20">
            <Container>
                <Reveal>
                    <SectionHeading
                        align="center"
                        eyebrow="Tenant reviews"
                        title="What renters say after moving in"
                        description="Recent reviews from tenants with an approved rental on RentNest — unedited, and linked to the home they rented."
                    />
                </Reveal>

                {loading ? (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading reviews">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                                <Skeleton className="h-4 w-24 rounded-full" />
                                <Skeleton className="mt-5 h-3 w-full rounded-full" />
                                <Skeleton className="mt-2 h-3 w-full rounded-full" />
                                <Skeleton className="mt-2 h-3 w-2/3 rounded-full" />
                                <div className="mt-6 flex items-center gap-3">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-3 w-24 rounded-full" />
                                        <Skeleton className="h-3 w-32 rounded-full" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <SectionError title="Couldn't load reviews" message={error} onRetry={retry} />
                ) : !data || data.length === 0 ? (
                    <EmptyState
                        icon={MessageSquareQuote}
                        title="No reviews yet"
                        description="Reviews appear here once tenants with an approved rental share their experience."
                    />
                ) : (
                    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {data.map((review, i) => (
                            <li key={review.id} className="min-w-0">
                                <Reveal delay={(i % 3) * 0.07} className="h-full">
                                    <figure className="relative flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm">
                                        <Quote aria-hidden className="absolute right-5 top-5 h-8 w-8 text-primary/15" />
                                        <Stars rating={review.rating} />
                                        <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground">
                                            <p className="line-clamp-6">“{review.comment}”</p>
                                        </blockquote>
                                        <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                                                {initials(review.tenant?.name)}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-foreground">
                                                    {review.tenant?.name ?? 'RentNest tenant'}
                                                    <span className="font-normal text-muted-foreground"> · {formatDate(review.createdAt, { month: 'short', year: 'numeric' })}</span>
                                                </p>
                                                {review.property && (
                                                    <Link
                                                        href={`/properties/${review.property.id}`}
                                                        className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                                                    >
                                                        <MapPin className="h-3 w-3 shrink-0" />
                                                        <span className="truncate">
                                                            {review.property.title} · {review.property.location}
                                                        </span>
                                                    </Link>
                                                )}
                                            </div>
                                        </figcaption>
                                    </figure>
                                </Reveal>
                            </li>
                        ))}
                    </ul>
                )}
            </Container>
        </section>
    );
}
