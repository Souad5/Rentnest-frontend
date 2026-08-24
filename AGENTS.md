# AGENTS.md

Next.js 16 App Router frontend for RentNest (rental marketplace). Backend is a separate repo; this app talks to it over REST.

## Commands

- Dev: `npm run dev` (port 3000)
- Lint: `npm run lint`
- Typecheck: `npx tsc --noEmit` (no script defined)
- Build: `npm run build`
- No tests exist; don't invent a test command.

## Environment

`.env.local` requires:

- `NEXT_PUBLIC_API_URL` — backend base URL (browser-exposed; plain names are invisible to the client bundle) (defaults to `http://localhost:5000/api` in `src/lib/api.ts`)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

## Architecture

- Path alias: `@/*` → `src/*`.
- Routes: `(auth)/login|register`, `(public)` homepage, `/dashboard/{admin,landlord,tenant}` split by role.
- Providers wired in `src/app/layout.tsx`: `AuthProvider` → `QueryProvider` (TanStack Query v5).

## Gotchas

- **Auth is dual-tracked.** JWT lives in `localStorage.token` (sent as Bearer header by the fetcher in `src/lib/api.ts`) and is mirrored into a plain `token` cookie by `AuthProvider` because `middleware.ts` gates `/dashboard/*` server-side off cookies. Any new auth flow must update both.
- **Middleware expects a `role` cookie that nothing writes.** Only the `token` cookie is set (`src/providers/AuthProvider.tsx`), so middleware's role-based redirects never fire; real role enforcement is client-side via `src/components/guard/RoleGuard.tsx`.
- **Two API layers existed; the stale one is gone.** Use `src/lib/api.ts` (`fetcher`, `ApiError`, `authApi`, `propertiesApi`, etc.). The old `src/services/api.ts` (imported a nonexistent `apiFetch`) was deleted. All `src/hooks/*.ts` files are empty placeholders.
- **Property images are a single `imageUrl`.** Backend `POST /properties/landlord` accepts optional singular `imageUrl` (verified against `rentnest-backend/prisma/schema.prisma`) — there is no `images` array on the model; older UI code that read `images[0]` now falls back through `imageUrl → images?.[0] → unsplash placeholder` for mock/legacy data.
- **Endpoint map:** `API_INTEGRATION.md` documents page→endpoint mappings, but verify against `src/lib/api.ts` before trusting it (it has drifted).
- **Tailwind v4:** no config file; theme tokens are CSS variables in `src/app/globals.css`.
- **shadcn/ui:** radix-nova style (`components.json`); generated components go to `src/components/ui`. Hand-written app components live in `src/components/shared` with an `App*` prefix (`AppButton`, `AppDataTable`, …).
- Remote images are restricted to unsplash + cloudinary domains in `next.config.ts`.
