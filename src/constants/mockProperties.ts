import { Property } from "@/types/api";

export const MOCK_PROPERTIES: Property[] = [
  {
    id: "prop-1",
    title: "Modern Luxury Apartment in Downtown",
    description:
      "A sleek, sun-drenched 2-bedroom apartment with floor-to-ceiling windows, stainless steel appliances, and panoramic city views.",
    address: "124 Financial District Blvd, Apt 14B",
    location: "Downtown, San Francisco",
    price: 3200,
    categoryId: "cat-apartment",
    bedrooms: 2,
    bathrooms: 2,
    sizeSqFt: 1150,
    isAvailable: true,
    images: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
    ],
    createdAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "prop-2",
    title: "Cozy Waterfront Studio",
    description:
      "Charming seaside studio with updated kitchen, custom built-in storage, and direct beach access.",
    address: "450 Ocean View Drive",
    location: "Marina Bay, San Diego",
    price: 1850,
    categoryId: "cat-studio",
    bedrooms: 1,
    bathrooms: 1,
    sizeSqFt: 620,
    isAvailable: true,
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    ],
    createdAt: "2026-02-01T14:30:00Z",
  },
  {
    id: "prop-3",
    title: "Spacious Family Villa with Garden",
    description:
      "Beautiful 4-bedroom detached villa featuring a private backyard, two-car garage, and newly remodeled master suite.",
    address: "882 Oakridge Lane",
    location: "Suburbs, Austin",
    price: 4500,
    categoryId: "cat-house",
    bedrooms: 4,
    bathrooms: 3,
    sizeSqFt: 2800,
    isAvailable: true,
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    ],
    createdAt: "2026-02-10T09:15:00Z",
  },
  {
    id: "prop-4",
    title: "Urban Penthouse Loft",
    description:
      "Industrial-chic open loft with high exposed-brick ceilings, polished concrete floors, and a private rooftop terrace.",
    address: "710 Grand Avenue, Unit 501",
    location: "Loft District, Chicago",
    price: 2900,
    categoryId: "cat-loft",
    bedrooms: 2,
    bathrooms: 2,
    sizeSqFt: 1400,
    isAvailable: false,
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
    ],
    createdAt: "2026-01-20T11:45:00Z",
  },
  {
    id: "prop-5",
    title: "Sunlit Suburban Townhouse",
    description:
      "Three-story contemporary townhouse located near top-rated schools, parks, and public transit links.",
    address: "312 Maple Creek Way",
    location: "Green Valley, Seattle",
    price: 3600,
    categoryId: "cat-townhouse",
    bedrooms: 3,
    bathrooms: 2.5,
    sizeSqFt: 1950,
    isAvailable: true,
    images: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
    ],
    createdAt: "2026-02-12T16:20:00Z",
  },
];
