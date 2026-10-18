import type { Metadata } from 'next';
import { LegalDocument, type LegalSection } from '@/components/content/LegalDocument';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
    title: 'Privacy policy',
    description: `How ${siteConfig.name} collects, uses and protects your personal information.`,
};

const { email, address } = siteConfig.contact;

const sections: LegalSection[] = [
    {
        id: 'who-we-are',
        title: 'Who we are',
        paragraphs: [
            `${siteConfig.name} is an online rental marketplace operated from ${address}. We connect tenants looking for homes with landlords who list them. In this policy, “we”, “us” and “our” mean ${siteConfig.name}, and “you” means anyone who visits our website or uses an account.`,
        ],
    },
    {
        id: 'information-we-collect',
        title: 'Information we collect',
        paragraphs: ['We only collect what we need to run the marketplace:'],
        bullets: [
            'Account information: your name, email address, role (tenant, landlord or admin) and a securely hashed password. If you sign in with Google, we receive your name, email address and Google account identifier from Google — never your Google password.',
            'Profile details you choose to add: phone number, profile photo URL and a short bio.',
            'Listings: for landlords, the property details you publish — title, description, address, location, price, photos, rooms, floor area and amenities.',
            'Rental requests: the property, start and end dates, and status of every request you send or receive.',
            'Reviews: the rating and comment you write, linked to your name and the property.',
            'Payment metadata: the amount, status, date and Stripe transaction ID of each payment. Card details are entered directly into Stripe and never reach our servers.',
            'Messages: anything you send through our contact form (name, email, subject and message) and your email address if you subscribe to our newsletter.',
            'AI conversations: the text you type into the AI rental assistant or AI search, and property details a landlord submits to the AI description helper.',
        ],
    },
    {
        id: 'how-we-use-information',
        title: 'How we use your information',
        bullets: [
            'To create and secure your account and keep you signed in.',
            'To show listings, send rental requests to landlords, and let landlords approve or reject them.',
            'To process the first month’s rent through Stripe and show payment records to the tenant and the landlord concerned.',
            'To display reviews and ratings on property pages.',
            'To answer your support messages and, if you subscribed, send our newsletter.',
            'To moderate listings and reviews, prevent fraud and abuse, and enforce our Terms of Service.',
            'To produce aggregate statistics (for example, the number of available homes) that never identify you individually.',
        ],
    },
    {
        id: 'what-others-see',
        title: 'What other users can see',
        paragraphs: [
            'Listings are public. A landlord’s name is shown on their listings, but their email address is not shown publicly. When you send a rental request, the landlord of that property can see your name, email address and requested dates so they can make a decision. Reviews are public and show the reviewer’s name.',
        ],
    },
    {
        id: 'payments',
        title: 'Payments and Stripe',
        paragraphs: [
            'Payments are processed by Stripe, Inc. When you pay, your card details are sent directly from your browser to Stripe’s secure payment form. RentNest never sees, processes or stores your full card number, expiry date or security code. Stripe’s handling of your payment information is governed by Stripe’s own privacy policy. We store only the payment metadata described above so both parties have a record.',
        ],
    },
    {
        id: 'ai-features',
        title: 'AI features',
        paragraphs: [
            'RentNest’s AI rental assistant, AI search suggestions, listing description helper and admin insights are powered by Anthropic’s Claude API. When you use these features, the text you type (and, for the assistant, the recent messages in your conversation) is sent to Anthropic together with relevant listing information so that Claude can generate a response.',
            'Please do not share sensitive personal information, such as identity document numbers or financial details, in AI conversations. Your assistant conversation is kept in your browser’s session storage so it survives page changes, and is cleared when you close the tab or press “Clear chat”. AI responses can be inaccurate; always check listing details before making a decision.',
        ],
    },
    {
        id: 'cookies-storage',
        title: 'Cookies and local storage',
        paragraphs: ['We use a small number of strictly necessary browser storage items and no advertising trackers:'],
        bullets: [
            'An authentication token stored in your browser’s local storage, mirrored in “token” and “role” cookies so protected dashboard pages can check that you are signed in. These expire after 7 days or when you sign out.',
            'Your light, dark or system theme preference, stored in local storage.',
            'Your AI assistant conversation, stored in session storage for the current tab only.',
            'If you use Google sign-in, Google may set its own cookies when its sign-in button loads.',
        ],
    },
    {
        id: 'sharing',
        title: 'Who we share information with',
        paragraphs: ['We do not sell your personal information. We share it only with:'],
        bullets: [
            'Stripe, to process payments.',
            'Anthropic, to generate responses for AI features as described above.',
            'Google, if you choose to sign in with Google.',
            'Our hosting and database providers, who store data on our behalf under confidentiality obligations.',
            'Authorities in Bangladesh, where we are legally required to do so or need to protect the safety of our users.',
        ],
    },
    {
        id: 'retention-security',
        title: 'Data retention and security',
        paragraphs: [
            'We keep account, listing, rental and payment records for as long as your account is active and afterwards for as long as needed to resolve disputes, meet legal and accounting obligations, and prevent fraud. Passwords are stored only as one-way hashes, all traffic to our site is encrypted in transit, and access to administrative tools is limited to authorised staff. No system is completely secure, so please use a strong, unique password.',
        ],
    },
    {
        id: 'your-rights',
        title: 'Your choices and rights',
        bullets: [
            'View and update your name, phone number, photo and bio at any time from your dashboard profile page.',
            'Change your password, or set one if you signed up with Google.',
            'Ask us for a copy of the personal information we hold about you, or ask us to correct or delete it.',
            'Unsubscribe from the newsletter by contacting us.',
        ],
        after: [
            `To make a request, email ${email}. We may need to verify your identity, and we may keep some records where the law requires it — for example, payment records.`,
        ],
    },
    {
        id: 'children',
        title: 'Children',
        paragraphs: [
            `${siteConfig.name} is intended for adults who can enter into rental agreements. We do not knowingly collect information from anyone under 18. If you believe a child has created an account, please contact us and we will remove it.`,
        ],
    },
    {
        id: 'changes-law',
        title: 'Changes and governing law',
        paragraphs: [
            'We may update this policy as our services change. When we make significant changes we will update the date at the top of this page and, where appropriate, notify you by email or in the app. This policy is governed by the laws of the People’s Republic of Bangladesh.',
        ],
    },
    {
        id: 'contact',
        title: 'Contact us',
        paragraphs: [`For any privacy question or request, email ${email} or write to us at ${address}.`],
    },
];

export default function PrivacyPage() {
    return (
        <LegalDocument
            eyebrow="Legal"
            title="Privacy policy"
            lastUpdated="16 October 2026"
            intro={`This policy explains what personal information ${siteConfig.name} collects when you search for homes, list a property, send or approve rental requests, make payments or use our AI features — and how we use, share and protect it.`}
            sections={sections}
            related={{ href: '/terms', label: 'Terms of Service' }}
        />
    );
}
