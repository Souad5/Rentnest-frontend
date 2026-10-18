'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, MapPin, MapPinned } from 'lucide-react';
import { Container } from '@/components/shared/Container';
import { EmptyState } from '@/components/shared/EmptyState';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Skeleton } from '@/components/ui/skeleton';
import { propertiesApi } from '@/lib/api';
import { canOptimizeImage } from '@/lib/images';
import { Reveal } from './Reveal';
import { SectionError } from './SectionError';
import { useAsync } from './useAsync';

export function LocationsSection() {
    const { data, error, loading, retry } = useAsync(() => propertiesApi.locations(8).then((res) => res.data ?? []));

    return (
        <section className="bg-background py-16 sm:py-20">
            <Container>
                <Reveal>
                    <SectionHeading
                        eyebrow="Popular locations"
                        title="Where renters are looking"
                        description="The neighbourhoods and cities with the most homes open for requests on RentNest right now."
                    />
                </Reveal>

                {loading ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true" aria-label="Loading locations">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <Skeleton key={i} className="aspect-[4/3] w-full rounded-2xl" />
                        ))}
                    </div>
                ) : error ? (
                    <SectionError title="Couldn't load locations" message={error} onRetry={retry} />
                ) : !data || data.length === 0 ? (
                    <EmptyState icon={MapPinned} title="No locations yet" description="Locations will show up here as soon as landlords publish available homes." />
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {data.map((loc, i) => (
                            <Reveal key={loc.location} delay={(i % 4) * 0.05}>
                                <Link
                                    href={`/properties?location=${encodeURIComponent(loc.location)}`}
                                    className="group relative block aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-muted shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    {loc.imageUrl ? (
                                        <Image
                                            src={loc.imageUrl}
                                            alt={`Homes in ${loc.location}`}
                                            fill
                                            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                                            unoptimized={!canOptimizeImage(loc.imageUrl)}
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-primary/10 text-primary">
                                            <MapPin className="h-10 w-10" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-linear-to-t from-ink/85 via-ink/25 to-transparent" />
                                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 text-ink-foreground">
                                        <div className="min-w-0">
                                            <h3 className="truncate font-serif text-lg font-semibold tracking-tight">{loc.location}</h3>
                                            <p className="text-xs text-ink-foreground/80">
                                                {loc.count.toLocaleString()} {loc.count === 1 ? 'home' : 'homes'} available
                                            </p>
                                        </div>
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-foreground/15 backdrop-blur transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                            <ArrowUpRight className="h-4 w-4" />
                                        </span>
                                    </div>
                                </Link>
                            </Reveal>
                        ))}
                    </div>
                )}
            </Container>
        </section>
    );
}
