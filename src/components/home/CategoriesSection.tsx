'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight, BedSingle, Briefcase, Building, Building2, Castle, DoorOpen, Hotel, House, LayoutGrid, Warehouse } from 'lucide-react';
import { Container } from '@/components/shared/Container';
import { EmptyState } from '@/components/shared/EmptyState';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Skeleton } from '@/components/ui/skeleton';
import { propertiesApi } from '@/lib/api';
import { Reveal } from './Reveal';
import { SectionError } from './SectionError';
import { useAsync } from './useAsync';

const ICON_RULES: Array<[RegExp, LucideIcon]> = [
    [/villa|bungalow|mansion/i, Castle],
    [/penthouse|duplex|condo/i, Building],
    [/apartment|flat/i, Building2],
    [/studio|room|single|bachelor|hostel|sublet/i, BedSingle],
    [/house|home|cottage|family/i, House],
    [/office|commercial|shop|business/i, Briefcase],
    [/hotel|serviced|guest/i, Hotel],
    [/warehouse|storage|garage/i, Warehouse],
    [/suite|unit/i, DoorOpen],
];

function iconFor(name: string): LucideIcon {
    return ICON_RULES.find(([re]) => re.test(name))?.[1] ?? LayoutGrid;
}

export function CategoriesSection() {
    const { data, error, loading, retry } = useAsync(() => propertiesApi.categories().then((res) => res.data ?? []));

    return (
        <section className="bg-muted/40 py-16 sm:py-20">
            <Container>
                <Reveal>
                    <SectionHeading
                        eyebrow="Browse by category"
                        title="Find the kind of place that fits your life"
                        description="From compact studios near your office to family flats and spacious villas — every count below is a live number of homes you can request today."
                    />
                </Reveal>

                {loading ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-busy="true" aria-label="Loading categories">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                                <Skeleton className="h-11 w-11 rounded-xl" />
                                <Skeleton className="mt-5 h-5 w-1/2 rounded-full" />
                                <Skeleton className="mt-3 h-3 w-full rounded-full" />
                                <Skeleton className="mt-2 h-3 w-2/3 rounded-full" />
                                <Skeleton className="mt-5 h-3 w-24 rounded-full" />
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <SectionError title="Couldn't load categories" message={error} onRetry={retry} />
                ) : !data || data.length === 0 ? (
                    <EmptyState icon={LayoutGrid} title="No categories yet" description="Property categories will appear here once they are set up." />
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {data.map((category, i) => {
                            const Icon = iconFor(category.name);
                            const count = category.propertyCount ?? 0;
                            return (
                                <Reveal key={category.id} delay={(i % 4) * 0.05} className="h-full">
                                    <Link
                                        href={`/properties?categoryId=${encodeURIComponent(category.id)}`}
                                        className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        <div className="flex items-start justify-between">
                                            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                                <Icon className="h-5 w-5" />
                                            </span>
                                            <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                                        </div>
                                        <h3 className="mt-5 font-serif text-lg font-semibold tracking-tight text-foreground">{category.name}</h3>
                                        <p className="mt-1.5 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                                            {category.description || `Explore every ${category.name.toLowerCase()} listed by verified RentNest landlords.`}
                                        </p>
                                        <p className="mt-4 text-xs font-semibold text-primary">
                                            {count === 0 ? 'No homes available right now' : `${count.toLocaleString()} ${count === 1 ? 'home' : 'homes'} available`}
                                        </p>
                                    </Link>
                                </Reveal>
                            );
                        })}
                    </div>
                )}
            </Container>
        </section>
    );
}
