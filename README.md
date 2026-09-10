# Windy City Linen — windycitylinen.com rebuild

Modern rebuild of windycitylinen.com: a **quote-request** rental catalog (no pricing,
no checkout anywhere on the site) for event linens across Chicago and Milwaukee.

**Stack:** Next.js 16 (App Router) · Postgres via Prisma · Tailwind v4 · Resend (email)
Target hosting: Vercel + Supabase (Postgres + Storage).

---

## Running locally

Prereqs: Node 20+, a local Postgres 16 (installed during setup at
`postgresql://postgres:postgres@127.0.0.1:5432/windycitylinen`).

```bash
npm install
cp .env.example .env        # then edit values
npm run db:migrate          # create tables
npm run db:build-catalog    # data/catalog.json from the raw exports
npm run db:seed             # load 1,220 products + taxonomy + Design Center + admin user
npm run dev                 # http://localhost:3000
```

If Postgres isn't running: `& "C:\Program Files\PostgreSQL\16\bin\pg_ctl.exe" -D "C:\Program Files\PostgreSQL\16\data" start`
(the Windows service `postgresql-x64-16` is installed but currently won't auto-start — see Known issues).

### Useful scripts

| Script | Does |
|---|---|
| `npm run dev` / `build` / `start` | Next.js |
| `npm run db:build-catalog` | Regenerate `data/catalog.json` from `data/catalog-raw.json` + the CSV + the images on disk |
| `npm run db:seed` | Idempotent seed from `data/catalog.json` |
| `npm run db:reset` | Drop + recreate + reseed |
| `npm run db:studio` | Prisma Studio (browse/edit data) |

---

## Project layout

```
data/                     raw catalog exports + generated catalog.json (the seed source)
scripts/build-catalog.mjs  CSV/JSON/image reconciliation -> data/catalog.json
prisma/schema.prisma      data model
prisma/seed.ts            seeder
public/images/<Category>/  1,219 product photos (jpg + webp), served statically
src/lib/                  db client, catalog queries, email, inquiry handling, site constants
src/components/           site chrome, catalog (cards/filters), quote tray, inspirations
src/app/                  routes (see below)
```

### Routes (public site — built)

| Route | Notes |
|---|---|
| `/` | Home: hero, value-prop block, stats, shop-by-category, CTA |
| `/products` | Full catalog with faceted filters (category, color family, fabric, size, collection) + pagination |
| `/products/[category]` | Category-scoped catalog |
| `/product/[slug]` | Detail: size selector, quantity, **Add to My Inspirations**, related items. No price. |
| `/search` | Free-text search + the same facets |
| `/my-inspirations` | The single saved-items list (localStorage). Review size/quantity, then submit the whole list as one quote request. |
| `/contact` | Two-tier form: Quick message / Detailed quote request |
| `/design-center` | Lookbooks, swatch cards, videos (from DB). Items without a URL link to contact — no dead buttons. |
| `/about` | Static |
| `not-found` | Branded 404 |
| `/robots.txt`, `/sitemap.xml` | Generated |

All pages set a unique `<title>`, meta description, and one `<h1>` (punch-list P1).

---

## How quote requests work

1. Visitor adds linens (product + size + quantity) to **My Inspirations** — stored in
   `localStorage` (`wcl.inspirations.v2`), no login. The catalog card heart is a quick
   add (size chosen later); the product page adds with a size + quantity.
2. `/my-inspirations` shows the list (editable quantities) and collects
   name/email/phone/date, then calls the `submitInquiry` server action.
3. `createInquiry` writes a `QuoteRequest` (+ items) row **and** emails
   `QUOTE_INBOX` (`info@windycitylinen.com`) via Resend.
4. **No `RESEND_API_KEY` set → the email is logged to the server console** instead of
   sent, so the flow is testable in dev. Set the key in `.env` / Vercel to send for real.

The contact form uses the same action with `type` `QUICK` or `DETAILED`.

---

## Not done yet / next steps

See `HANDOFF.md` for the full punch-list status. Big remaining pieces:

- **Admin panel** (`/admin/*`) — schema + auth model (`AdminUser`, bcrypt) are in place;
  the CRUD UI from `windycitylinen-admin.jsx` still needs to be built against it.
- **Product keywords** — `keywords` field exists and powers search but is empty; fill via admin.
- **Collections** — assigned to zero products yet (Glitzy/Lace/etc.); assign via admin.
- **Design Center URLs** — real lookbook PDFs/links need to be added per item.
- **Image storage** — currently served from `public/images` (~180 MB in the repo);
  migrate to Supabase Storage / Cloudinary before or soon after launch.
- **Deploy** — create Supabase + Vercel + GitHub, point `DATABASE_URL` at Supabase,
  run migrations + seed there, set env vars, then domain cutover.

## Known issues

- The `postgresql-x64-16` Windows service doesn't auto-start (installer exited non-zero
  on a post-install step). Start Postgres manually with `pg_ctl` (above) or repair the
  service. Not a problem once we're on Supabase.
- `npm audit` reports 3 highs in Prisma's build-time deps (`@prisma/config` →
  `deepmerge-ts`); not runtime-exploitable in this app. Revisit on the next Prisma bump.
