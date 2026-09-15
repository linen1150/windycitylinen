// Builds data/catalog.json (the DB seed source) from the two raw exports:
//   - data/catalog-raw.json  : the clean product array embedded in windycitylinen-app-v2.jsx
//   - data/wcl-catalog-COMPLETE.csv : the same 1,220 items in CSV form (authoritative for image_filename)
//
// Output rows carry everything prisma/seed.ts needs: stable slug, category/fabric/color,
// hex, flags, image filename, and a default size set derived from the category.
//
// Run:  node scripts/build-catalog.mjs

import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const readText = (p) => readFileSync(join(root, p), "utf8").replace(/^﻿/, "");
const rawAll = JSON.parse(readText("data/catalog-raw.json"));

// Legacy-export rows confirmed (by eye, against the real photos) to be
// duplicates of another row — dropped here rather than edited out of the
// raw export so the export stays a pristine historical import. Each is
// paired with the id of the row that was kept, for context.
const EXCLUDE_IDS = new Set([
  1067, // "Jute Peach" cuff — duplicate of "Peach Jute" (1072)
  979, // "Navy Sequins" runner — duplicate of "Sequins Lace Navy" (885/1019/etc.)
  606, // "Brushstroke" napkin (singular) — duplicate of "Brushstrokes" napkin
  329, 330, 692, 693, 997, 998, 1167, 1168, // Savannah Vintage Blossom/Lilac, all 4 categories — "should come off, be out of the books" per Tera
  302, 670, 968, 1140, // "Mirage Sandstone" — "does not exist" per Tera (not a real item; distinct from the real "Sandstone" specialty print)
]);

// Legacy-export rows whose name needs correcting (typo, word order, or a
// supplier naming quirk) — confirmed against Tera's punch list.
const RENAME_BY_ID = {
  362: "Velvet Gold", 713: "Velvet Gold", 1019: "Velvet Gold", 1186: "Velvet Gold", // was "Velvet Champagne Gold"
  885: "Amalfi Sapphire", 1075: "Amalfi Sapphire", // was "Amalfi Saphire" (typo)
  663: "Burnt Orange Matrix", // was "Matrix Burnt Orange" (word order)
  253: "Eleanor", // was "Eleanor - Bone"
  381: "Waterlily", 731: "Waterlily", 1037: "Waterlily", 1203: "Waterlily", // was "Water Lily" (should be one word)
  528: "Matte Lamour Raspberry", 851: "Matte Lamour Raspberry", // was "Raspberry Matte Lamour" (word order) — merges with the fabric-first naming the real Tablecloth photo already uses
};

const raw = rawAll
  .filter((r) => !EXCLUDE_IDS.has(r.id))
  .map((r) => (RENAME_BY_ID[r.id] ? { ...r, name: RENAME_BY_ID[r.id], color: RENAME_BY_ID[r.id] } : r));

// --- taxonomy confirmed with the client (see CLAUDE_CODE_BUILD_BRIEF.md) ------
export const CATEGORIES = [
  "Tablecloths and Overlays",
  "Napkins",
  "Table Runners",
  "Cuffs",
  "Spandex",
  "Chair Covers",
];

export const SIZES = [
  '54" Square', '90" Square', '90" Round', '96" Round', '108" Round',
  '120" Square', '120" Round', '132" Square', '132" Round',
  '72"x120" Banquet', '90"x132" Banquet', '90"x156" Banquet',
  '108"x156" Banquet', '114"x180" Banquet',
  "Cuffs", "Napkins", "Runners",
];

export const COLLECTIONS = [
  "Glitzy", "Lace", "Pattern", "Floral", "Themed Prints", "Stripe", "Texture", "Velvet",
];

// Fabrics: start from the client list, then union in anything that actually
// appears in the catalog (the Spandex rows use non-standard fabric labels).
const FABRICS_CLIENT = [
  "Classic Solid", "Imperial Stripe", "Picnic Check", "Shantung", "Matte Lamour",
  "Serenity", "Bengaline", "Soiree", "Bichon Crush", "Jute", "Specialty",
];

