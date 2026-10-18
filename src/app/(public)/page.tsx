import type { Metadata } from 'next';
import { AIShowcase } from '@/components/home/AIShowcase';
import { BlogSection } from '@/components/home/BlogSection';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { FaqSection } from '@/components/home/FaqSection';
import { HeroSection } from '@/components/home/HeroSection';
import { HowItWorks } from '@/components/home/HowItWorks';
import { LandlordCTA } from '@/components/home/LandlordCTA';
import { LocationsSection } from '@/components/home/LocationsSection';
import { NewsletterSection } from '@/components/home/NewsletterSection';
import { StatsBand } from '@/components/home/StatsBand';
import { Testimonials } from '@/components/home/Testimonials';
import { TrendingSection } from '@/components/home/TrendingSection';
import type { SectionTone } from '@/components/home/tone';
import { WhyRentNest } from '@/components/home/WhyRentNest';
import { blogPosts } from '@/content/blog';
import { faqs } from '@/content/faq';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
    title: { absolute: `${siteConfig.name} | Rent verified homes across Bangladesh` },
    description:
        'Find verified flats and houses in Dhaka, Chattogram and beyond. Search with AI, request your move-in dates, and pay the first month securely with Stripe once your landlord approves.',
    openGraph: {
        title: `${siteConfig.name} — ${siteConfig.tagline}`,
        description: siteConfig.description,
        type: 'website',
    },
};

const TRENDING_ID = 'trending';

export default function HomePage() {
    // FAQ and blog hide themselves when their content is empty; keep the
    // muted / plain background rhythm intact for whichever sections remain.
    const tail: Array<'faq' | 'blog' | 'newsletter'> = [
        ...(faqs.length > 0 ? (['faq'] as const) : []),
        ...(blogPosts.length > 0 ? (['blog'] as const) : []),
        'newsletter',
    ];
    const toneOf = (key: (typeof tail)[number]): SectionTone => (tail.indexOf(key) % 2 === 0 ? 'muted' : 'plain');

    return (
        <>
            <HeroSection nextSectionId={TRENDING_ID} />
            <TrendingSection id={TRENDING_ID} />
            <CategoriesSection />
            <LocationsSection />
            <StatsBand />
            <HowItWorks />
            <WhyRentNest />
            <AIShowcase />
            <Testimonials />
            <LandlordCTA />
            <FaqSection tone={toneOf('faq')} />
            <BlogSection tone={toneOf('blog')} />
            <NewsletterSection tone={toneOf('newsletter')} />
        </>
    );
}
