// Read-only diagnostic: samples each published product's actual photo color
// and flags cases where it lands in a clearly different color family than
// the product's stored `colorGroup` — the field that powers the site's
// COLOR filter checkboxes (Black, Blue, Green, Red, etc.). A shopper
// filtering by "Green" should see green things; this catches cases where
// the photo (or the colorGroup tag) is just wrong.
//
// Deliberately coarse: only flags a *different hue family* (e.g. tagged
// Green, photo reads red), not fine boundary disputes within a family
// (Gold vs. Brown, Red vs. Burgundy) — those buckets overlap by design and
// would just be noise. Skips "Multicolor" (no single dominant color to
// check) and any imageFilename that's an absolute-path stand-in (that
// product doesn't have its own photo yet — the stand-in's *source* product
// gets checked on its own).
//
// Usage: node scripts/verify-color-group-accuracy.mjs [--limit=N]
import sharp from "sharp";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const LIMIT = Number(process.argv.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? Infinity);

function median(arr) {
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s;
  const l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h *= 60;
  }
  return [h, s, l];
}

function hueFamily(h) {
  if (h >= 345 || h < 15) return "Red";
  if (h < 45) return "Orange";
  if (h < 70) return "Yellow";
  if (h < 170) return "Green";
  if (h < 255) return "Blue";
  return "Purple";
}

// Which hue families (or "Achromatic") are acceptable for each stored colorGroup.
const ACCEPTABLE = {
  Black: ["Achromatic"],
  White: ["Achromatic"],
  Ivory: ["Achromatic", "Yellow", "Orange"],
  Gray: ["Achromatic"],
  "Brown/Beige/Cafe/Tan": ["Achromatic", "Orange", "Yellow", "Red"],
  Gold: ["Yellow", "Orange", "Achromatic"],
  Copper: ["Orange", "Red", "Achromatic"],
  Yellow: ["Yellow", "Orange"],
  Orange: ["Orange", "Red", "Yellow"],
  Red: ["Red", "Orange", "Purple"],
  "Pink/Blush": ["Red", "Purple", "Achromatic"],
  "Purple/Burgundy": ["Purple", "Red", "Achromatic"],
  Blue: ["Blue", "Purple"],
  Green: ["Green", "Yellow"],
  Multicolor: null, // skip entirely
};

async function medianFabricColor(path) {
  const meta = await sharp(path).metadata();
  const cropW = Math.round(meta.width * 0.3);
  const cropH = Math.round(meta.height * 0.3);
  const left = Math.round((meta.width - cropW) / 2);
  const top = Math.round((meta.height - cropH) / 2);
  const { data, info } = await sharp(path)
    .extract({ left, top, width: cropW, height: cropH })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const n = info.width * info.height;
  const rs = new Array(n), gs = new Array(n), bs = new Array(n);
  for (let i = 0; i < n; i++) {
    const idx = i * info.channels;
    rs[i] = data[idx]; gs[i] = data[idx + 1]; bs[i] = data[idx + 2];
  }
  return [median(rs), median(gs), median(bs)];
}

function imagePath(category, filename) {
  if (!filename) return null;
  if (/^(https?:)?\/\//.test(filename) || filename.startsWith("/")) return null; // absolute path / URL / stand-in — skip
  return `public/images/${category}/${filename}`;
}

async function main() {
  const products = await db.product.findMany({
    where: { published: true, imageFilename: { not: null }, colorGroup: { not: null } },
    include: { category: true },
  });

  const flagged = [];
  let checked = 0, skipped = 0, failed = 0;

  for (const p of products) {
    if (checked >= LIMIT) break;
    const acceptable = ACCEPTABLE[p.colorGroup];
    if (acceptable === undefined) {
      console.warn(`Unknown colorGroup "${p.colorGroup}" on ${p.name} (${p.slug}) — add it to ACCEPTABLE`);
      continue;
    }
    if (acceptable === null) { skipped++; continue; } // Multicolor
    const path = imagePath(p.category.name, p.imageFilename);
    if (!path) { skipped++; continue; }

    try {
      const [r, g, b] = await medianFabricColor(path);
      const [h, s, l] = rgbToHsl(r, g, b);
      checked++;
      const family = s < 0.12 ? "Achromatic" : hueFamily(h);
      if (!acceptable.includes(family)) {
        flagged.push({
          name: p.name,
          slug: p.slug,
          category: p.category.name,
          colorGroup: p.colorGroup,
          sampledFamily: family,
          sampledHex: `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`,
          satPct: Math.round(s * 100),
          image: path,
        });
      }
    } catch (e) {
      failed++;
    }
  }

  flagged.sort((a, b) => a.colorGroup.localeCompare(b.colorGroup));
  console.log(`Checked ${checked} products (${skipped} skipped, ${failed} image read failures).\n`);
  console.log(`${flagged.length} flagged as a likely colorGroup/photo mismatch:\n`);
  for (const f of flagged) {
    console.log(`  ${f.colorGroup.padEnd(22)} tagged, photo reads ${f.sampledFamily.padEnd(10)} (${f.sampledHex}, sat ${f.satPct}%)  ${f.name} [${f.category}] — ${f.slug}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