// Default size availability per category. Real per-product availability is not in
// the export; admins refine this per item. Tablecloths get the full dimensional
// range; the other categories get their single logical size.
const SIZES_BY_CATEGORY = {
  "Tablecloths and Overlays": [
    '54" Square', '90" Square', '90" Round', '96" Round', '108" Round',
    '120" Square', '120" Round', '132" Square', '132" Round',
    '72"x120" Banquet', '90"x132" Banquet', '90"x156" Banquet',
    '108"x156" Banquet', '114"x180" Banquet',
  ],
  "Napkins": ["Napkins"],
  "Table Runners": ["Runners"],
  "Cuffs": ["Cuffs"],
  "Spandex": ['90" Round', '108" Round', '72"x120" Banquet', '90"x132" Banquet'],
  "Chair Covers": [],
};

// Real per-product/per-fabric size availability for Tablecloths and Overlays,
// sourced from the 2026 price guide (see data/tablecloth-sizes.json for
// provenance and how it was derived — a blank cell in the guide means that
// size isn't offered). Only ever narrows the SIZES_BY_CATEGORY default, never
// expands past it: anything not covered by the guide keeps the full range.
const tableclothSizes = JSON.parse(readText("data/tablecloth-sizes.json"));

function sizesFor(category, fabric, productName) {
  if (category !== "Tablecloths and Overlays") return SIZES_BY_CATEGORY[category] ?? [];
  const baseName = productName.replace(/\s*\(Limited\)\s*$/, "").replace(/\s+Revers(e|ed)$/i, "");
  return (
    tableclothSizes.byProduct[baseName] ??
    tableclothSizes.byFabric[fabric] ??
    SIZES_BY_CATEGORY[category] ??
    []
  );
}

// Coarse color families for the filter UI, mirrored from the legacy /Search facet.
export const COLOR_GROUPS = [
  { name: "Black", hex: "#20232A" },
  { name: "White", hex: "#FAFAFA" },
  { name: "Ivory", hex: "#F1EEE3" },
  { name: "Blue", hex: "#3E6FA6" },
  { name: "Brown/Beige/Cafe/Tan", hex: "#B6A08A" },
  { name: "Copper", hex: "#B98A3E" },
  { name: "Gold", hex: "#C9A227" },
  { name: "Green", hex: "#3E8E4F" },
  { name: "Gray", hex: "#8B9299" },
  { name: "Multicolor", hex: "#B87BB0" },
  { name: "Orange", hex: "#E8752E" },
  { name: "Pink/Blush", hex: "#D9AFAE" },
  { name: "Purple/Burgundy", hex: "#6C4A9C" },
  { name: "Red", hex: "#B12A2A" },
  { name: "Yellow", hex: "#EFCB3B" },
];

