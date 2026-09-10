@AGENTS.md

# Windy City Linen

Rebuild of windycitylinen.com — a **quote-request** event-linen rental catalog.
Read `README.md` and `HANDOFF.md` first.

## Hard rules

- **No pricing anywhere.** No prices, no cart totals, no checkout. Direct client requirement.
- There is **one saved-items list: "My Inspirations"** (localStorage, no login). "Add to
  My Inspirations" on a product carries a size only — **no quantities anywhere on the
  site**. The `/my-inspirations` page is where the visitor reviews the list and sends it
  to the team → email to `info@windycitylinen.com` + a `QuoteRequest` DB row. There is no
  separate quote tray. (The word "quote" is avoided in visible copy — say "send us your
  list" / "we follow up with pricing".)
- Every product image needs real `alt` text; every page needs exactly one `<h1>`, a
  unique `<title>`, and a meta description (SEO was the #1 reason for the rebuild).

## Stack notes

- Next.js 16 App Router. `params`/`searchParams` are Promises. Route types come from
  `next typegen` — run it after adding routes or `PageProps<>` won't know them.
- Prisma 6 + Postgres. Local dev DB: `postgresql://postgres:postgres@127.0.0.1:5432/windycitylinen`.
- Tailwind v4 (CSS `@theme`, no config file). Design tokens + fonts in `src/app/globals.css`.
- After changing `data/catalog-raw.json` or the taxonomy: `npm run db:build-catalog && npm run db:seed`.

## Where things live

- Marketing site: `src/app/(site)/*` (route group, own layout with Header/Footer).
  Admin: `src/app/admin/*` (own chrome-free layout; `(panel)` group holds the guarded pages).
- Catalog queries + filtering: `src/lib/catalog.ts`
- Saved list + quote submit: `src/components/inspirations/*`, `src/app/(site)/my-inspirations/*`,
  `src/lib/inquiries.ts`, `src/app/actions.ts`
- Admin auth: `src/lib/auth.ts` (`requireAdmin()` in every admin page + server action).
  Admin mutations: `src/lib/admin/*.ts` (`"use server"`). Admin UI kit: `src/components/admin/*`.
- Design system: `src/app/globals.css` (ivory/ink/brass/wine; Fraunces/Work Sans/Great Vibes)
- Next 16 note: middleware is now `proxy.ts`; we don't use it — auth is the layout guard.
