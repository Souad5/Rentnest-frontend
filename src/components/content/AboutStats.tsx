'use client';

import { useQuery } from '@tanstack/react-query';
import { Building2, Home, KeyRound, MapPin, Star, Users } from 'lucide-react';
import { propertiesApi } from '@/lib/api';
import { formatCompact } from '@/lib/format';
import { Skeleton } from '@/components/ui/skeleton';
import { Container } from '@/components/shared/Container';

/** Live platform numbers from GET /properties/stats. Hidden entirely if the request fails. */
export function AboutStats() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['public-stats'],
        queryFn: async () => (await propertiesApi.stats()).data,
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });

    if (isError) return null;

    const items = data
        ? [
              { icon: Home, label: 'Homes available now', value: formatCompact(data.availableProperties) },
              { icon: Building2, label: 'Landlords', value: formatCompact(data.totalLandlords) },
              { icon: Users, label: 'Tenants', value: formatCompact(data.totalTenants) },
              { icon: MapPin, label: 'Cities & areas', value: formatCompact(data.totalCities) },
              { icon: KeyRound, label: 'Successful rentals', value: formatCompact(data.successfulRentals) },
              ...(data.totalReviews > 0
                  ? [
                        {
                            icon: Star,
                            label: `Average rating · ${formatCompact(data.totalReviews)} reviews`,
                            value: data.averageRating.toFixed(1),
                        },
                    ]
                  : []),
          ]
        : [];

    return (
        <section aria-label="RentNest in numbers" className="border-y border-border bg-card">
            <Container className="py-10">
                <dl className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
                    {isLoading || !data
                        ? Array.from({ length: 6 }).map((_, i) => (
                              <div key={i} className="space-y-2">
                                  <Skeleton className="h-8 w-16 rounded-lg" />
                                  <Skeleton className="h-3.5 w-24" />
                              </div>
                          ))
                        : items.map(({ icon: Icon, label, value }) => (
                              <div key={label} className="flex flex-col-reverse gap-1">
                                  <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                      <Icon className="h-3.5 w-3.5 text-primary" /> {label}
                                  </dt>
                                  <dd className="font-serif text-3xl font-semibold tracking-tight text-foreground">{value}</dd>
                              </div>
                          ))}
                </dl>
            </Container>
        </section>
    );
}