// Keyword rules mapping a specific color name to a group. A product can match
// more than one rule (see colorGroupsFor) so a two-tone name like "Polka Dots
// Black with White" is filed under every color it names, not just the first.
// Every alternative is \b-bounded so a short token like "tan" can't match
// inside an unrelated word (e.g. "Tangerine", "Embroidered").
const COLOR_RULES = [
  [/\b(black|onyx|ebony|jet|noir)\b/i, "Black"],
  [/\b(white|snow)\b/i, "White"],
  [/\b(ivory|cream|bone|champagne|vanilla|eggshell)\b/i, "Ivory"],
  [/\b(copper|rust|terracotta|penny|bronze)\b/i, "Copper"],
  [/\b(gold|golden|antique gold)\b/i, "Gold"],
  [/\b(yellow|lemon|citron|mustard|canary|butter|maize|cornsilk|amber)\b/i, "Yellow"],
  [/\b(orange|tangerine|apricot|coral|persimmon|pumpkin|marigold|burnt orange|papaya|peach)\b/i, "Orange"],
  [/\b(red|scarlet|cherry|crimson|ruby|tomato|poppy|cardinal|americana)\b/i, "Red"],
  [/\b(blush|pink|rose|dusty rose|mauve|petal|flamingo|watermelon|fuchsia|magenta|hot pink|salmon)\b/i, "Pink/Blush"],
  [/\b(purple|plum|eggplant|aubergine|lavender|lilac|violet|orchid|amethyst|wisteria|grape)\b/i, "Purple/Burgundy"],
  [/\b(burgundy|wine|merlot|maroon|bordeaux|claret|garnet|cranberry|sangria)\b/i, "Purple/Burgundy"],
  // Burgundy sits between red and purple — findable under both, per Tera.
  [/\bburgundy\b/i, "Red"],
  [/\b(blue|navy|aqua|turquoise|cerulean|cobalt|periwinkle|denim|indigo|sky|sapphire|marine|ocean|slate|caribbean)\b/i, "Blue"],
  // "teal" sits with green (not blue) per Tera.
  [/\b(green|sage|olive|emerald|kelly|hunter|forest|mint|moss|fern|celadon|clover|lime|pistachio|basil|seafoam|jade|avocado|teal)\b/i, "Green"],
  [/\b(gray|grey|silver|pewter|charcoal|graphite|smoke|ash|platinum|steel)\b/i, "Gray"],
  // "jute" deliberately excluded: in this catalog it only ever names the Jute
  // fabric line (baked into the product/color name, e.g. "Jute Black"), never
  // an actual color — keeping it as a keyword mistagged every Jute product brown.
  [/\b(brown|beige|cafe|tan|taupe|camel|mocha|chocolate|espresso|khaki|sand|wheat|latte|coffee|hazelnut|walnut|burlap|natural|nutmeg|cinnamon|toffee|caramel|chestnut|sable|driftwood|oatmeal)\b/i, "Brown/Beige/Cafe/Tan"],
  [/\b(multi|rainbow|print|floral|stripe|check|plaid|pattern|ombre|tie.?dye|paisley|geo|confetti|mosaic)\b/i, "Multicolor"],
];

