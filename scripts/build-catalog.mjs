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
const raw = JSON.parse(readText("data/catalog-raw.json"));

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
  [/\b(blue|navy|teal|aqua|turquoise|cerulean|cobalt|periwinkle|denim|indigo|sky|sapphire|marine|ocean|slate|caribbean)\b/i, "Blue"],
  [/\b(green|sage|olive|emerald|kelly|hunter|forest|mint|moss|fern|celadon|clover|lime|pistachio|basil|seafoam|jade|avocado)\b/i, "Green"],
  [/\b(gray|grey|silver|pewter|charcoal|graphite|smoke|ash|platinum|steel)\b/i, "Gray"],
  // "jute" deliberately excluded: in this catalog it only ever names the Jute
  // fabric line (baked into the product/color name, e.g. "Jute Black"), never
  // an actual color — keeping it as a keyword mistagged every Jute product brown.
  [/\b(brown|beige|cafe|tan|taupe|camel|mocha|chocolate|espresso|khaki|sand|wheat|latte|coffee|hazelnut|walnut|burlap|natural|nutmeg|cinnamon|toffee|caramel|chestnut|sable|driftwood|oatmeal|spice|spiced|cider)\b/i, "Brown/Beige/Cafe/Tan"],
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
  // "Violet Green" is the supplier's fabric-line name, not a real color mix —
  // the crushed-velvet photo (and its hex #5A7A4A) is plain green.
  184: ["Green"],
  // "Splash" is a specialty print with no real sampled hex on file (falls
  // back to the neutral placeholder) — it's a multicolor pattern in the photo.
  705: ["Multicolor"],
};

// Same idea, but for a whole colorway (every category/size variant shares the
// exact color name) — these have no real sampled hex on file, so every
// variant would otherwise fall back to the same wrong guess.
const COLOR_GROUP_NAME_OVERRIDES = {
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
  // "Champagne Gold" is one blended color name, not champagne + gold — the
  // keyword matcher was splitting it into two groups.
  "Bichon Crush Champagne Gold (Limited)": ["Gold"],
  "Velvet Champagne Gold": ["Gold"],
  "Verve Champagne Gold": ["Gold"],
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
    sizes: SIZES_BY_CATEGORY[r.category] ?? [],
    collections: [], // assigned later via the admin panel
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
