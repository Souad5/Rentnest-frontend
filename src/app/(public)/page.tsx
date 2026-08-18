import { Hero } from '@/components/home/Hero';
import { DiscoverPlaces } from '@/components/home/DiscoverPlaces';
import { PropertyTypes } from '@/components/home/PropertyTypes';
import { UniqueLivingBanner } from '@/components/home/UniqueLivingBanner';
import { StayUpToDate } from '@/components/home/StayUpToDate';
import { Newsletter } from '@/components/home/Newsletter';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-[#f4f3f0] text-[#1c1d1d] font-sans antialiased selection:bg-neutral-800 selection:text-white flex flex-col justify-between">
            <div>
                <main className="max-w-7xl mx-auto px-4 sm:px-6 space-y-24 pb-20">
                    <Hero />
                    <DiscoverPlaces />
                    <PropertyTypes />
                    <UniqueLivingBanner />
                    <StayUpToDate />
                    <Newsletter />
                </main>
            </div>
        </div>
    );
}