function hexToRgb(hex) {
  const n = parseInt((hex || "").replace("#", ""), 16);
  return Number.isNaN(n) ? null : [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const delta = max - min;
  if (delta === 0) return { h: 0, s: 0, l };
  const s = delta / (1 - Math.abs(2 * l - 1));
  let h;
  if (max === r) h = 60 * (((g - b) / delta) % 6);
  else if (max === g) h = 60 * ((b - r) / delta + 2);
  else h = 60 * ((r - g) / delta + 4);
  if (h < 0) h += 360;
  return { h, s, l };
}

// Fallback for a colorName/productName with no keyword hit: bucket the photo's
// own hex by hue family rather than a flat weighted-RGB distance to the 15
// anchor colors — the old distance metric put muted/pastel hues of almost any
// hue (e.g. teal #8ED1C4 "Tiffany") nearer the Pink/Blush anchor than their
// actual hue family, which was silently wrong for a large share of the
// keyword-less items.
function nearestColorGroup(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const { h, s, l } = rgbToHsl(rgb);

  if (s < 0.04) {
    if (l > 0.93) return "White";
    if (l < 0.15) return "Black";
    return "Gray";
  }
  if (s < 0.08) {
    if (l > 0.9) return "White";
    if (l > 0.72) return "Ivory";
    if (l < 0.15) return "Black";
    if (l < 0.45) return "Brown/Beige/Cafe/Tan";
    return "Gray";
  }

  if (h >= 330 || h < 15) return l > 0.68 ? "Pink/Blush" : "Red";
  if (h < 45) {
    if (s < 0.35 || l < 0.35) return "Brown/Beige/Cafe/Tan";
    if (l > 0.75) return "Ivory";
    return "Orange";
  }
  if (h < 70) {
    if (l > 0.85 && s < 0.4) return "Ivory";
    if (s < 0.35 && l < 0.55) return "Brown/Beige/Cafe/Tan";
    return "Yellow";
  }
  if (h < 167) return "Green";
  if (h < 255) return "Blue";
  // purple/magenta family
  return l > 0.7 || s < 0.25 ? "Pink/Blush" : "Purple/Burgundy";
}

// Manual corrections for specific items where the name/hex heuristics get it
// wrong (confirmed by eye against the real photo) — keyed by the legacy
// catalog export id, so a reseed/rebuild doesn't silently drop the fix.
const COLOR_GROUP_OVERRIDES = {
  // "Splash" is a specialty print with no real sampled hex on file (falls
  // back to the neutral placeholder) — it's a multicolor pattern in the photo.
  705: ["Multicolor"], 1011: ["Multicolor"], 1182: ["Multicolor"],
  // "Raspberry Matte Lamour" — a red/magenta berry color, not brown (same
  // class of fix as Classic Solid Raspberry and Jute Lipstick).
  528: ["Red"], 851: ["Red"],
  // "Mystic" — a navy-on-white damask print, not brown.
  674: ["Blue", "White"], 972: ["Blue", "White"],
};

// Same idea, but for a whole colorway (every category/size variant shares the
// exact color name) — these have no real sampled hex on file, so every
// variant would otherwise fall back to the same wrong guess.
const COLOR_GROUP_NAME_OVERRIDES = {
  // "Violet Green" is the supplier's fabric-line name, not a real color mix —
  // the crushed-velvet photo (and its hex #5A7A4A) is plain green.
  "Bichon Crush Violet Green (Limited)": ["Green"],
  // The photo is a blush pink woven texture (filename even says "Blush"),
  // not brown — the colorName just never said so.
  Cambric: ["Pink/Blush"],
  // White/silver-thread embroidered lace, not brown.
  "Middleton Lace": ["Ivory"],
  // White beaded/sequin lace, not brown.
  Cinderella: ["White"],
  "Mirage Hazel": ["Blue"],
  "Mirage Tide": ["Blue"],
  Bandana: ["Red"],
  "Bark Midnight": ["Black"],
  "Bark Midnight Reverse": ["Black"],
  Brushstrokes: ["Purple/Burgundy"],
  Calypso: ["Multicolor"],
  Cirque: ["Multicolor"],
  Dogwood: ["Orange"],
  "Echo Rouge": ["Red"],
  "Echo Rouge Reverse": ["Red"],
  "Bichon Crush Paprika (Limited)": ["Orange"],
  "Bengaline Spiced Cider (Limited)": ["Orange"],
  // "Champagne Gold" is one blended color name, not champagne + gold — the
  // keyword matcher was splitting it into two groups.
  "Bichon Crush Champagne Gold (Limited)": ["Gold"],
  "Velvet Gold": ["Gold"], // renamed from "Velvet Champagne Gold" above
  Eleanor: ["Ivory"], // renamed from "Eleanor - Bone" above; off-white damask
  "Verve Champagne Gold": ["Gold"],

  // --- Second corrections pass (Website Corrections.pdf, 2026-09) ----------
  // A long run of "brown" mistags — these are the same class of bug as the
  // items above (keyword matcher falling back to Brown/Beige with no real
  // color signal in the name) but confirmed in bulk by Tera against the
  // actual photos rather than one at a time.
  "Jute Dove": ["Gray"],
  "Mirage Vanilla": ["White"],
  "Dolce Vanilla": ["White"],
  "Soiree Champagne": ["Gold"],
  "Mirage Cloud": ["Gray"],
  "Serenity Driftwood": ["Ivory"],
  "Abstract Geometric": ["Multicolor", "Black"],
  Bauhaus: ["Multicolor"],
  Cairns: ["Orange"],
  "Cairns Reverse": ["Orange"],
  "Echo Lumiere": ["Gray"],
  "Echo Lumiere Reverse": ["Gray"],
  "Hampton Botanical Apple": ["Green"],
  "Helena Apple": ["Green"],
  "Helena Apple Reverse": ["Green"],
  Hex: ["Gray"],
  Holly: ["Multicolor"],
  "Josephine Lace": ["Pink/Blush"],
  "Key West": ["Multicolor"],
  "Kiwi Palazzo": ["Green"],
  Kringle: ["Red"],
  Laguna: ["Multicolor", "Green"],
  Lorelei: ["Multicolor"],
  Lucia: ["Multicolor", "Yellow"],
  Meteorite: ["Gray"],
  "Metropolitan Concrete": ["Gray"],
  "Midas Travertine": ["Gold"],
  "Midas Travertine Reverse": ["Gold"],
  Nadia: ["Purple/Burgundy"],
  Nantucket: ["Blue"],
  "Pamela Palm": ["Green"],
  "Pamela Palms": ["Green"], // Cuffs/Table Runners rows use the plural form of the name
  Patchwork: ["Multicolor"],
  Phoebe: ["Multicolor", "Blue"],
  Phoenix: ["Red"],
  Regency: ["Gray"],
  "Retro Vintage": ["Multicolor"],
  Romeo: ["Multicolor"],
  Santorini: ["Blue"],
  "Santorini Reverse": ["Blue"],
  Silhouette: ["Black"],
  "Sparkle Sheer Royal": ["Blue"],
  Spiro: ["Black", "White"],
  "Velvet Loden": ["Green"],
  "Velvet Spice": ["Orange"],
  "Verve Pearl": ["White"],
  Waterlily: ["Multicolor", "Pink/Blush"], // renamed from "Water Lily" above
  Woodland: ["Gray"],
  "Woodland Reverse": ["White"],
  "Woodland Reversed": ["White"],
  "Wren Coastal": ["Blue"],
  Zebra: ["Black", "White"],
  // Supersedes the earlier "brown -> red" fix from the first punch list —
  // Tera's follow-up correction says pink, not red.
  "Jute Lipstick": ["Pink/Blush"],

  // Imperial Stripe: each colorway is genuinely one color, not a print — drop
  // the "Multicolor" the keyword matcher added for the word "stripe".
  "Imperial Stripe Black (Limited)": ["Black"],
  "Imperial Stripe Burgundy (Limited)": ["Purple/Burgundy", "Red"],
  "Imperial Stripe Forest Green (Limited)": ["Green"],
  "Imperial Stripe Ivory (Limited)": ["Ivory"],
  "Imperial Stripe Navy (Limited)": ["Blue"],
  "Imperial Stripe Red (Limited)": ["Red"],
  "Imperial Stripe White (Limited)": ["White"],

  // These are genuinely two-tone prints (a color + the base pattern) — add
  // the second color alongside the existing Multicolor tag.
  "Hampton Stripe Dune": ["Multicolor", "Brown/Beige/Cafe/Tan"],
  "Hampton Stripe Coastal": ["Multicolor", "Blue"],
  "Hampton Stripe Apple": ["Multicolor", "Green"],
  "Apple Cabana Stripe": ["Multicolor", "Green"],
  "Apple Gingham Mini Check": ["Multicolor", "Green"],
  "Willow Gingham Mini Check": ["Multicolor", "Green"],
};

function colorGroupsFor(externalId, colorName, fabric, productName, hex) {
  if (COLOR_GROUP_OVERRIDES[externalId]) return COLOR_GROUP_OVERRIDES[externalId];
  if (COLOR_GROUP_NAME_OVERRIDES[productName]) return COLOR_GROUP_NAME_OVERRIDES[productName];
  // Fabric is deliberately excluded: it's a material/pattern-line name, not a
  // color, and some fabric names (e.g. "Jute") collide with color keywords —
  // any real color signal from the fabric line is already repeated in the
  // product name (e.g. "Jute Black", "Imperial Stripe Black").
  const hay = `${colorName} ${productName}`;
  const groups = [];
  for (const [re, group] of COLOR_RULES) {
    if (re.test(hay) && !groups.includes(group)) groups.push(group);
  }
  if (groups.length) return groups;
  // Fall back to the closest anchor color by hex.
  const nearest = nearestColorGroup(hex);
  return nearest ? [nearest] : [];
}

// Keyword rules for the 8 curated Collections (Glitzy/Lace/Pattern/Floral/
// Themed Prints/Stripe/Texture/Velvet) — these were an established taxonomy
// with zero products ever assigned to any of them (the admin-curation step
// this was left for never happened), which made the site's Collection
// filter return "no items" for every option. A product can land in more
// than one collection (e.g. a sequined lace print is both Glitzy and Lace).
// Deliberately conservative: plain solid-color fabrics (Classic Solid,
// Serenity, Soiree, most Matte Lamour/Bengaline) get no collection at all
// rather than a forced guess — these tags are for the curated specialty/
// pattern lines, not a "no product should be untagged" pass.
const COLLECTION_RULES = [
  [/\blace\b/i, "Lace"],
  [/sequin|sparkle|glitter|foil|metallic|amondine|midas|diamond|dazzle/i, "Glitzy"],
  [/\bstripe\b/i, "Stripe"],
  [/floral|\bbloom\b|\bgarden\b|botanical|water lily|juliette|peony|magnolia/i, "Floral"],
  [/\bcheck\b|gingham|polka dot|\bdot\b|damask|chevron|houndstooth|\bhex\b|\bplaid\b|geometric|\bmatrix\b|mosaic|paisley/i, "Pattern"],
  [/velvet/i, "Velvet"],
  [/halas|bandana|tie.?dye|patchwork|americana|snow leopard|cheetah|\btiger\b|\bzebra\b|fairy dust|holiday|christmas|halloween|patriotic|safari|western/i, "Themed Prints"],
];
// Fabrics whose defining trait is a visible woven texture rather than a
// printed pattern — these get the Texture collection by fabric alone.
const TEXTURE_FABRICS = new Set(["Shantung", "Bengaline", "Jute", "Bichon Crush"]);

function collectionsFor(colorName, fabric, productName) {
  const hay = `${colorName} ${productName}`;
  const collections = [];
  for (const [re, name] of COLLECTION_RULES) {
    if (re.test(hay) && !collections.includes(name)) collections.push(name);
  }
  if (TEXTURE_FABRICS.has(fabric) && !collections.includes("Texture")) collections.push("Texture");
  return collections;
}

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/["']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// --- parse the CSV for the authoritative image filename per product ----------
function parseCsv(text) {
  const rows = [];
  const lines = text.split(/\r?\n/).filter((l) => l.length);
  const headers = splitCsvLine(lines[0]);
  for (let i = 1; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i]);
    const row = {};
    headers.forEach((h, idx) => (row[h] = cells[idx] ?? ""));
    rows.push(row);
  }
  return rows;
}
function splitCsvLine(line) {
  const out = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') inQ = false;
      else cur += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === ",") { out.push(cur); cur = ""; }
      else cur += c;
    }
  }
  out.push(cur);
  return out;
}

