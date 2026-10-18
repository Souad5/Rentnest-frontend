import { cache } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
    Bath,
    BedDouble,
    Building2,
    CalendarDays,
    Check,
    ChevronRight,
    ExternalLink,
    Home,
    MapPin,
    Ruler,
    Star,
} from 'lucide-react';

import { RentalRequestForm } from '@/components/forms/RentalRequestForm';
import { PropertyReviews } from '@/components/reviews/PropertyReviews';
import { Container } from '@/components/shared/Container';
import { PropertyGallery } from '@/components/shared/PropertyGallery';
import { SectionHeading } from '@/components/shared/SectionHeading';
import StatusBadge from '@/components/shared/StatusBadge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ApiError, propertiesApi } from '@/lib/api';
import { formatDate, formatPrice, initials } from '@/lib/format';
import { coverImage, propertyImages } from '@/lib/images';
import type { PropertyDetail } from '@/types/api';

import { MobileBookingBar } from './_components/MobileBookingBar';
import { PropertyLoadError } from './_components/PropertyLoadError';
import { RelatedProperties } from './_components/RelatedProperties';
import { ShareButton } from './_components/ShareButton';

interface PageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

type LoadResult =
    | { status: 'ok'; property: PropertyDetail }
    | { status: 'not-found' }
    | { status: 'error'; message: string };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Deduped between generateMetadata and the page render.
const loadProperty = cache(async (id: string): Promise<LoadResult> => {
    if (!UUID_RE.test(id)) return { status: 'not-found' };
    try {
        const res = await propertiesApi.detail(id);
        if (!res?.data) return { status: 'not-found' };
        return { status: 'ok', property: res.data };
    } catch (err) {
        if (err instanceof ApiError && (err.status === 404 || err.status === 400)) return { status: 'not-found' };
        return {
            status: 'error',
            message: err instanceof ApiError && err.status < 500 ? err.message : '',
        };
    }
});

const firstParam = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

function truncate(text: string, max: number) {
    const clean = text.replace(/\s+/g, ' ').trim();
    return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const result = await loadProperty(id);
    if (result.status === 'not-found') return { title: 'Property not found' };
    if (result.status === 'error') return { title: 'Property' };

    const p = result.property;
    const facts = [
        p.bedrooms != null ? `${p.bedrooms} bed` : null,
        p.bathrooms != null ? `${p.bathrooms} bath` : null,
        p.category?.name,
        `${formatPrice(p.price)}/month`,
    ]
        .filter(Boolean)
        .join(' · ');
    const description = truncate(`${facts} in ${p.location}. ${p.description}`, 160);
    const image = coverImage(p);

    return {
        title: `${p.title} in ${p.location}`,
        description,
        openGraph: {
            title: `${p.title} · ${p.location}`,
            description,
            type: 'website',
            images: image ? [{ url: image, alt: p.title }] : undefined,
        },
        twitter: {
            card: image ? 'summary_large_image' : 'summary',
            title: `${p.title} · ${p.location}`,
            description,
            images: image ? [image] : undefined,
        },
    };
}

