// Single source of truth for site-wide constants (brand, contact, social,
// navigation). Update contact details and social URLs here before launch.

export const siteConfig = {
    name: 'RentNest',
    tagline: 'Find, rent and manage homes with confidence',
    description:
        'RentNest connects tenants with verified landlords. Search homes, request your dates, pay securely and manage everything from one dashboard.',
    contact: {
        email: 'support@rentnest.com',
        phone: '+880 1700-000000',
        address: 'House 12, Road 11, Gulshan 1, Dhaka 1212, Bangladesh',
        hours: 'Sun–Thu, 9:00 AM – 6:00 PM (GMT+6)',
    },
    social: [
        { label: 'Facebook', href: 'https://www.facebook.com/rentnest' },
        { label: 'X (Twitter)', href: 'https://x.com/rentnest' },
        { label: 'Instagram', href: 'https://www.instagram.com/rentnest' },
        { label: 'LinkedIn', href: 'https://www.linkedin.com/company/rentnest' },
    ],
    // Primary navbar routes (logged out). Logged-in users additionally get
    // "Dashboard" and a role-specific shortcut (see Navbar).
    mainNav: [
        { label: 'Home', href: '/' },
        { label: 'Explore', href: '/properties' },
        { label: 'About', href: '/about' },
        { label: 'Blog', href: '/blog' },
        { label: 'Contact', href: '/contact' },
    ],
    footerNav: {
        explore: [
            { label: 'All properties', href: '/properties' },
            { label: 'Apartments', href: '/properties?category=Apartment' },
            { label: 'Studios', href: '/properties?category=Studio' },
            { label: 'Luxury villas', href: '/properties?category=Luxury%20Villa' },
            { label: 'Top rated', href: '/properties?sort=rating' },
        ],
        company: [
            { label: 'About us', href: '/about' },
            { label: 'Blog & guides', href: '/blog' },
            { label: 'Contact', href: '/contact' },
            { label: 'List your property', href: '/register?role=LANDLORD' },
        ],
        support: [
            { label: 'Help center', href: '/help' },
            { label: 'Privacy policy', href: '/privacy' },
            { label: 'Terms of service', href: '/terms' },
            { label: 'Sign in', href: '/login' },
        ],
    },
    // Demo accounts created by the backend seed script (prisma/seed.ts).
    demoAccounts: [
        { role: 'TENANT', label: 'Tenant', email: 'tenant@example.com', password: 'password123' },
        { role: 'LANDLORD', label: 'Landlord', email: 'john.landlord@example.com', password: 'password123' },
        { role: 'ADMIN', label: 'Admin', email: 'admin@rentnest.com', password: 'Admin@123456' },
    ],
} as const;

export type SiteConfig = typeof siteConfig;

export function dashboardHomeFor(role?: string | null): string {
    switch (role) {
        case 'ADMIN':
            return '/dashboard/admin';
        case 'LANDLORD':
            return '/dashboard/landlord';
        default:
            return '/dashboard/tenant';
    }
}