const csv = parseCsv(readText("data/wcl-catalog-COMPLETE.csv"));
// key CSV rows by name for a cross-check
const csvByName = new Map(csv.map((r) => [r.product_name.trim(), r]));

const fabricsSeen = new Set(FABRICS_CLIENT);
const seenSlugs = new Set();
const products = raw.map((r) => {
  fabricsSeen.add(r.fabric);
  // The embedded app-v2 export's filenames match the optimized photo set;
  // the CSV's image_filename column does not. Prefer the embedded value and
  // fall back to token reconciliation below for any that aren't on disk.
  const imageFilename = (r.imageFilename || "").trim() || null;

  let slug = slugify(r.name);
  if (seenSlugs.has(slug)) slug = `${slug}-${r.id}`;
  seenSlugs.add(slug);

  return {
    externalId: r.id,
    name: r.name.trim(),
    slug,
    category: r.category,
    fabric: r.fabric,
    colorName: r.color,
    colorHex: (r.hex || "").toUpperCase() || null,
    colorGroups: colorGroupsFor(r.id, r.color, r.fabric, r.name, r.hex),
    limited: Boolean(r.limited),
    reverseSide: Boolean(r.reverseSide),
    imageFilename,
    keywords: "", // authored later via the admin panel
    sizes: sizesFor(r.category, r.fabric, r.name),
    collections: collectionsFor(r.color, r.fabric, r.name),
  };
});

