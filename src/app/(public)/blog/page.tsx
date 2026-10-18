import type { Metadata } from 'next';
import { Container } from '@/components/shared/Container';
import { PageHero } from '@/components/content/PageHero';
import { BlogList } from '@/components/content/BlogList';

export const metadata: Metadata = {
    title: 'Blog & guides',
    description:
        'Practical guides for renting and letting in Bangladesh: flat-viewing checklists, Dhaka neighbourhood comparisons, pricing and payment advice from the RentNest team.',
};

export default function BlogPage() {
    return (
        <>
            <PageHero
                eyebrow="Blog & guides"
                title="Rent smarter, let with confidence"
                description="Practical advice for tenants and landlords in Bangladesh — from what to check at a viewing to pricing your flat and understanding payments."
            />
            <section className="py-16 sm:py-20">
                <Container>
                    <BlogList />
                </Container>
            </section>
        </>
    );
}
