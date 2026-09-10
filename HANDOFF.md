# Punch-list status

Source: `windycitylinen-dev-punchlist.md` (in the original handoff zip). This tracks
what the rebuild covers so far.

| # | Item | Status |
|---|------|--------|
| 1.1 | Unique `<title>` per page | ✅ Done — root template + per-page `metadata` / `generateMetadata` |
| 1.2 | Meta descriptions | ✅ Done — unique per page/template |
| 1.3 | One `<h1>` per page | ✅ Done |
| 1.4 | Image alt text | ✅ Done — templated from fabric/color/category on every product image; decorative fallbacks use `role="img"` + `aria-label` |
| 2.1 | Custom 404 | ✅ Done — branded `not-found.tsx`, real 404 status |
| 2.2 | Dead Design Center buttons | ✅ Done — every card is a real link; items without a destination link to `/contact?about=…` instead of doing nothing |
| 2.3 | Surface faceted search | ✅ Done — "Search" in the main nav on every page; `/products` and `/search` both expose all facets |
| 3.1 | Header phone + CTA | ✅ Done — `tel:` link in the top bar (all pages, incl. mobile menu) + "Request a quote" button |
| 3.2 | Homepage value-prop block | ✅ Done — content section between hero and category grid, with CTAs |
| 4.1 | Size selector on product pages | ✅ Done — button group from the product's sizes |
| 4.2 | Quote-request flow (no pricing) | ✅ Done — merged with My Inspirations: add item + size to the saved list (no quantities), `/my-inspirations` reviews it and sends the list to the team → DB + email to `info@windycitylinen.com` |
| 4.3 | Explain or remove My Inspirations | ✅ Done — kept as the single saved list and the quote entry point; per-browser, no email gate |
| 5.1 | Contact form | ✅ Done — single detailed form (Name/Email/Phone/Subject/Event Date/Venue/Caterer/Event Planner/How-heard/Message) beside two showroom locations with Google Maps embeds; routes to `info@windycitylinen.com` |
| 6.1 | Mobile QA | ⛔ Not started — needs a real-device pass |
| 6.2 | Platform note | N/A — new stack removes the underlying constraints |

## Beyond the punch list — also built

- Real database (Postgres/Prisma) seeded with all **1,220 products**, 6 categories,
  14 fabrics, 17 sizes, 8 collections, 20 Design Center items.
- Real routing (a URL per page/product/category), server-rendered for SEO.
- `sitemap.xml` + `robots.txt`.
- `colorGroup` classification so the color filter has 15 tidy families instead of ~250 raw color names.
- Image filename reconciliation (the CSV's `image_filename` column was wrong; the
  embedded app-v2 export's filenames were correct and all 1,220 now resolve).

## Admin panel — ✅ built (`/admin`)

- **Auth**: `/admin/login` (email + password, bcrypt), signed httpOnly session cookie
  (`jose`), `requireAdmin()` guard on the `(panel)` layout and every server action,
  sign-out. First admin seeded from `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
- **Dashboard** — catalog counts + recent quote requests.
- **Products** — searchable list, add / edit / delete, live/hidden toggle, size &
  collection assignment, keywords, per-product image (filename, path, URL, or upload).
- **Categories / fabrics / sizes / collections** — inline add / rename / delete
  (a category or fabric can't be deleted while products use it).
- **Design Center** — add / edit / delete / reorder items per section; set a real URL
  to turn a card into a working link.
- **Quote requests** — inbox with status filter, detail view (contact fields + linens),
  status change, delete. The notification email links straight to `/admin/quotes/[id]`.
- **Images** — library overview, recent uploads, list of products with no image.
  Upload route (`/api/admin/upload`) writes to `public/images/uploads/` — **works in
  dev only**; production needs object storage (see below).

The marketing site now lives in the `(site)` route group (own layout with header/footer);
`/admin` has its own chrome-free shell.

## Content to supply

- **Home hero photos** — the hero is a 4-image carousel reading `public/home/hero-1.jpg`
  … `hero-4.jpg` (currently placeholder product shots). Drop in four real event photos
  at ~4:3, same filenames, and update the `alt` text in `src/components/site/hero-carousel.tsx`.

## Still to build / do

1. **Content population** (via the admin): product keywords, collection assignments,
   Design Center destination URLs, final About copy.
2. **Image storage migration** — off `public/images` to Supabase Storage / Cloudinary
   so admin uploads work in production. `imageUrl()` already accepts full URLs.
3. **Deploy** — Supabase + Vercel + GitHub, env vars (incl. a real `ADMIN_SESSION_SECRET`),
   migrate/seed on Supabase, domain cutover.
4. **Mobile device QA** (punch 6.1).

## Data-quality notes found during the build

- `wcl-catalog-COMPLETE.csv` `image_filename` column does **not** match the real photo
  files. The embedded `REAL_ITEMS` array in `windycitylinen-app-v2.jsx` does — that's
  the source `data/catalog-raw.json` uses.
- Spandex (4 items) uses form-factor labels ("Banquets", "High Boys", "Rounds") in the
  fabric column. Kept as data; hidden from the fabric filter (`HIDDEN_FABRIC_SLUGS` in
  `src/lib/catalog.ts`) pending a taxonomy cleanup.
- Per-product **size availability** isn't in any export — seeded by category default
  (`SIZES_BY_CATEGORY` in `scripts/build-catalog.mjs`). Refine per product in the admin.
- Color hex values are estimates from the export, not sampled from photos (per the brief).
