// Shared API types — mirror the backend contract exactly.

export type UserRole = 'TENANT' | 'LANDLORD' | 'ADMIN';
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'COMPLETED';
/** @deprecated use RequestStatus */
export type RentalStatus = RequestStatus;
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface ApiEnvelope<T> {
    success: boolean;
    message: string;
    data: T;
    meta?: PaginationMeta;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    isBanned: boolean;
    phone: string | null;
    avatarUrl: string | null;
    bio: string | null;
    authProvider: 'LOCAL' | 'GOOGLE';
    createdAt: string;
    updatedAt: string;
}

export interface AuthPayload {
    user: User;
    token: string;
}

export interface Category {
    id: string;
    name: string;
    description: string | null;
    propertyCount?: number;
}

export interface PropertySummary {
    id: string;
    title: string;
    description: string;
    address: string;
    location: string;
    price: number;
    isAvailable: boolean;
    imageUrl: string | null;
    images: string[];
    bedrooms: number | null;
    bathrooms: number | null;
    areaSqft: number | null;
    amenities: string[];
    categoryId: string;
    category: { id: string; name: string };
    landlordId: string;
    landlord: { id: string; name: string };
    avgRating: number;
    reviewCount: number;
    createdAt: string;
    updatedAt: string;
}

/** @deprecated use PropertySummary */
export type Property = PropertySummary;

export interface Review {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    tenant: { id: string; name: string };
    property?: { id: string; title: string; location: string };
}

export interface PropertyDetail extends Omit<PropertySummary, 'landlord'> {
    landlord: { id: string; name: string; createdAt: string; propertyCount: number };
    reviews: Review[];
}

export interface Payment {
    id: string;
    rentalRequestId: string;
    userId: string;
    amount: number;
    transactionId: string;
    provider: string;
    status: PaymentStatus;
    paidAt: string | null;
    createdAt: string;
    rentalRequest?: RentalRequest;
}

export interface RentalRequest {
    id: string;
    tenantId: string;
    propertyId: string;
    startDate: string;
    endDate: string;
    status: RequestStatus;
    createdAt: string;
    updatedAt: string;
    property?: Partial<PropertySummary> & { id: string; title: string; price: number };
    tenant?: { id: string; name: string; email: string };
    payment?: Payment | null;
}

export interface MonthPoint {
    month: string; // YYYY-MM
    label: string; // e.g. "May"
    [key: string]: number | string;
}

export interface StatusCount {
    status: RequestStatus;
    count: number;
}

export interface LocationStat {
    location: string;
    count: number;
    imageUrl: string | null;
}

export interface PublicStats {
    totalProperties: number;
    availableProperties: number;
    totalLandlords: number;
    totalTenants: number;
    totalCities: number;
    averageRating: number;
    totalReviews: number;
    successfulRentals: number;
}

export interface TenantStats {
    totalRequests: number;
    pending: number;
    approved: number;
    active: number;
    rejected: number;
    completed: number;
    totalSpent: number;
    reviewsWritten: number;
    monthlySpending: MonthPoint[];
    requestsByStatus: StatusCount[];
}

export interface LandlordStats {
    totalProperties: number;
    availableProperties: number;
    pendingRequests: number;
    activeRentals: number;
    totalEarnings: number;
    averageRating: number;
    totalReviews: number;
    monthlyEarnings: MonthPoint[];
    requestsByStatus: StatusCount[];
    topProperties: Array<{ id: string; title: string; requests: number; earnings: number }>;
}

export interface AdminStats {
    totals: {
        users: number;
        tenants: number;
        landlords: number;
        admins: number;
        bannedUsers: number;
        properties: number;
        availableProperties: number;
        rentals: number;
        pendingRentals: number;
        activeRentals: number;
        revenue: number;
        reviews: number;
        subscribers: number;
        unreadMessages: number;
    };
    monthly: MonthPoint[];
    rentalsByStatus: StatusCount[];
    propertiesByCategory: Array<{ name: string; count: number }>;
    usersByRole: Array<{ role: UserRole; count: number }>;
}

/** Admin user listing row */
export interface AdminUser extends Pick<User, 'id' | 'name' | 'email' | 'role' | 'isBanned' | 'createdAt'> {
    _count?: { properties: number; rentalRequests: number };
}

/** Admin / landlord property row (may include counts) */
export interface ManagedProperty extends Omit<PropertySummary, 'landlord'> {
    landlord?: { id: string; name: string; email?: string };
    _count?: { rentalRequests: number; reviews: number };
}

export interface ContactMessage {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

export interface NewsletterSubscriber {
    id: string;
    email: string;
    createdAt: string;
}

export interface SearchSuggestion {
    text: string;
    type: 'property' | 'location' | 'category' | 'query';
    propertyId?: string;
    categoryId?: string;
    location?: string;
}

export interface SearchFilters {
    location?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
}

export interface SearchSuggestionsResult {
    suggestions: SearchSuggestion[];
    filters: SearchFilters;
    source: 'ai' | 'basic';
}

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface ChatResult {
    reply: string;
    properties: PropertySummary[];
}

export interface PropertyDescriptionInput {
    title: string;
    location: string;
    address?: string;
    category?: string;
    bedrooms?: number;
    bathrooms?: number;
    areaSqft?: number;
    amenities?: string[];
    price?: number;
    notes?: string;
}

export interface PropertyDescriptionResult {
    description: string;
    highlights: string[];
    suggestedAmenities: string[];
}

export interface AdminInsights {
    summary: string;
    insights: Array<{ title: string; detail: string; severity: 'info' | 'positive' | 'warning' }>;
    generatedAt: string;
}

export interface PropertyQuery {
    search?: string;
    location?: string;
    categoryId?: string;
    category?: string;
    minPrice?: number | string;
    maxPrice?: number | string;
    bedrooms?: number | string;
    minRating?: number | string;
    sort?: 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'rating' | 'popular';
    page?: number | string;
    limit?: number | string;
}

export interface PropertyInput {
    title: string;
    description: string;
    address: string;
    location: string;
    price: number;
    categoryId: string;
    images?: string[];
    imageUrl?: string;
    /** null clears the value on update */
    bedrooms?: number | null;
    bathrooms?: number | null;
    areaSqft?: number | null;
    amenities?: string[];
    isAvailable?: boolean;
}
