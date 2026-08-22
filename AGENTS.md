# AGENTS.md

## Commands

- `npm run dev` – dev server on :3000
- `npm run build` – production build (`next build`, Turbopack); includes the type-check step
- `npm run lint` – ESLint 9 flat config (`eslint-config-next` core-web-vitals + TS); bare `eslint`, lints whole repo
- `npx tsc --noEmit` – standalone typecheck (no npm script exists)
- No test framework is configured. Verification = `npm run lint` + `npm run build`.

### Currently failing (re-verify before relying on this)

- `next build` fails type-check on `src/services/api.ts`: it imports `apiFetch`, which no longer exists in `@/lib/api`. Nothing imports this file — it is stale dead code. The live API layer is `src/lib/api.ts`.
- `npm run lint` reports 1 pre-existing error in `src/hooks/use-mobile.ts` (`react-hooks/set-state-in-effect`, stock shadcn hook) plus unused-var warnings elsewhere.

## Architecture

- Next.js 16 App Router, React 19, TypeScript strict mode. Path alias `@/* -> src/*`.
- Tailwind CSS v4 with CSS-first config in `src/app/globals.css` — there is no tailwind.config file.
- Route groups under `src/app`: `(auth)` login/register, `(public)` home + property listing/detail, `dashboard/<role>` for admin/landlord/tenant, `payment`.
- Data fetching via TanStack Query (`src/providers/QueryProvider.tsx`) with hooks in `src/hooks`; zustand available for client state.
- Frontend↔backend endpoint contract is documented in `API_INTEGRATION.md`.

## Auth model (easy to break)

Auth state lives in TWO places and must stay in sync:

- `localStorage.token` – read by the fetch client (`src/lib/api.ts`) to attach `Authorization: Bearer`
- cookies `token` and `role` – the ONLY thing `middleware.ts` reads to gate `/dashboard/**` by role and to redirect logged-in users away from `/login` / `/register`

Known gaps:

- `AuthProvider` login/register/logout write/clear only the `token` cookie; nothing in this repo ever sets the `role` cookie that middleware checks for `/dashboard/{admin,landlord,tenant}` access.
- Cookies expire after 24h (`max-age=86400`) while localStorage never expires — sessions can be half-expired (cookie gone, token still valid), surfacing as redirects to `/login?from=...`.

## API layer

- All requests go through `src/lib/api.ts`: namespaced objects (`authApi`, `propertiesApi`, `landlordApi`, `rentalsApi`, `paymentsApi`, `reviewsApi`, `adminApi`) built on a private `fetcher` that injects the Bearer token, omits Content-Type for FormData bodies, and throws `ApiError` (exposes `.status` and `.data`). Reuse it instead of raw `fetch` or axios.
- Base URL comes from `NEXT_PUBLIC_API_URL`, defaulting to `https://rentnest-backend-five.vercel.app/api`.
- `.env.local` expects `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (Stripe Elements checkout in `src/components/payment/StripeCheckoutForm.tsx`).

## UI conventions

- shadcn/ui ("radix-nova" style) primitives live in `src/components/ui` — add new ones via the shadcn CLI rather than hand-writing them.
- Prefer app-level wrappers in `src/components/shared` (`AppButton`, `AppInput`, `AppDataTable`, `StatusBadge`, ...) over raw primitives.
- Remote images must be allow-listed in `next.config.ts` (`images.remotePatterns`): only Unsplash and Cloudinary currently pass.

## Commits

- Conventional commits (`feat:`, `fix:`), matching existing history.
