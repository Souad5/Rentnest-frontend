import type { Metadata } from 'next';
import { LegalDocument, type LegalSection } from '@/components/content/LegalDocument';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
    title: 'Terms of service',
    description: `The terms that apply when you use ${siteConfig.name} as a tenant, landlord or visitor.`,
};

const { email, address } = siteConfig.contact;
const name = siteConfig.name;

const sections: LegalSection[] = [
    {
        id: 'acceptance',
        title: 'Acceptance of these terms',
        paragraphs: [
            `By creating an account or using ${name}, you agree to these Terms of Service and to our Privacy Policy. If you do not agree, please do not use the service. You must be at least 18 years old and able to enter into a binding rental agreement.`,
        ],
    },
    {
        id: 'our-role',
        title: 'What RentNest does — and does not do',
        paragraphs: [
            `${name} is a marketplace. We provide the tools for landlords to list properties and for tenants to request, pay for and review rentals. We are not a party to the rental agreement between a tenant and a landlord, we do not own or manage the listed properties, and we do not act as a broker or estate agent. Landlords are responsible for their properties and listings; tenants are responsible for checking that a property suits them before requesting it.`,
        ],
    },
    {
        id: 'accounts',
        title: 'Your account',
        bullets: [
            'Provide accurate information and keep it up to date.',
            'Keep your password confidential. You are responsible for activity on your account.',
            'Each account has one role — tenant or landlord — chosen at registration. Admin accounts are created by RentNest only.',
            'You may sign in with Google; if an account with your email already exists, your Google sign-in is linked to it.',
            'We may suspend or ban accounts that break these terms, are used fraudulently, or put other users at risk.',
        ],
    },
    {
        id: 'rental-process',
        title: 'How a rental works',
        paragraphs: ['Every rental on RentNest follows the same steps:'],
        bullets: [
            'The tenant sends a rental request with a start date (today or later) and an end date. Only one pending request per tenant per property is allowed, and tenants cannot request their own properties.',
            'The landlord approves or rejects the request. Only pending requests can be decided, and RentNest blocks any approval whose dates overlap an already approved or active rental of the same property.',
            'After approval, the tenant pays the first month’s rent through Stripe. The amount equals the property’s listed monthly price. When payment is confirmed, the rental becomes active.',
            'Approved and active tenants may leave one review per property.',
        ],
        after: [
            'An approved request is not a guarantee that the property matches the listing in every detail. We strongly recommend viewing a property before requesting it.',
        ],
    },
    {
        id: 'payments',
        title: 'Payments, deposits and refunds',
        paragraphs: [
            'Payments made through RentNest are processed by Stripe and are subject to Stripe’s terms. The only payment collected through RentNest is the first month’s rent after approval. Any security deposit, advance, utility charge or later monthly rent is arranged directly between the tenant and the landlord, outside the platform, and RentNest is not responsible for it.',
            `If a payment fails or a rental does not become active after a successful charge, contact us at ${email} with the Stripe transaction ID shown in your dashboard. Refund requests for payments made through RentNest are reviewed case by case together with the landlord; refunds that are agreed are returned to the original payment method through Stripe.`,
        ],
    },
    {
        id: 'landlord-obligations',
        title: 'Landlord obligations',
        bullets: [
            'Only list properties you own or are authorised to let.',
            'Keep listings accurate: price, location, photos, rooms, floor area and amenities must reflect the actual property.',
            'If you use the AI description helper, review and correct its draft before publishing — you are responsible for the final listing.',
            'Respond to rental requests in good time and do not ask tenants to pay outside RentNest before approving their request.',
            'Comply with applicable Bangladeshi law, including the Premises Rent Control Act, 1991.',
        ],
    },
    {
        id: 'tenant-obligations',
        title: 'Tenant obligations',
        bullets: [
            'Only send requests for dates you genuinely intend to rent.',
            'Pay the first month’s rent promptly after approval if you wish to proceed.',
            'Write honest reviews based on your own experience of the property.',
            'Treat the property and the landlord with respect and follow any agreement you make with them.',
        ],
    },
    {
        id: 'content',
        title: 'Listings, reviews and other content',
        paragraphs: [
            'You keep ownership of the content you post, and you give RentNest a non-exclusive licence to display it on the service. Content must not be false, misleading, discriminatory, abusive, or infringe anyone else’s rights. Our admin team may hide listings or remove reviews that break these rules.',
        ],
    },
    {
        id: 'ai-features',
        title: 'AI features',
        paragraphs: [
            'The AI rental assistant, AI search suggestions, listing description helper and admin insights are powered by Anthropic’s Claude and are provided for convenience. AI output can be incomplete or wrong. It is not legal, financial or professional advice, and you should check listing details yourself before acting on it. Do not use AI features to generate unlawful, misleading or abusive content.',
        ],
    },
    {
        id: 'prohibited',
        title: 'Prohibited use',
        bullets: [
            'Scraping, overloading or attempting to bypass the security or rate limits of the service.',
            'Creating fake accounts, listings, requests or reviews.',
            'Collecting other users’ personal information for purposes unrelated to a rental.',
            'Asking for or making payments to “hold” a property outside the RentNest process.',
        ],
    },
    {
        id: 'liability',
        title: 'Disclaimers and limitation of liability',
        paragraphs: [
            `${name} is provided “as is”. We work to keep the service available and accurate but do not guarantee that it will be uninterrupted or error-free. To the extent permitted by law, ${name} is not liable for disputes between tenants and landlords, for the condition of any property, or for indirect or consequential losses. Nothing in these terms limits liability that cannot be limited under Bangladeshi law.`,
        ],
    },
    {
        id: 'termination',
        title: 'Ending your use of RentNest',
        paragraphs: [
            `You can stop using ${name} at any time and ask us to close your account by emailing ${email}. We may suspend or close accounts that breach these terms. Records of completed rentals and payments may be kept after closure where the law requires it.`,
        ],
    },
    {
        id: 'law',
        title: 'Changes and governing law',
        paragraphs: [
            'We may update these terms from time to time; the date at the top of this page shows the latest version, and continued use after a change means you accept it. These terms are governed by the laws of the People’s Republic of Bangladesh, and the courts of Dhaka have jurisdiction over any dispute.',
        ],
    },
    {
        id: 'contact',
        title: 'Contact',
        paragraphs: [`Questions about these terms? Email ${email} or write to us at ${address}.`],
    },
];

export default function TermsPage() {
    return (
        <LegalDocument
            eyebrow="Legal"
            title="Terms of service"
            lastUpdated="16 October 2026"
            intro={`These terms set out the rules for using ${name} — how rental requests, approvals and payments work, and what we expect from tenants, landlords and ourselves.`}
            sections={sections}
            related={{ href: '/privacy', label: 'Privacy Policy' }}
        />
    );
}
