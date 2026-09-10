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

- Catalog queries + filtering: `src/lib/catalog.ts`
- Saved list + quote submit: `src/components/inspirations/*`, `src/app/my-inspirations/*`,
  `src/lib/inquiries.ts`, `src/app/actions.ts`
- Design system: `src/app/globals.css` (ivory/ink/brass/wine; Fraunces/Work Sans/Great Vibes)
