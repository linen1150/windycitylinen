// Verification (read-only, no writes): for every product with a real photo,
// sample the photo's actual average color and compare it against the
// product's stored colorHex — flags cases where the assigned photo doesn't
// visually match its own catalog color, which is exactly the class of bug
// the team's status doc reported by hand (Shantung Turquoise reverse showing
// teal, Serenity Willow using the Driftwood photo, etc.) but checked here
// across the whole 1220-product catalog at once instead of one by one.
//
// Distance is plain Euclidean in RGB — crude, but good enough to rank
// candidates for a human look; it is not a proof of a bug on its own; a
// deliberately different reverse-side color, ambient photo lighting, or two
// legitimately close shades (e.g. two blues) can also score high.
//
// Usage: node scripts/verify-swatch-colors.mjs [--limit=40]
import sharp from "sharp";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const LIMIT = Number(process.argv.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? 60);

function hexToRgb(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function imageUrl(category, filename) {
  if (!filename) return null;
  if (/^(https?:)?\/\//.test(filename) || filename.startsWith("/")) return filename;
  return `public/images/${category}/${filename}`;
}

async function main() {
  const products = await db.product.findMany({
    where: { colorHex: { not: null }, imageFilename: { not: null }, published: true },
    include: { category: true, fabric: true },
  });

  const results = [];
  let failed = 0;
  for (const p of products) {
    const rel = imageUrl(p.category.name, p.imageFilename);
    if (!rel || rel.startsWith("http") || rel.startsWith("/")) continue; // skip non-local paths
    try {
      const { data, info } = await sharp(rel)
        .resize(60, 60, { fit: "cover" })
        .raw()
        .toBuffer({ resolveWithObject: true });
      let r = 0, g = 0, b = 0;
      const n = info.width * info.height;
      for (let i = 0; i < n; i++) {
        r += data[i * info.channels];
        g += data[i * info.channels + 1];
        b += data[i * info.channels + 2];
      }
      r /= n; g /= n; b /= n;
      const expected = hexToRgb(p.colorHex);
      const dist = Math.sqrt((r - expected.r) ** 2 + (g - expected.g) ** 2 + (b - expected.b) ** 2);
      results.push({
        slug: p.slug,
        name: p.name,
        category: p.category.name,
        colorHex: p.colorHex,
        sampled: `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`,
        dist: Math.round(dist),
        image: rel,
      });
    } catch (e) {
      failed++;
    }
  }

  results.sort((a, b) => b.dist - a.dist);
  console.log(`Checked ${results.length} products (${failed} image read failures).\n`);
  console.log(`Top ${LIMIT} biggest mismatches (stored colorHex vs. sampled photo color):\n`);
  for (const r of results.slice(0, LIMIT)) {
    console.log(`${r.dist.toString().padStart(3)}  ${r.name.padEnd(38)} stored=${r.colorHex}  photo=${r.sampled}  ${r.image}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