// --- reconcile imageFilename against the actual files in public/images -------
// The catalog exports and the optimized photo set use different naming
// conventions (e.g. "BengalineBrown.jpg" vs "BrownBengaline.jpg"), so match
// each product to a real file by token overlap, scoped to its category folder.
const NOISE = new Set([
  "runner", "runners", "cuff", "cuffs", "napkin", "napkins", "tablecloth",
  "tablecloths", "overlay", "overlays", "spandex", "chair", "cover", "covers",
  "linen", "the", "and", "solid", "a1", "a2", "a3", "r", "l", "v1", "v2", "v3",
  "new", "embroidered", "inch", "banquet",
]);

function tokenize(s) {
  return s
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Za-z])(\d)/g, "$1 $2")
    .toLowerCase()
    .replace(/\.(jpg|jpeg|webp|png)$/i, "")
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter((t) => t && t.length > 1 && !NOISE.has(t));
}

function reconcileImages(products, imagesRoot) {
  const byCategory = new Map();
  for (const p of products) {
    if (!byCategory.has(p.category)) byCategory.set(p.category, []);
    byCategory.get(p.category).push(p);
  }

  let kept = 0;
  let matched = 0;
  const unmatchedProducts = [];

  for (const [category, group] of byCategory) {
    const dir = join(imagesRoot, category);
    if (!existsSync(dir)) {
      group.forEach((p) => (p.imageFilename = null));
      unmatchedProducts.push(...group);
      continue;
    }
    const files = readdirSync(dir).filter((f) => /\.jpg$/i.test(f));
    const fileLower = new Map(files.map((f) => [f.toLowerCase(), f]));
    const fileTokens = new Map(files.map((f) => [f, new Set(tokenize(f))]));

    const usedFile = new Set();
    const needMatch = [];

    // 1. Keep the embedded filename when the file actually exists on disk.
    for (const p of group) {
      const hit = p.imageFilename && fileLower.get(p.imageFilename.toLowerCase());
      if (hit) {
        p.imageFilename = hit;
        usedFile.add(hit);
        kept++;
      } else {
        needMatch.push(p);
      }
    }

    // 2. Token-match the rest against the remaining files.
    const pairs = [];
    for (const p of needMatch) {
      const ptSet = new Set(tokenize(`${p.fabric} ${p.colorName} ${p.name}`));
      for (const f of files) {
        if (usedFile.has(f)) continue;
        const ft = fileTokens.get(f);
        let hits = 0;
        for (const t of ptSet) if (ft.has(t)) hits++;
        if (hits === 0) continue;
        pairs.push({
          p,
          f,
          score: hits + hits / ptSet.size + hits / Math.max(1, ft.size),
        });
      }
    }
    pairs.sort((a, b) => b.score - a.score);

    const assigned = new Set();
    for (const { p, f, score } of pairs) {
      if (assigned.has(p) || usedFile.has(f)) continue;
      if (score < 1.4) continue;
      p.imageFilename = f;
      assigned.add(p);
      usedFile.add(f);
      matched++;
    }
    for (const p of needMatch) {
      if (!assigned.has(p)) {
        p.imageFilename = null;
        unmatchedProducts.push(p);
      }
    }
  }

  return { kept, matched, unmatched: unmatchedProducts };
}

