# RentNest API Integration Documentation 🏠

This document maps all frontend components and App Router pages to their corresponding backend REST API endpoints.

## Base Configuration

- **Base URL:** `process.env.NEXT_PUBLIC_API_URL` (defaults to `http://localhost:5000/api` in `src/lib/api.ts`)
- **Authentication:** Bearer JWT stored in `localStorage.token` (mirrored into a plain `token` cookie for middleware), injected via Authorization header: `Authorization: Bearer <token>`

---

## Endpoint Mapping Table

| Module         | HTTP Method | API Endpoint                    | Frontend Route / Component                    | Description                                         |
| :------------- | :---------- | :------------------------------ | :-------------------------------------------- | :-------------------------------------------------- |
| **Auth**       | `POST`      | `/auth/register`                | `/auth/register` (`RegisterForm.tsx`)         | Register new user with role (`TENANT` / `LANDLORD`) |
| **Auth**       | `POST`      | `/auth/login`                   | `/auth/login` (`LoginForm.tsx`)               | Authenticate user & store JWT token                 |
| **Auth**       | `GET`       | `/auth/me`                      | `src/providers/AuthProvider.tsx`              | Fetch current session & user role profile           |
| **Properties** | `GET`       | `/properties/categories`        | `/properties` (`PropertyFilters.tsx`)         | Fetch categories for search filter sidebar          |
| **Properties** | `GET`       | `/properties`                   | `/` & `/properties` (`PropertyGrid.tsx`)      | Fetch listing grid with location/price filters      |
| **Properties** | `GET`       | `/properties/:id`               | `/properties/[id]` (`PropertyDetails.tsx`)    | Single property details & review list               |
| **Landlord**   | `POST`      | `/properties/landlord`          | `/dashboard/landlord/properties/new`          | Create a new property listing                       |
| **Landlord**   | `GET`       | `/properties/landlord/:id`      | `/dashboard/landlord/properties/[id]`         | View owned listing details                          |
| **Landlord**   | `DELETE`    | `/landlord/properties/:id`      | `/dashboard/landlord` (`PropertyList.tsx`)    | Delete a property listing                           |
| **Landlord**   | `GET`       | `/rentals/landlord-requests`    | `/dashboard/landlord/requests`                | Incoming tenant rental application table            |
| **Landlord**   | `PATCH`     | `/landlord/requests/:id`        | `/dashboard/landlord/requests`                | Approve or Reject tenant rental request             |
| **Rentals**    | `POST`      | `/rentals`                      | `/properties/[id]` (`RentalRequestModal.tsx`) | Submit a rental booking request                     |
| **Rentals**    | `GET`       | `/rentals/my-requests`          | `/dashboard/tenant` (`RequestHistory.tsx`)    | Tenant rental request status tracking               |
| **Rentals**    | `GET`       | `/rentals/:id`                  | `/dashboard/tenant/requests/[id]`             | Single rental request details                       |
| **Payments**   | `POST`      | `/payments/create`              | `/dashboard/tenant/requests/[id]/pay`         | Create Stripe PaymentIntent for APPROVED request    |
| **Payments**   | `POST`      | `/payments/confirm`             | `CheckoutForm.tsx` (pay page)                 | Verify intent server-side; mark payment COMPLETED   |
| **Payments**   | `GET`       | `/payments`                     | — (reserved; not yet consumed by a page)      | Tenant payment history list                         |
| **Payments**   | `GET`       | `/payments/:id`                 | `/payment/success`                            | Verify persisted payment status after checkout      |
| **Payments**   | `POST`      | `/payments/webhook`             | — (backend-only, Stripe → backend)            | Source of truth: COMPLETED/FAILED + rental ACTIVE   |
| **Reviews**    | `GET`       | `/reviews/property/:propertyId` | `/properties/[id]` (`ReviewSection.tsx`)      | Fetch reviews for a specific property               |
| **Reviews**    | `POST`      | `/reviews`                      | `/dashboard/tenant` (`ReviewModal.tsx`)       | Post review for completed rental                    |
| **Admin**      | `GET`       | `/admin/users`                  | `/dashboard/admin` (`UserTable.tsx`)          | List all users with pagination                      |
| **Admin**      | `PATCH`     | `/admin/users/:id`              | `/dashboard/admin` (`UserTable.tsx`)          | Ban, unban, or edit user role                       |
| **Admin**      | `GET`       | `/admin/properties`             | `/dashboard/admin` (`AdminPropertyGrid.tsx`)  | Moderate all platform property listings             |
| **Admin**      | `GET`       | `/admin/rentals`                | `/dashboard/admin` (`AdminRentalTable.tsx`)   | Overview of all rental transactions                 |
| **Admin**      | `GET`       | `/admin/categories/:id`         | `/dashboard/admin/categories`                 | Manage platform category details                    |

---

## Stripe Payment Flow (verified against backend implementation)

The backend uses **Stripe PaymentIntents + Elements** (no Checkout redirect session). The webhook and `POST /payments/confirm` are the source of truth for payment status; the frontend never marks a payment successful itself.

### 1. Create PaymentIntent

- **Page:** `/dashboard/tenant/requests/[id]/pay` (`initCheckout`)
- **Endpoint:** `POST /payments/create` — 🔒 Bearer token required
- **Payload:** `{ "rentalRequestId": "<uuid>" }` — amount is derived server-side from the property price; no client amount is sent
- **Response:** `{ success, message, data: { clientSecret, transactionId, amount, currency } }`
- Only requests with status `APPROVED` owned by the caller are accepted (404/400 otherwise).

### 2. Confirm card payment (Stripe Elements)

- **Component:** `src/app/dashboard/tenant/requests/[id]/pay/CheckoutForm.tsx`
- Stripe.js `confirmPayment({ elements })` with the `clientSecret`; no redirect off-site.
- On `paymentIntent.status === 'succeeded'` → **Endpoint:** `POST /payments/confirm` — 🔒 Bearer token required
  - **Payload:** `{ "paymentIntentId": "<pi_...>" }`
  - Backend re-retrieves the intent from Stripe; only `succeeded` intents are accepted. Marks payment `COMPLETED`, sets the rental request to `ACTIVE`. Idempotent.
- On `processing` → routed to `/payment/success` without a payment reference (confirming state).
- On Stripe error → inline error banner on the pay page.

### 3. Success page

- **Page:** `/payment/success?payment=<paymentRowId>&request=<rentalRequestId>`
- Fetches `GET /payments/:id` — 🔒 Bearer token required — and renders based on persisted status:
  - `COMPLETED` → verified success UI with amount
  - `PENDING` → "Confirming your payment…" (async webhook) with Check Again retry
  - `FAILED` → not-completed UI linking back to dashboard
  - Missing/unknown reference → neutral confirming state; success is never assumed from the URL alone.

### 4. Cancel

- **Page:** `/payment/cancel?request=<rentalRequestId>`
- Static informational state only; offers "Return to Payment" back to the pay page when `request` is present. No status changes are made from the frontend.

### 5. Dashboard reflection

- `/dashboard/tenant` reads rental status from `GET /rentals/my-requests`: `APPROVED` → **Pay Now** CTA; after confirmation/webhook the backend flips it to `ACTIVE` → Active Lease badge, Pay Now hidden.
