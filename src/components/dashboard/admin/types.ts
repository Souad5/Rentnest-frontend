import type { Payment, PaymentStatus, RentalRequest, Review } from '@/types/api';

type Person = { id: string; name: string; email: string };

/** GET /admin/rentals row: property includes its landlord, payment is a slim projection. */
export interface AdminRental extends Omit<RentalRequest, 'property' | 'payment'> {
    property?: {
        id: string;
        title: string;
        location?: string;
        price: number;
        imageUrl?: string | null;
        landlord?: Person;
    };
    payment?: {
        id: string;
        amount: number;
        status: PaymentStatus;
        provider: string;
        transactionId: string;
        paidAt: string | null;
    } | null;
}

/** GET /admin/payments row: includes the payer and the rental with property + tenant. */
export interface AdminPayment extends Omit<Payment, 'rentalRequest'> {
    user?: Person;
    rentalRequest?: Omit<RentalRequest, 'property' | 'tenant'> & {
        property?: { id: string; title: string };
        tenant?: Person;
    };
}

/** GET /admin/reviews row: tenant includes email. */
export interface AdminReview extends Omit<Review, 'tenant'> {
    tenant: { id: string; name: string; email?: string };
}
