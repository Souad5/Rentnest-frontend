'use client';

import Link from 'next/link';
import { ArrowRight, Flame } from 'lucide-react';
import { Container } from '@/components/shared/Container';
import { EmptyState } from '@/components/shared/EmptyState';
import PropertyCard, { PropertyCardSkeleton } from '@/components/shared/PropertyCard';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Button } from '@/components/ui/button';
import { propertiesApi } from '@/lib/api';
import { Reveal } from './Reveal';
import { SectionError } from './SectionError';
import { useAsync } from './useAsync';

export function TrendingSection({ id }: { id: string }) {
    const { data, error, loading, retry } = useAsync(() => propertiesApi.trending(8).then((res) => res.data ?? []));

    return (
        <section id={id} className="scroll-mt-20 bg-background py-16 sm:py-20">
            <Container>
                <Reveal>
                    <SectionHeading
                        eyebrow="Trending now"
                        title="Homes renters are requesting this month"
                        description="Ranked by rental requests over the last 30 days, so you see what is genuinely in demand right now."
                        action={
                            <Button asChild variant="outline" className="h-10 rounded-xl px-4">
                                <Link href="/properties?sort=popular">
                                    View all <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        }
                    />
                </Reveal>

                {loading ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-busy="true" aria-label="Loading trending homes">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <PropertyCardSkeleton key={i} />
                        ))}
                    </div>
                ) : error ? (
                    <SectionError title="Couldn't load trending homes" message={error} onRetry={retry} />
                ) : !data || data.length === 0 ? (
                    <EmptyState
                        icon={Flame}
                        title="No trending homes yet"
                        description="As soon as landlords publish listings and renters start requesting dates, the most popular homes will appear here."
                        action={
                            <Button asChild className="h-10 rounded-xl px-4">
                                <Link href="/properties">Browse all homes</Link>
                            </Button>
                        }
                    />
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {data.map((property, i) => (
                            <Reveal key={property.id} delay={(i % 4) * 0.06} className="h-full">
                                <PropertyCard property={property} />
                            </Reveal>
                        ))}
                    </div>
                )}
            </Container>
        </section>
    );
}
