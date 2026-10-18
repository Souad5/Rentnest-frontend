'use client';

import { useEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { BadgeCheck, Building2, Handshake, MapPinned, Star } from 'lucide-react';
import { animate, useInView, useReducedMotion } from 'framer-motion';
import { Container } from '@/components/shared/Container';
import { propertiesApi } from '@/lib/api';
import { useAsync } from './useAsync';

function CountUp({ value, decimals = 0 }: { value: number; decimals?: number }) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, amount: 0.6 });
    const reduce = useReducedMotion();
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        if (!inView) return;
        const controls = animate(0, value, {
            duration: reduce ? 0 : 1.6,
            ease: [0.22, 1, 0.36, 1],
            onUpdate: (v) => setDisplay(v),
        });
        return () => controls.stop();
    }, [inView, value, reduce]);

    const formatted = display.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
    return (
        <span ref={ref} aria-hidden>
            {formatted}
        </span>
    );
}

interface StatItem {
    label: string;
    detail: string;
    value: number;
    decimals?: number;
    suffix?: string;
    icon: LucideIcon;
}

export function StatsBand() {
    const { data, loading, error } = useAsync(() => propertiesApi.stats().then((res) => res.data));

    // The band is decorative social proof: if the call fails, render nothing.
    if (error || (!loading && !data)) return null;

    const items: StatItem[] = data
        ? [
              { label: 'Properties listed', detail: `${data.availableProperties.toLocaleString()} open for requests`, value: data.totalProperties, icon: Building2 },
              { label: 'Cities & areas', detail: 'with homes available now', value: data.totalCities, icon: MapPinned },
              { label: 'Verified landlords', detail: 'managing listings on RentNest', value: data.totalLandlords, icon: BadgeCheck },
              { label: 'Successful rentals', detail: `${data.totalTenants.toLocaleString()} registered tenants`, value: data.successfulRentals, icon: Handshake },
              {
                  label: 'Average rating',
                  detail: data.totalReviews > 0 ? `from ${data.totalReviews.toLocaleString()} tenant reviews` : 'no reviews yet',
                  value: data.averageRating,
                  decimals: 1,
                  suffix: '/5',
                  icon: Star,
              },
          ]
        : [];

    return (
        <section aria-label="RentNest in numbers" className="bg-ink py-14 text-ink-foreground sm:py-16">
            <Container>
                <div className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-highlight">RentNest in numbers</p>
                        <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">Live figures, straight from the platform</h2>
                    </div>
                    <p className="max-w-sm text-sm text-ink-foreground/70">Updated in real time from listings, rentals and reviews — never rounded up for show.</p>
                </div>

                <ul className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-5">
                    {loading || !data
                        ? Array.from({ length: 5 }).map((_, i) => (
                              <li key={i} className="space-y-3" aria-hidden>
                                  <div className="h-9 w-9 animate-pulse rounded-xl bg-ink-foreground/10" />
                                  <div className="h-8 w-20 animate-pulse rounded-full bg-ink-foreground/10" />
                                  <div className="h-3 w-28 animate-pulse rounded-full bg-ink-foreground/10" />
                              </li>
                          ))
                        : items.map(({ label, detail, value, decimals, suffix, icon: Icon }) => (
                              <li key={label} className="flex flex-col">
                                  <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-ink-foreground/10 text-highlight">
                                      <Icon className="h-4.5 w-4.5" />
                                  </span>
                                  <p className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
                                      <span className="sr-only">
                                          {value.toFixed(decimals ?? 0)}
                                          {suffix}
                                      </span>
                                      <CountUp value={value} decimals={decimals} />
                                      {suffix && <span className="text-lg text-ink-foreground/60" aria-hidden>{suffix}</span>}
                                  </p>
                                  <p className="mt-1 text-sm font-semibold">{label}</p>
                                  <p className="mt-0.5 text-xs text-ink-foreground/65">{detail}</p>
                              </li>
                          ))}
                </ul>
            </Container>
        </section>
    );
}
