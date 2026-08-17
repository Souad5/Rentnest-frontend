# RentNest API Integration Documentation 🏠

This document maps all frontend components and App Router pages to their corresponding backend REST API endpoints.

## Base Configuration

- **Base URL:** `process.env.NEXT_PUBLIC_API_URL` (e.g., `http://localhost:3000/api`)
- **Authentication:** Bearer JWT token stored in `localStorage` or HttpOnly cookies, injected via Authorization header: `Authorization: Bearer <token>`

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
| **Payments**   | `POST`      | `/api/payments/create`          | `/dashboard/tenant/requests/[id]/pay`         | Create Stripe checkout payment session              |
| **Payments**   | `POST`      | `/api/payments/confirm`         | `/payment/success`                            | Confirm completed checkout session                  |
| **Payments**   | `GET`       | `/payments`                     | `/dashboard/tenant` (`PaymentHistory.tsx`)    | Tenant payment history list                         |
| **Payments**   | `GET`       | `/payments/:id`                 | `/payment/success`                            | Fetch receipt details                               |
| **Reviews**    | `GET`       | `/reviews/property/:propertyId` | `/properties/[id]` (`ReviewSection.tsx`)      | Fetch reviews for a specific property               |
| **Reviews**    | `POST`      | `/reviews`                      | `/dashboard/tenant` (`ReviewModal.tsx`)       | Post review for completed rental                    |
| **Admin**      | `GET`       | `/admin/users`                  | `/dashboard/admin` (`UserTable.tsx`)          | List all users with pagination                      |
| **Admin**      | `PATCH`     | `/admin/users/:id`              | `/dashboard/admin` (`UserTable.tsx`)          | Ban, unban, or edit user role                       |
| **Admin**      | `GET`       | `/admin/properties`             | `/dashboard/admin` (`AdminPropertyGrid.tsx`)  | Moderate all platform property listings             |
| **Admin**      | `GET`       | `/admin/rentals`                | `/dashboard/admin` (`AdminRentalTable.tsx`)   | Overview of all rental transactions                 |
| **Admin**      | `GET`       | `/admin/categories/:id`         | `/dashboard/admin/categories`                 | Manage platform category details                    |
