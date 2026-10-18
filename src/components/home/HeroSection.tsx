'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Building2, ChevronDown, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { AISearchBox } from '@/components/shared/AISearchBox';
import { Container } from '@/components/shared/Container';
import { Button } from '@/components/ui/button';
import { propertiesApi } from '@/lib/api';
import { canOptimizeImage, coverImage } from '@/lib/images';
import { cn } from '@/lib/utils';
import { DateRangeField } from './DateRangeField';

interface Slide {
    src: string;
    alt: string;
    property?: { id: string; title: string; location: string };
}

const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=2000&q=80`;

// Curated fallback when no live listings with photos are available.
const CURATED_SLIDES: Slide[] = [
    { src: unsplash('1600596542815-ffad4c1539a9'), alt: 'Modern two-storey home with a lit pool at dusk' },
    { src: unsplash('1502672260266-1c1ef2d93688'), alt: 'Bright apartment living room with large windows' },
    { src: unsplash('1600607687939-ce8a6c25118c'), alt: 'Open-plan living and dining area in warm daylight' },
    { src: unsplash('1505691938895-1758d7feb511'), alt: 'Calm bedroom with neutral linen and soft light' },
];

const SLIDE_INTERVAL = 6000;
const toIso = (d?: Date) => (d ? format(d, 'yyyy-MM-dd') : undefined);

export function HeroSection({ nextSectionId }: { nextSectionId: string }) {
    const reduceMotion = useReducedMotion();
    const [slides, setSlides] = useState<Slide[]>(CURATED_SLIDES);
    const [index, setIndex] = useState(0);
    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    const paused = hovered || focused;
    const [dates, setDates] = useState<DateRange | undefined>();

    // Prefer live trending listings as slides; keep the curated set otherwise.
    useEffect(() => {
        let active = true;
        propertiesApi
            .trending(5)
            .then((res) => {
                if (!active) return;
                const live = (res.data ?? []).flatMap<Slide>((p) => {
                    const src = coverImage(p);
                    return src ? [{ src, alt: p.title, property: { id: p.id, title: p.title, location: p.location } }] : [];
                });
                if (live.length >= 2) {
                    setSlides(live);
                    setIndex(0);
                }
            })
            .catch(() => {
                /* curated slides stay in place */
            });
        return () => {
            active = false;
        };
    }, []);

    const count = slides.length;
    const go = useCallback((delta: number) => setIndex((i) => (i + delta + count) % count), [count]);

    useEffect(() => {
        if (paused || reduceMotion || count < 2) return;
        const timer = setTimeout(() => go(1), SLIDE_INTERVAL);
        return () => clearTimeout(timer);
    }, [index, paused, reduceMotion, count, go]);

    const scrollToNext = () => {
        document.getElementById(nextSectionId)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    };

    const current = slides[index % count];

    return (
        <section
            aria-roledescription="carousel"
            aria-label="Featured homes"
            className="relative isolate z-10 flex min-h-[60vh] items-center bg-ink text-ink-foreground lg:h-[68vh]"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onFocus={() => setFocused(true)}
            onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
            }}
        >
            {/* Slides */}
            <div className="absolute inset-0 -z-10 overflow-hidden" aria-live={paused ? 'polite' : 'off'}>
                <AnimatePresence initial={false}>
                    <motion.div
                        key={`${index}-${current.src}`}
                        className="absolute inset-0"
                        initial={{ opacity: 0, scale: reduceMotion ? 1 : 1.06 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                            opacity: { duration: reduceMotion ? 0 : 1.2, ease: 'easeInOut' },
                            scale: { duration: reduceMotion ? 0 : SLIDE_INTERVAL / 1000 + 1.2, ease: 'linear' },
                        }}
                        role="group"
                        aria-roledescription="slide"
                        aria-label={`${index + 1} of ${count}`}
                    >
                        <Image
                            src={current.src}
                            alt={current.alt}
                            fill
                            priority={index === 0}
                            sizes="100vw"
                            unoptimized={!canOptimizeImage(current.src)}
                            className="object-cover"
                        />
                    </motion.div>
                </AnimatePresence>
                {/* Readability overlays: ink is dark in both themes. */}
                <div className="absolute inset-0 bg-linear-to-r from-ink/90 via-ink/65 to-ink/25" />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-ink/80 to-transparent" />
            </div>

            <Container className="relative py-16 lg:py-0">
                <div className="max-w-3xl">
                    <motion.h1
                        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.05 }}
                        className="text-3xl font-semibold leading-tight tracking-tight text-ink-foreground sm:text-4xl lg:text-5xl"
                    >
                        Find a place to rent in Bangladesh
                    </motion.h1>
                    <motion.p
                        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="mt-4 max-w-2xl text-base leading-relaxed text-ink-foreground/85 sm:text-lg"
                    >
                        Browse verified flats and houses from Gulshan to Chattogram, request your exact dates, and pay the first month
                        securely online once your landlord approves.
                    </motion.p>

                    <motion.div
                        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.15 }}
                        className="mt-7 text-foreground"
                    >
                        <AISearchBox
                            size="lg"
                            placeholder="Try “family flat in Dhanmondi under $600”"
                            extraParams={{ moveIn: toIso(dates?.from), moveOut: toIso(dates?.to) }}
                        >
                            <DateRangeField value={dates} onChange={setDates} />
                        </AISearchBox>
                    </motion.div>

                    <motion.div
                        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center"
                    >
                        <Button asChild className="h-11 rounded-xl px-5 text-sm font-semibold">
                            <Link href="/properties">
                                Explore homes <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            className="h-11 rounded-xl border-ink-foreground/30 bg-ink-foreground/10 px-5 text-sm font-semibold text-ink-foreground backdrop-blur hover:bg-ink-foreground/20 hover:text-ink-foreground dark:border-ink-foreground/30 dark:bg-ink-foreground/10 dark:hover:bg-ink-foreground/20"
                        >
                            <Link href="/register?role=LANDLORD">
                                <Building2 className="h-4 w-4" /> List your property
                            </Link>
                        </Button>
                    </motion.div>
                </div>
            </Container>

            {/* Featured listing caption + slider controls */}
            <div className="absolute inset-x-0 bottom-4 sm:bottom-6">
                <Container className="flex items-end justify-between gap-4">
                    <button
                        type="button"
                        onClick={scrollToNext}
                        aria-label="Scroll to trending homes"
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-foreground/30 text-ink-foreground/80 transition-colors hover:text-ink-foreground lg:hidden"
                    >
                        <ChevronDown className="h-4 w-4" />
                    </button>
                    <div className="hidden min-w-0 lg:block">
                        {current.property && (
                            <Link
                                href={`/properties/${current.property.id}`}
                                className="group inline-flex max-w-sm items-center gap-2 rounded-full border border-ink-foreground/20 bg-ink/50 px-3 py-1.5 text-xs text-ink-foreground backdrop-blur transition-colors hover:bg-ink/70"
                            >
                                <MapPin className="h-3.5 w-3.5 shrink-0 text-ink-foreground" />
                                <span className="truncate">
                                    <span className="font-semibold">{current.property.title}</span> · {current.property.location}
                                </span>
                                <ArrowRight className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                        )}
                    </div>

                    {count > 1 && (
                        <div className="ml-auto flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                                {slides.map((s, i) => (
                                    <button
                                        key={`${i}-${s.src}`}
                                        type="button"
                                        onClick={() => setIndex(i)}
                                        aria-label={`Show slide ${i + 1}`}
                                        aria-current={i === index}
                                        className="flex h-6 items-center"
                                    >
                                        <span
                                            className={cn(
                                                'block h-1.5 rounded-full transition-all duration-300',
                                                i === index ? 'w-6 bg-ink-foreground' : 'w-1.5 bg-ink-foreground/45 hover:bg-ink-foreground/70',
                                            )}
                                        />
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => go(-1)}
                                    aria-label="Previous slide"
                                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-ink-foreground/25 bg-ink/40 text-ink-foreground backdrop-blur transition-colors hover:bg-ink/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => go(1)}
                                    aria-label="Next slide"
                                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-ink-foreground/25 bg-ink/40 text-ink-foreground backdrop-blur transition-colors hover:bg-ink/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </Container>
            </div>
        </section>
    );
}
