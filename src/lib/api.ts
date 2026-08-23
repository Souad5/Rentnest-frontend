const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/**
 * Structured API Error Response
 */
export class ApiError extends Error {
  public status: number;
  public data: Record<string, unknown>;

  constructor(
    message: string,
    status: number,
    data: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Universal Fetch Client with Token Injection & Error Normalization
 */
async function fetcher<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      data.message || `API request failed with status ${response.status}`,
      response.status,
      data,
    );
  }

  return data as T;
}

// ==========================================
// 1. AUTH API
// ==========================================
export const authApi = {
  register: (payload: Record<string, unknown>) =>
    fetcher<{ token: string; user: Record<string, unknown> }>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    ),

  login: (credentials: Record<string, unknown>) =>
    fetcher<{ token: string; user: Record<string, unknown> }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  getMe: () =>
    fetcher<{ id: string; email: string; role: string; name: string }>(
      "/auth/me",
    ),
};

// ==========================================
// 2. PROPERTIES API (PUBLIC)
// ==========================================
export const propertiesApi = {
  getCategories: () =>
    fetcher<Array<{ id: string; name: string; slug: string }>>(
      "/properties/categories",
    ),

  getAll: (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : "";
    return fetcher<Array<Record<string, unknown>>>(`/properties${query}`);
  },

  getById: (id: string) =>
    fetcher<Record<string, unknown>>(`/properties/${id}`),
};

// ==========================================
// 3. LANDLORD API
// ==========================================
export const landlordApi = {
  // Authenticated portfolio listing: returns the landlord's own properties in
  // every availability state (public GET /properties only ever returns
  // isAvailable=true, which would hide rented-out listings).
  getMyProperties: () =>
    fetcher<{ success: boolean; message: string; data: ApiProperty[] }>(
      "/landlord/properties",
    ),

  createProperty: (payload: Record<string, unknown> | FormData) =>
    fetcher<{ success: boolean; message: string; data: ApiProperty }>(
      "/properties/landlord",
      {
        method: "POST",
        body: payload instanceof FormData ? payload : JSON.stringify(payload),
      },
    ),

  updateProperty: (id: string, payload: Record<string, unknown>) =>
    fetcher<{ success: boolean; message: string; data: ApiProperty }>(
      `/properties/landlord/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
    ),

  deleteProperty: (id: string) =>
    fetcher<{ success: boolean; message: string }>(
      `/properties/landlord/${id}`,
      {
        method: "DELETE",
      },
    ),

  getRequests: () =>
    fetcher<{
      success: boolean;
      message: string;
      data: Array<Record<string, unknown>>;
    }>("/landlord/requests"),

  updateRequestStatus: (id: string, status: "APPROVED" | "REJECTED") =>
    fetcher<{ success: boolean; message: string }>(`/landlord/requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};

// ==========================================
// 4. RENTALS API (TENANT)
// ==========================================
export const rentalsApi = {
  createRequest: (payload: {
    propertyId: string;
    startDate: string;
    endDate: string;
    notes?: string;
  }) =>
    fetcher<Record<string, unknown>>("/rentals", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getMyRequests: () =>
    fetcher<Array<Record<string, unknown>>>("/rentals/my-requests"),

  getById: (id: string) => fetcher<Record<string, unknown>>(`/rentals/${id}`),
};

// ==========================================
// 5. PAYMENTS API
// ==========================================
export const paymentsApi = {
  // Backend derives the amount from the rental request's property price;
  // only the rentalRequestId is accepted by the backend contract.
  createPaymentIntent: (rentalRequestId: string) =>
    fetcher<{
      success: boolean;
      message: string;
      data: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        alreadyPaid: any;
        clientSecret: string;
        transactionId: string;
        amount: number;
        currency: string;
      };
    }>("/payments/create", {
      method: "POST",
      body: JSON.stringify({ rentalRequestId }),
    }),

  confirmPayment: (paymentIntentId: string) =>
    fetcher<{
      success: boolean;
      message: string;
      data: {
        id: string;
        rentalRequestId: string;
        status: "PENDING" | "COMPLETED" | "FAILED";
        paidAt: string | null;
      };
    }>("/payments/confirm", {
      method: "POST",
      body: JSON.stringify({ paymentIntentId }),
    }),

  getPayments: () =>
    fetcher<{
      success: boolean;
      message: string;
      data: Array<{
        id: string;
        rentalRequestId: string;
        amount: number;
        status: string;
        createdAt: string;
      }>;
    }>("/payments"),
  getPaymentById: (id: string) =>
    fetcher<Record<string, unknown>>(`/payments/${id}`),
};

// ==========================================
// 6. REVIEWS API
// ==========================================
export const reviewsApi = {
  getByPropertyId: (propertyId: string) =>
    fetcher<Array<Record<string, unknown>>>(`/reviews/property/${propertyId}`),

  createReview: (payload: {
    propertyId: string;
    rating: number;
    comment: string;
  }) =>
    fetcher<Record<string, unknown>>("/reviews", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

// Export shared interfaces for Admin features
export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: "TENANT" | "LANDLORD" | "ADMIN";
  isBanned: boolean;
  createdAt: string;
  _count?: {
    properties: number;
    rentalRequests: number;
  };
}

export interface ApiProperty {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  images: any;
  imageUrl?: string | null;
  id: string;
  title: string;
  description: string;
  address: string;
  location: string;
  price: number;
  isAvailable: boolean;
  landlordId: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
  };
  landlord?: {
    id: string;
    name: string;
    email: string;
  };
  _count?: {
    rentalRequests: number;
    reviews: number;
  };
}

// ==========================================
// 7. ADMIN API
// ==========================================
export const adminApi = {
  // Fetch all users
  getUsers: () =>
    fetcher<{ success: boolean; message: string; data: ApiUser[] }>(
      "/admin/users",
    ),

  // Toggle Ban status (PATCH) - sends JSON body to avoid validation errors
  toggleBanUser: (userId: string, isBanned?: boolean) =>
    fetcher<{ success: boolean; message: string; data: ApiUser }>(
      `/admin/users/${userId}`,
      {
        method: "PATCH",
        body: JSON.stringify(isBanned !== undefined ? { isBanned } : {}),
      },
    ),

  // Fetch all properties globally
  getProperties: () =>
    fetcher<{ success: boolean; message: string; data: ApiProperty[] }>(
      "/admin/properties",
    ),
};

// ==========================================
// 7. Rental API
// ==========================================

export interface CreateRentalPayload {
  propertyId: string;
  startDate: string; // ISO string format
  endDate: string; // ISO string format
}

export const rentalApi = {
  async createRental(payload: CreateRentalPayload, token: string) {
    const res = await fetch(`${BASE_URL}/rentals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to submit rental request");
    }
    return data;
  },
};

// ========================
// ---------Payment Api----
// =========================