export default async function PropertyDetailPage({ params, searchParams }: PageProps) {
    const { id } = await params;
    const result = await loadProperty(id);
    if (result.status === 'not-found') notFound();
    if (result.status === 'error') return <PropertyLoadError message={result.message} />;

    const property = result.property;
    const query = await searchParams;
    const moveIn = firstParam(query.moveIn);
    const moveOut = firstParam(query.moveOut);
    const datesQuery = new URLSearchParams();
    if (moveIn) datesQuery.set('moveIn', moveIn);
    if (moveOut) datesQuery.set('moveOut', moveOut);

    const images = propertyImages(property);
    const amenities = property.amenities ?? [];
    const hasReviews = property.reviewCount > 0;
    const fullAddress = [property.address, property.location].filter(Boolean).join(', ');
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
    const dash = '—';

    const specs: Array<{ label: string; value: React.ReactNode }> = [
        { label: 'Monthly rent', value: `${formatPrice(property.price)} / month` },
        { label: 'Category', value: property.category?.name ?? dash },
        { label: 'Bedrooms', value: property.bedrooms ?? dash },
        { label: 'Bathrooms', value: property.bathrooms ?? dash },
        { label: 'Floor area', value: property.areaSqft != null ? `${property.areaSqft.toLocaleString('en-US')} sqft` : dash },
        { label: 'Location', value: property.location || dash },
        { label: 'Address', value: property.address || dash },
        { label: 'Availability', value: <StatusBadge status={property.isAvailable ? 'AVAILABLE' : 'RENTED'} /> },
        { label: 'Listed on', value: formatDate(property.createdAt) },
        {
            label: 'Tenant rating',
            value: hasReviews
                ? `${property.avgRating.toFixed(1)} / 5 (${property.reviewCount} ${property.reviewCount === 1 ? 'review' : 'reviews'})`
                : 'No reviews yet',
        },
    ];

    const quickFacts = [
        property.bedrooms != null && {
            icon: BedDouble,
            label: `${property.bedrooms} ${property.bedrooms === 1 ? 'bedroom' : 'bedrooms'}`,
        },
        property.bathrooms != null && {
            icon: Bath,
            label: `${property.bathrooms} ${property.bathrooms === 1 ? 'bathroom' : 'bathrooms'}`,
        },
        property.areaSqft != null && { icon: Ruler, label: `${property.areaSqft.toLocaleString('en-US')} sqft` },
        property.category?.name && { icon: Building2, label: property.category.name },
    ].filter(Boolean) as Array<{ icon: typeof BedDouble; label: string }>;

    return (
        <div>
            <Container className="pt-6 sm:pt-8">
                {/* Breadcrumbs + share */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <nav aria-label="Breadcrumb" className="min-w-0">
                        <ol className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
                            <li>
                                <Link href="/" className="inline-flex items-center gap-1 hover:text-foreground">
                                    <Home className="h-3.5 w-3.5" /> Home
                                </Link>
                            </li>
                            <li aria-hidden>
                                <ChevronRight className="h-3.5 w-3.5" />
                            </li>
                            <li>
                                <Link href="/properties" className="hover:text-foreground">
                                    Explore
                                </Link>
                            </li>
                            <li aria-hidden>
                                <ChevronRight className="h-3.5 w-3.5" />
                            </li>
                            <li className="min-w-0">
                                <span aria-current="page" className="block max-w-[12rem] truncate font-medium text-foreground sm:max-w-md">
                                    {property.title}
                                </span>
                            </li>
                        </ol>
                    </nav>
                    <ShareButton title={property.title} text={`${property.title} in ${property.location} on RentNest`} />
                </div>

                {/* Title */}
                <header className="mt-6 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                        {property.category?.name && (
                            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                {property.category.name}
                            </span>
                        )}
                        <StatusBadge status={property.isAvailable ? 'AVAILABLE' : 'RENTED'} />
                    </div>
                    <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                        {property.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-primary" />
                            {fullAddress}
                        </span>
                        <a href="#reviews" className="inline-flex items-center gap-1.5 hover:text-foreground">
                            <Star className={hasReviews ? 'h-4 w-4 fill-highlight text-highlight' : 'h-4 w-4'} />
                            {hasReviews ? (
                                <>
                                    <span className="font-semibold text-foreground">{property.avgRating.toFixed(1)}</span>
                                    <span>
                                        ({property.reviewCount} {property.reviewCount === 1 ? 'review' : 'reviews'})
                                    </span>
                                </>
                            ) : (
                                'No reviews yet'
                            )}
                        </a>
                    </div>
                </header>

                {/* Gallery */}
                <section aria-labelledby="gallery-heading" className="mt-6">
                    <h2 id="gallery-heading" className="sr-only">
                        Photo gallery
                    </h2>
                    <PropertyGallery images={images} title={property.title} />
                </section>

                <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12">
                    <div className="min-w-0 space-y-12">
                        {/* Overview */}
                        <section aria-labelledby="overview-heading" className="space-y-4">
                            <h2 id="overview-heading" className="font-serif text-2xl font-semibold tracking-tight text-foreground">
                                Overview
                            </h2>
                            {quickFacts.length > 0 && (
                                <ul className="flex flex-wrap gap-2">
                                    {quickFacts.map(({ icon: Icon, label }) => (
                                        <li
                                            key={label}
                                            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-foreground"
                                        >
                                            <Icon className="h-4 w-4 text-primary" /> {label}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-base">
                                {property.description}
                            </p>
                        </section>

                        {/* Specifications */}
                        <section aria-labelledby="specs-heading" className="space-y-4">
                            <h2 id="specs-heading" className="font-serif text-2xl font-semibold tracking-tight text-foreground">
                                Key information
                            </h2>
                            <dl className="grid overflow-hidden rounded-2xl border border-border bg-card shadow-sm sm:grid-cols-2">
                                {specs.map((spec, i) => (
                                    <div
                                        key={spec.label}
                                        className={`flex items-center justify-between gap-4 border-border px-4 py-3 text-sm ${
                                            i > 0 ? 'border-t' : ''
                                        } ${i === 1 ? 'sm:border-t-0' : ''} ${i % 2 === 1 ? 'sm:border-l' : ''}`}
                                    >
                                        <dt className="shrink-0 text-muted-foreground">{spec.label}</dt>
                                        <dd className="min-w-0 text-right font-medium text-foreground">{spec.value}</dd>
                                    </div>
                                ))}
                            </dl>
                        </section>

                        {/* Amenities (hidden when the landlord listed none) */}
                        {amenities.length > 0 && (
                            <section aria-labelledby="amenities-heading" className="space-y-4">
                                <h2 id="amenities-heading" className="font-serif text-2xl font-semibold tracking-tight text-foreground">
                                    Amenities
                                </h2>
                                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {amenities.map((amenity) => (
                                        <li key={amenity} className="flex items-center gap-3 text-sm text-foreground">
                                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                <Check className="h-4 w-4" />
                                            </span>
                                            {amenity}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {/* Location */}
                        <section aria-labelledby="location-heading" className="space-y-4">
                            <h2 id="location-heading" className="font-serif text-2xl font-semibold tracking-tight text-foreground">
                                Location
                            </h2>
                            <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-start gap-3">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <MapPin className="h-5 w-5" />
                                    </span>
                                    <div>
                                        <p className="font-semibold text-foreground">{property.location}</p>
                                        <p className="text-sm text-muted-foreground">{property.address || dash}</p>
                                    </div>
                                </div>
                                <a
                                    href={mapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                                >
                                    Open in Google Maps <ExternalLink className="h-4 w-4" />
                                </a>
                            </div>
                        </section>

                        {/* Reviews */}
                        <section id="reviews" aria-labelledby="reviews-heading" className="scroll-mt-24 space-y-4">
                            <h2 id="reviews-heading" className="font-serif text-2xl font-semibold tracking-tight text-foreground">
                                Reviews &amp; ratings
                            </h2>
                            <PropertyReviews propertyId={property.id} initialReviews={property.reviews} />
                        </section>

                        {/* Landlord */}
                        <section aria-labelledby="landlord-heading" className="space-y-4">
                            <h2 id="landlord-heading" className="font-serif text-2xl font-semibold tracking-tight text-foreground">
                                Your landlord
                            </h2>
                            <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
                                <Avatar className="h-14 w-14 shrink-0">
                                    <AvatarFallback className="bg-primary/10 text-base font-semibold text-primary">
                                        {initials(property.landlord.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 space-y-1">
                                    <p className="truncate text-base font-semibold text-foreground">{property.landlord.name}</p>
                                    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                                        <span className="inline-flex items-center gap-1.5">
                                            <CalendarDays className="h-3.5 w-3.5" />
                                            Member since {formatDate(property.landlord.createdAt, { month: 'long', year: 'numeric' })}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5">
                                            <Building2 className="h-3.5 w-3.5" />
                                            {property.landlord.propertyCount}{' '}
                                            {property.landlord.propertyCount === 1 ? 'listing' : 'listings'} on RentNest
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Contact details are shared once your rental request is approved. Keep payments inside RentNest
                                so they&apos;re tracked on your dashboard.
                            </p>
                        </section>
                    </div>

                    {/* Booking card (desktop) */}
                    <aside className="hidden lg:block" aria-label="Request to rent">
                        <div className="sticky top-24 space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                                <p className="text-foreground">
                                    <span className="font-serif text-3xl font-semibold">{formatPrice(property.price)}</span>
                                    <span className="text-sm text-muted-foreground"> / month</span>
                                </p>
                                <StatusBadge status={property.isAvailable ? 'AVAILABLE' : 'RENTED'} />
                            </div>
                            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Star className={hasReviews ? 'h-4 w-4 fill-highlight text-highlight' : 'h-4 w-4'} />
                                {hasReviews ? (
                                    <>
                                        <span className="font-semibold text-foreground">{property.avgRating.toFixed(1)}</span>·{' '}
                                        {property.reviewCount} {property.reviewCount === 1 ? 'review' : 'reviews'}
                                    </>
                                ) : (
                                    'New listing — no reviews yet'
                                )}
                            </p>
                            <div className="border-t border-border pt-5">
                                <RentalRequestForm
                                    propertyId={property.id}
                                    propertyTitle={property.title}
                                    price={property.price}
                                    isAvailable={property.isAvailable}
                                    defaultStartDate={moveIn}
                                    defaultEndDate={moveOut}
                                />
                            </div>
                        </div>
                    </aside>
                </div>
            </Container>

            {/* Related */}
            <section className="mt-16 border-t border-border bg-muted/30 py-16 sm:py-20">
                <Container>
                    <SectionHeading
                        eyebrow="Keep exploring"
                        title="Similar homes"
                        description={`Other available homes in ${property.location} or the same category.`}
                    />
                    <RelatedProperties propertyId={property.id} hrefQuery={datesQuery.toString() || undefined} />
                </Container>
            </section>

            <MobileBookingBar
                propertyId={property.id}
                title={property.title}
                price={property.price}
                isAvailable={property.isAvailable}
                avgRating={property.avgRating}
                reviewCount={property.reviewCount}
                defaultStartDate={moveIn}
                defaultEndDate={moveOut}
            />
        </div>
    );
}
