<div align="center">

# 🏠 RentNest

### Find your nest. List your space.

**A modern rental marketplace connecting tenants, landlords, and admins — from browsing listings to secure online payments, all in one platform.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-008CDD?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com)

[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](#-license)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](#-contributing)

</div>

---

## ✨ What is RentNest?

RentNest is a **full-featured rental marketplace frontend** built as the client for the [RentNest REST API](https://github.com/Souad5). It delivers a complete property-rental experience with **three distinct roles**, each with its own dedicated dashboard:

| Role | What they do |
|---|---|
| 🔍 **Tenant** | Browse & search listings, view property details and reviews, send rental requests, and pay securely with **Stripe** |
| 🏡 **Landlord** | Publish, edit, and manage property listings, track portfolio metrics, and approve/reject rental requests |
| 🛡️ **Admin** | Oversee the whole marketplace — manage users (ban/unban), moderate all properties, and monitor activity |

From the moment a tenant discovers a listing to the moment their rent payment is confirmed via Stripe, the entire journey lives inside this app.

## 🚀 Key Features

- 🎨 **Beautiful landing page** — hero section, discover places, property type showcase, newsletter signup
- 🔎 **Property browsing** — searchable public listings with category filtering, detail pages, and photo galleries
- 💬 **Reviews system** — tenants rate and review properties; average ratings shown on every listing
- 🔐 **JWT authentication** — login/register flows with role-aware redirects and protected route middleware
- 📊 **Role-based dashboards**
  - Landlord: metrics overview (Recharts), full property CRUD, rental request management
  - Tenant: request tracking with live status, Stripe checkout, payment history
  - Admin: user management table with ban toggling, global property moderation
- 💳 **Stripe integration** — real Payment Intents flow (`clientSecret` → confirm → success/cancel pages)
- ⚡ **Smart data fetching** — TanStack Query v5 caching, optimistic updates, skeleton loading states
- 🛡️ **Layered security** — server-side middleware gate + client-side `RoleGuard` component
- ✅ **End-to-end validation** — Zod schemas shared between React Hook Form and API error surfacing

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) · [React 19](https://react.dev) |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS v4 (CSS-variable theme tokens) |
| UI Kit | shadcn/ui (radix-nova) · Radix UI · Lucide icons |
| Data | TanStack Query v5 · TanStack Table v8 |
| Forms | React Hook Form + Zod resolvers |
| Payments | Stripe (`@stripe/react-stripe-js`) |
| Animation | Framer Motion |
| Charts | Recharts |
| State | Zustand |

## 📁 Project Structure

```
rentnest-frontend/
├── middleware.ts                 # Server-side auth gate for /dashboard/* (cookie-based)
├── next.config.ts                # Remote image domains (Unsplash, Cloudinary)
├── src/
│   ├── app/
│   │   ├── (public)/             # Public marketing & browsing area
│   │   │   ├── page.tsx          # Landing page (Hero, DiscoverPlaces, …)
│   │   │   └── properties/
│   │   │       ├── page.tsx      # Browse all listings
│   │   │       └── [id]/page.tsx # Property detail + reviews
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx    # Sign in
│   │   │   └── register/page.tsx # Create account
│   │   ├── dashboard/
│   │   │   ├── admin/            # User management & moderation
│   │   │   ├── landlord/         # Properties CRUD, requests, metrics
│   │   │   └── tenant/           # Rental requests & payments
│   │   └── payment/              # Stripe success / cancel pages
│   ├── components/
│   │   ├── ui/                   # shadcn/ui primitives (button, dialog, …)
│   │   ├── shared/               # App-prefixed building blocks
│   │   │                         #   (AppButton, AppDataTable, PropertyCard, Navbar…)
│   │   ├── home/                 # Landing page sections
│   │   ├── forms/                # PropertyForm, RentalRequestForm, ReviewFormModal
│   │   ├── checkout/             # Stripe checkout wrapper
│   │   ├── reviews/              # Review list & form components
│   │   ├── payment/              # StripeCheckoutForm
│   │   └── guard/                # RoleGuard (client-side RBAC)
│   ├── providers/
│   │   ├── AuthProvider.tsx      # JWT session, mirrors token → cookie
│   │   ├── QueryProvider.tsx     # TanStack Query setup
│   │   └── ToastProvider.tsx     # Sonner notifications
│   ├── hooks/                    # useAuth, useProperties, useRentals, usePayments
│   ├── lib/
│   │   ├── api.ts                # Typed fetch client, ApiError, endpoint modules
│   │   ├── auth.ts               # Token/session helpers
│   │   └── stripe.ts             # Stripe client init
│   ├── schemas/                  # Zod validation schemas
│   └── types/                    # Shared TS types (api, routes, env)
```

## 🧭 Route Map

| Route | Access | Description |
|---|---|---|
| `/` | Public | Landing page |
| `/properties` · `/properties/[id]` | Public | Browse listings · Property details & reviews |
| `/login` · `/register` | Guest | Authentication |
| `/dashboard` | Authenticated | Redirects to role home |
| `/dashboard/tenant` | Tenant | Overview, rental requests, Stripe payment flow |
| `/dashboard/landlord` | Landlord | Metrics, properties CRUD, incoming requests |
| `/dashboard/admin` | Admin | Users management, property moderation |

> **Auth architecture:** the JWT lives in `localStorage` (attached as `Bearer` by the API client) and is mirrored into a `token` cookie so Next.js middleware can gate `/dashboard/*` before hydration. Fine-grained role enforcement happens client-side via `RoleGuard`.

## ⚙️ Getting Started

### Prerequisites

- Node.js 18+
- A running instance of the RentNest backend (or the hosted API)
- A Stripe publishable key

### Installation

```bash
# Clone the repository
git clone https://github.com/Souad5/Rentnest-frontend.git
cd rentnest-frontend

# Install dependencies
npm install

# Configure environment variables (see table below)
touch .env.local
```

### Environment Variables

Create a `.env.local` at the project root:

| Variable | Required | Description | Example |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | No¹ | Backend REST base URL | `http://localhost:5000/api` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe publishable key (browser-exposed) | `pk_test_…` |

¹ Defaults to `https://rentnest-backend-five.vercel.app/api`.

> ⚠️ Both variables are prefixed with `NEXT_PUBLIC_`, meaning they are embedded in the client bundle — never put secret keys here.

### Run It

```bash
npm run dev        # Start dev server → http://localhost:3000
```

Other scripts:

```bash
npm run lint       # ESLint
npx tsc --noEmit   # Typecheck
npm run build      # Production build
npm start          # Serve production build
```

## 🔌 Backend Contract

The frontend talks to a separate NestJS-style REST backend over `/api`. All endpoints are centralized in [`src/lib/api.ts`](src/lib/api.ts) as typed modules:

`authApi` · `propertiesApi` · `landlordApi` · `rentalsApi` · `paymentsApi` · `reviewsApi` · `adminApi`

Errors are normalized into an `ApiError` class carrying status code and structured validation details (`errorDetails`), so forms can display field-level messages from Zod-validated backend responses.

## 🗺 Roadmap

- [ ] Multi-image upload per property
- [ ] Advanced search (price range, map view)
- [ ] Real-time notifications for new rental requests
- [ ] Dark mode

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a PR.

1. Fork the repo
2. Create your branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m "feat: add amazing feature"`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

<div align="center">

Built with ❤️ by [Souad](https://github.com/Souad5)

⭐ Star this repo if you find it useful!

</div>
