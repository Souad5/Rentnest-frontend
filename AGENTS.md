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
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — optional; enables "Continue with Google" (must match backend `GOOGLE_CLIENT_ID`)

## Architecture

- Path alias: `@/*` → `src/*`.
- Routes: `(auth)/login|register`, `(public)` homepage, `/dashboard/{admin,landlord,tenant}` split by role.
- Providers wired in `src/app/layout.tsx`: `ThemeProvider` (next-themes, class strategy) → `AuthProvider` → `QueryProvider`.
- Design system: brand palette is 3 tokens + warm neutral in `src/app/globals.css` — `primary` (teal), `highlight` (amber), `ink` (charcoal). Use token classes only (`bg-primary`, `text-highlight`, `bg-ink text-ink-foreground`, `text-muted-foreground`…); never hex or Tailwind palette colors, or dark mode breaks. Cards `rounded-2xl`, buttons/inputs `rounded-xl`.
- Site constants (contact info, socials, nav, demo accounts) live in `src/config/site.ts`.
- Shared building blocks: `src/components/shared/` (`Container`, `SectionHeading`, `PropertyCard`/`PropertyCardSkeleton`, `AISearchBox`, `AppDataTable`, `EmptyState`, `StatusBadge`, `UserMenu`, `ThemeToggle`) and `src/components/dashboard/` (`StatCard`, `ChartCard`, `DashboardPageHeader`, `chart-theme.ts`).
- Static content (blog posts, FAQs) lives in `src/content/`.
- AI features call the backend `/api/ai/*` endpoints (Claude): search suggestions (`AISearchBox`), chat assistant (`src/components/ai/ChatAssistant.tsx`), landlord description writer, admin insights.

## Gotchas

- **Auth is dual-tracked.** JWT lives in `localStorage.token` (sent as Bearer header by the fetcher in `src/lib/api.ts`) and is mirrored into `token` + `role` cookies by `AuthProvider` because `src/proxy.ts` (Next 16's renamed middleware — it must sit next to `src/app`) gates `/dashboard/*` off those cookies. Any new auth flow must go through `AuthProvider` (`login`, `register`, `loginWithGoogle`). The backend enforces real authorization.
- **Use the typed API methods.** `src/lib/api.ts` exposes typed methods returning the backend envelope `{success,message,data,meta?}` (e.g. `propertiesApi.list/detail`, `landlordApi.myProperties/create/update/stats`, `adminApi.stats`, `aiApi.*`); the older untyped methods remain only for backwards compatibility. Types live in `src/types/api.ts` and mirror the backend contract.
- **Property images:** `images: string[]` (cover first) plus legacy `imageUrl` (mirrors `images[0]`). Use `coverImage()` / `propertyImages()` from `src/lib/images.ts`; render user-supplied hosts with `unoptimized={!canOptimizeImage(url)}`.
- **Endpoint map:** `API_INTEGRATION.md` documents page→endpoint mappings, but verify against `src/lib/api.ts` before trusting it (it has drifted).
- **Tailwind v4:** no config file; theme tokens are CSS variables in `src/app/globals.css`.
- **shadcn/ui:** radix-nova style (`components.json`); generated components go to `src/components/ui`. Hand-written app components live in `src/components/shared` with an `App*` prefix (`AppButton`, `AppDataTable`, …).
- Optimized remote images are restricted to the hosts in `next.config.ts` (mirrored in `src/lib/images.ts`); other hosts render unoptimized.
