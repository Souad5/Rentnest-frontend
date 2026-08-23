export type UserRole = "TENANT" | "LANDLORD" | "ADMIN";
export type RentalStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string; // Add optional avatar URL property
  phone?: string;
  isBanned?: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PropertyCategory {
  id: string;
  name: string;
  description?: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  address: string;
  location: string;
  price: number;
  categoryId: string;
  category?: PropertyCategory;
  landlordId?: string;
  images?: string[];
  imageUrl?: string | null;
  isAvailable?: boolean;
  bedrooms?: number;
  bathrooms?: number;
  sizeSqFt?: number;
  createdAt?: string;
}

export interface RentalRequest {
  id: string;
  propertyId: string;
  property?: Property;
  tenantId: string;
  tenant?: User;
  startDate: string;
  endDate: string;
  status: RentalStatus;
  createdAt?: string;
}

export interface PaymentIntent {
  clientSecret?: string;
  paymentIntentId: string;
  amount: number;
  rentalRequestId: string;
}

export interface PaymentRecord {
  id: string;
  rentalRequestId: string;
  paymentIntentId: string;
  amount: number;
  status: string;
  createdAt: string;
}

export interface Review {
  id: string;
  propertyId: string;
  userId: string;
  user?: Pick<User, "name">;
  rating: number;
  comment: string;
  createdAt: string;
}
