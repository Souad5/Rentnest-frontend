// ==========================================
// 1. AUTHENTICATION SERVICES

import { apiFetch } from "@/lib/api";
import {
  AuthResponse,
  PaymentIntent,
  PaymentRecord,
  Property,
  PropertyCategory,
  RentalRequest,
  RentalStatus,
  Review,
  User,
  UserRole,
} from "@/types/api";

// ==========================================
export const AuthService = {
  register: (payload: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }) =>
    apiFetch<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string }) =>
    apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getCurrentUser: () => apiFetch<User>("/auth/me"),
};

// ==========================================
// 2. PUBLIC PROPERTY SERVICES
// ==========================================
export const PropertyService = {
  getCategories: () => apiFetch<PropertyCategory[]>("/properties/categories"),

  getAll: (params?: Record<string, string>) => {
    const queryString = params
      ? "?" + new URLSearchParams(params).toString()
      : "";
    return apiFetch<Property[]>(`/properties${queryString}`);
  },

  getById: (id: string) => apiFetch<Property>(`/properties/${id}`),
};

// ==========================================
// 3. LANDLORD SERVICES
// ==========================================
export const LandlordService = {
  createProperty: (payload: {
    title: string;
    description: string;
    address: string;
    location: string;
    price: number;
    categoryId: string;
  }) =>
    apiFetch<Property>("/properties/landlord", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /** Note: Fixed URL structure based on Postman cleanup recommendation */
  updateProperty: (id: string, payload: Partial<Property>) =>
    apiFetch<Property>(`/properties/landlord/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  deleteProperty: (id: string) =>
    apiFetch<{ success: boolean }>(`/landlord/properties/${id}`, {
      method: "DELETE",
    }),

  getRentalRequests: () =>
    apiFetch<RentalRequest[]>("/rentals/landlord-requests"),

  updateRentalStatus: (requestId: string, status: RentalStatus) =>
    apiFetch<RentalRequest>(`/landlord/requests/${requestId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};

// ==========================================
// 4. TENANT & RENTAL SERVICES
// ==========================================
export const RentalService = {
  createRequest: (payload: {
    propertyId: string;
    startDate: string;
    endDate: string;
  }) =>
    apiFetch<RentalRequest>("/rentals", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getMyRequests: () => apiFetch<RentalRequest[]>("/rentals/my-requests"),

  getById: (id: string) => apiFetch<RentalRequest>(`/rentals/${id}`),
};

// ==========================================
// 5. PAYMENT SERVICES (Uses payment base URL)
// ==========================================
export const PaymentService = {
  createIntent: (payload: { rentalRequestId: string; amount: number }) =>
    apiFetch<PaymentIntent>("/payments/create", {
      method: "POST",
      body: JSON.stringify(payload),
      isPaymentApi: true,
    }),

  confirmPayment: (payload: {
    rentalRequestId: string;
    paymentIntentId: string;
    amount: number;
  }) =>
    apiFetch<PaymentRecord>("/payments/confirm", {
      method: "POST",
      body: JSON.stringify(payload),
      isPaymentApi: true,
    }),

  getPayments: () => apiFetch<PaymentRecord[]>("/payments"),

  getPaymentById: (id: string) => apiFetch<PaymentRecord>(`/payments/${id}`),
};

// ==========================================
// 6. REVIEW SERVICES
// ==========================================
export const ReviewService = {
  getByPropertyId: (propertyId: string) =>
    apiFetch<Review[]>(`/reviews/property/${propertyId}`),

  create: (payload: { propertyId: string; rating: number; comment: string }) =>
    apiFetch<Review>("/reviews", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

// ==========================================
// 7. ADMIN SERVICES
// ==========================================
export const AdminService = {
  getUsers: () => apiFetch<User[]>("/admin/users"),

  setUserBanStatus: (userId: string, isBanned: boolean) =>
    apiFetch<User>(`/admin/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({ isBanned }),
    }),

  getProperties: () => apiFetch<Property[]>("/admin/properties"),

  getRentals: () => apiFetch<RentalRequest[]>("/admin/rentals"),

  /** Fixed endpoints from documentation recommendations */
  updateCategory: (id: string, payload: Partial<PropertyCategory>) =>
    apiFetch<PropertyCategory>(`/admin/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  deleteCategory: (id: string) =>
    apiFetch<{ success: boolean }>(`/admin/categories/${id}`, {
      method: "DELETE",
    }),
};
