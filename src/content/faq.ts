// FAQ entries used by /help and the home page FAQ section (first items are
// the most common questions). Answers describe how the app actually works.

export interface FaqItem {
    question: string;
    answer: string;
    category: 'Tenants' | 'Landlords' | 'Payments' | 'Account';
}

export const faqs: FaqItem[] = [
    // --- Most common ---
    {
        question: 'How do I rent a property on RentNest?',
        answer:
            'Create a free tenant account, open a property you like and send a rental request with your start and end dates. The landlord approves or rejects it from their dashboard. Once approved, you pay the first month’s rent securely through Stripe and the rental becomes active. You can follow every step under My requests in your dashboard.',
        category: 'Tenants',
    },
    {
        question: 'When do I pay, and how much?',
        answer:
            'You only pay after the landlord approves your request — never before. The amount is the property’s listed monthly rent for the first month, calculated by our server from the listing. A “Pay now” button appears on the approved request, and once Stripe confirms the payment your rental status changes to Active.',
        category: 'Payments',
    },
    {
        question: 'Is my card information safe?',
        answer:
            'Yes. Payments are processed by Stripe and your card details are entered directly into Stripe’s secure form. Card numbers never reach RentNest’s servers; we only store the payment amount, status, date and Stripe transaction ID so you have a record in your dashboard.',
        category: 'Payments',
    },
    {
        question: 'How do I list my property as a landlord?',
        answer:
            'Register with the Landlord role (or choose “List your property” in the footer), then go to your landlord dashboard and select Add property. Add a title, location, address, category, monthly price, photos, bedrooms, bathrooms, floor area and amenities. Your listing is published immediately and appears in search while it is marked available.',
        category: 'Landlords',
    },
    {
        question: 'What happens if someone else wants the same dates?',
        answer:
            'Several tenants can request the same property, but a landlord cannot approve dates that overlap a rental that is already approved or active — RentNest blocks the approval. Tenants also cannot book a property for dates that clash with an existing approved or active rental, so double-bookings are prevented.',
        category: 'Tenants',
    },
    {
        question: 'Can I sign in with Google?',
        answer:
            'Yes. Use “Continue with Google” on the sign-in or registration page. If an account with the same email already exists, your Google login is linked to it. New Google accounts are created as tenants unless you choose the Landlord role on the registration page first.',
        category: 'Account',
    },

    // --- Tenants ---
    {
        question: 'Can I cancel or change a rental request?',
        answer:
            'A request can only be approved or rejected by the landlord while it is pending. If your plans change, contact the landlord or our support team before it is approved. If you need different dates, you can send a new request once your current request for that property is no longer pending.',
        category: 'Tenants',
    },
    {
        question: 'Who can write a review?',
        answer:
            'Only tenants whose rental request for that property was approved (or is active after payment) can review it, and each tenant can review a property once. This keeps ratings tied to real rentals. You can write a review from your dashboard under Reviews or on the property page.',
        category: 'Tenants',
    },
    {
        question: 'What does the AI rental assistant do?',
        answer:
            'The assistant, powered by Anthropic’s Claude, answers questions about renting on RentNest and recommends available listings that match what you describe — for example an area, budget or number of bedrooms. Recommended properties link straight to their pages. It can make mistakes, so always check the listing details before you request dates.',
        category: 'Tenants',
    },
    {
        question: 'Why was my rental request rejected?',
        answer:
            'Landlords decide on each request individually — common reasons are dates that do not suit them or another tenant already being chosen. A rejected request is closed and cannot be reopened, but you are free to request different dates or explore similar properties.',
        category: 'Tenants',
    },

    // --- Landlords ---
    {
        question: 'How do I approve or reject a rental request?',
        answer:
            'Open Requests in your landlord dashboard. Each pending request shows the tenant, property and dates, with Approve and Reject actions. Only pending requests can be changed, and an approval is blocked if the dates overlap another approved or active rental of the same property.',
        category: 'Landlords',
    },
    {
        question: 'Can AI help me write my listing description?',
        answer:
            'Yes. On the add or edit property form, the AI description helper uses your title, location and details to draft a description, a few highlights and suggested amenities. Review and edit the draft before saving — you are responsible for keeping your listing accurate.',
        category: 'Landlords',
    },
    {
        question: 'Can my listing be hidden by RentNest?',
        answer:
            'Our admin team moderates listings and can hide a property that is inaccurate, misleading or breaks our terms. Hidden listings stay in your dashboard but do not appear in public search. Contact support if you think a listing was hidden by mistake.',
        category: 'Landlords',
    },

    // --- Payments ---
    {
        question: 'Where can I see my payments and earnings?',
        answer:
            'Tenants see every payment, with its amount, status, date and Stripe transaction ID, under Payments in the tenant dashboard. Landlords see payments received for their properties, with monthly totals, under Earnings in the landlord dashboard.',
        category: 'Payments',
    },
    {
        question: 'Does RentNest collect a security deposit or advance?',
        answer:
            'No. The only payment taken through RentNest is the first month’s rent after approval. Any deposit or advance a landlord asks for is a separate arrangement between you and the landlord — agree it in writing and get a receipt.',
        category: 'Payments',
    },

    // --- Account ---
    {
        question: 'How do I update my profile or change my password?',
        answer:
            'Open Profile from the account menu in your dashboard. You can update your name, phone number, avatar URL and short bio, and change your password. If you signed up with Google, you can set a password there without entering a current one.',
        category: 'Account',
    },
    {
        question: 'What are the password requirements?',
        answer:
            'Passwords must be at least 8 characters long and contain at least one letter and one number. Using a longer passphrase with a mix of upper- and lower-case letters and symbols makes your account stronger.',
        category: 'Account',
    },
    {
        question: 'Can I switch between tenant and landlord roles?',
        answer:
            'Each account has one role, chosen when you register. If you want to both rent and list properties, create a second account with a different email address, or contact support and we will help.',
        category: 'Account',
    },
];
