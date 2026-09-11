## 📍 Where we left off (2026-09-11)

Rob provided his real price guide (`2026 Windy City Linen Price Guide
7.28.2026.xlsx`, Downloads folder — **not** committed anywhere, it has pricing in
it). Used the "Essentials" tab to import real per-fabric tablecloth sizes (see
`scripts/import-essentials-sizes.mjs` and "Data-quality notes" below). Only size
*availability* was extracted — no price value is stored or displayed anywhere.

`ANTHROPIC_API_KEY` is now set in `.env` (real key, local only — gitignored, never
committed). Re-tested the chatbot for real: sizing math checked out exactly against
the real chart (e.g. 60" round table -> 120" round linen, floor length), and 4
adversarial pricing attempts (direct ask, "ignore all previous instructions" prompt
injection, "just a rough ballpark" social engineering, and an indirect "cheapest
napkin" ask) all correctly refused and redirected to the team — no price ever
mentioned. Chatbot is launch-ready on the no-pricing front.

**Specialty fabric reconciliation — naming cleanup is done:**
- Mirage was pulled out of "Specialty" into its own Fabric (`scripts/split-mirage-fabric.mjs`)
  — Rob confirmed it belongs at the Essentials tier, like Serenity.
- Sent Rob a 4-tab reconciliation workbook (catalog colors / in-guide-not-catalog /
  in-catalog-not-guide / same-item-different-spelling) so he could eyeball it
  against the price guide himself.
- Fixed all 14 confirmed same-item naming mismatches (`scripts/fix-specialty-typos.mjs`):
  5 typo-duplicates (Amalfi Saphire/Sapphire, Bahaus/Bauhaus, Brushstroke/Brushstrokes,
  Echo Lumier/Lumiere, Pamela Palms/Palm) plus 9 word-order differences vs the guide
  (Houndstooth, Chiffon Ice Blue, Geometric Foil x2, Matrix x2, Ornamental Lace x2,
  Verve Navy) that Rob asked to consolidate too. Kept the catalog's spelling over the
  guide's where the guide itself has a typo or is inconsistent across its own tabs
  (Bauhuas, Pallete, Tye Dye, singular "Sequin"). One duplicate the first round of
  fixes accidentally introduced (Bauhaus ended up with two Cuffs products) was found
  and cleaned up; the script now guards against same-category collisions. Full audit
  (accounting for the `reverseSide` front/back flag) confirms zero true duplicates
  remain in Specialty/Mirage.
- "Harmony Runner ___" entries in the guide are the Harmony pattern in runner form,
  not a separate pattern — already covered by the existing "Harmony ___" catalog
  colors (per Rob), just with a slightly different color word in a few cases
  (guide says "Desert Rose", catalog says "Dusty Rose" — not touched, unconfirmed
  which is right).
- **Still open, lower confidence**: ~38 patterns in the guide with no clear catalog
  match, ~67 catalog colorNames with no clear guide match (full lists are in the
  workbook sent to Rob). Much of this is likely guide-parsing noise (footnote rows,
  inconsistent "(Limited)" formatting) rather than real problems — did not bulk-edit
  this list since false positives here would do more harm than the gap itself.
  Revisit only if Rob flags a specific pattern as wrong/missing.

**Next up, whenever Rob returns:**
1. Specialty fabric reconciliation (see above) — the last remaining data-quality item.
2. Otherwise: Step 3 (My Inspirations Phase 2) is the next unstarted piece of the
   original kickoff plan — needs a fresh spec from Rob on what "different" approach
   he wants (the first Phase 1 attempt was explicitly rejected earlier).

**To resume locally:** `npm run dev` (or the `web` launch config), admin login at
`/admin` is `info@windycitylinen.com` / `changeme-admin` (local dev only, see `.env`).

---

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

## Home hero carousel

Rotating photos at the top of the home page. Managed in the admin at **Home hero** —
reorder, edit each caption (= alt text), upload a replacement image, show/hide, add/delete
(max 8). Seeded with four real event photos (`public/home/hero-1..4.jpg`, optimized via
`scripts/optimize-hero.mjs` — re-run only when adding new source files). `hero-4.jpg` is
low-res (256px) — replace or hide it from the admin.

## Site-wide chatbot

Floating widget (bottom-right, every `(site)` page) for sizing/fabric questions —
`src/components/site/chat-widget.tsx`, posts to `POST /api/chat`
(`src/app/api/chat/route.ts`). Shares the Anthropic utility from Step 1
(`src/lib/ai/claude.ts`); system prompt is built in `src/lib/ai/chat-prompt.ts`
from the live catalog taxonomy (categories/fabrics/sizes), so it won't invent
products. Rate-limited per IP (`src/lib/rate-limit.ts`, in-memory — fine for one
instance; swap for Redis if the site ever scales to multiple instances). The
contact phone/email is always shown in the panel, not just on error.

No-pricing is enforced in the system prompt (hard rule from `CLAUDE.md`) and has been
adversarially tested for real against the live model (direct ask, prompt injection,
social engineering, indirect ask — all refused, all redirected to the team). See
"Where we left off" at the top.

Sizing math in the prompt now comes straight from Rob's real chart
(`public/documents/wcl-sizing-chart-2025.pdf`, transcribed into `chat-prompt.ts`)
instead of a generic drop formula — this is the client-confirmed sizing data.

## Design Center content

Populated with real lookbooks/documents via `scripts/fill-design-center-urls.mjs`
(one-off, safe to re-run — matches by title and updates the `url`). Files live in
`public/documents/` (PDFs, committed like the hero photos — same
production-storage caveat as images, see below). Admin can now also upload a PDF
directly on a Document-type item (`src/components/admin/image-upload.tsx` grew an
`accept` prop; `/api/admin/upload` accepts `application/pdf` up to 15MB).

All three sections (lookbooks, swatch cards, videos) are fully populated —
9/9 digital swatch cards, no gaps left.

## Still to build / do

1. **Content population** (via the admin): product keywords, collection assignments,
   final About copy. Design Center is fully done (see above).
2. **Image/document storage migration** — off `public/images` and `public/documents`
   to Supabase Storage / Cloudinary so admin uploads work in production and the
   repo doesn't carry large PDFs. `imageUrl()` already accepts full URLs.
3. **Deploy** — Supabase + Vercel + GitHub, env vars (incl. a real `ADMIN_SESSION_SECRET`),
   migrate/seed on Supabase, domain cutover.
4. **Mobile device QA** (punch 6.1).
5. **Update admin page and items** — review the admin panel and catalog items with Rob;
   scope/specifics TBD.

## Data-quality notes found during the build

- `wcl-catalog-COMPLETE.csv` `image_filename` column does **not** match the real photo
  files. The embedded `REAL_ITEMS` array in `windycitylinen-app-v2.jsx` does — that's
  the source `data/catalog-raw.json` uses.
- Spandex (4 items) uses form-factor labels ("Banquets", "High Boys", "Rounds") in the
  fabric column. Kept as data; hidden from the fabric filter (`HIDDEN_FABRIC_SLUGS` in
  `src/lib/catalog.ts`) pending a taxonomy cleanup.
- Per-product **size availability**: 11 fabrics (206 tablecloth products — everything
  except "Specialty") now have real per-fabric sizes from Rob's price guide, via
  `scripts/import-essentials-sizes.mjs`. The other ~430 Tablecloths products (all
  "Specialty" fabric, minus Mirage) still have the old category-default full-size set
  (`SIZES_BY_CATEGORY` in `scripts/build-catalog.mjs`) — pending the Specialty
  reconciliation below.
- Color hex values are estimates from the export, not sampled from photos (per the brief).