const imageReport = reconcileImages(products, join(root, "public/images"));

const out = {
  generatedAt: new Date().toISOString(),
  categories: CATEGORIES,
  fabrics: [...fabricsSeen].sort(),
  sizes: SIZES,
  collections: COLLECTIONS,
  colorGroups: COLOR_GROUPS,
  products,
};

writeFileSync(join(root, "data/catalog.json"), JSON.stringify(out, null, 2));

const missingImg = products.filter((p) => !p.imageFilename).length;
const nameMismatch = raw.filter((r) => !csvByName.has(r.name.trim())).length;
const ungrouped = products.filter((p) => !p.colorGroups.length).length;
console.log(`catalog.json written: ${products.length} products`);
console.log(`  fabrics: ${out.fabrics.length}  |  not found in CSV: ${nameMismatch}  |  colors without a group: ${ungrouped}`);
console.log(`  images: ${imageReport.kept} exact + ${imageReport.matched} token-matched = ${imageReport.kept + imageReport.matched} / ${products.length}  |  without a photo: ${missingImg}`);
if (imageReport.unmatched.length) {
  const byCat = {};
  for (const p of imageReport.unmatched) byCat[p.category] = (byCat[p.category] ?? 0) + 1;
  console.log(`  unmatched by category: ${JSON.stringify(byCat)}`);
}
