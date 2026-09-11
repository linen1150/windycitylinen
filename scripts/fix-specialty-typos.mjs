// One-off: fix 5 confirmed typo-duplicate colorNames in the Specialty fabric,
// found by cross-checking the catalog against Rob's price guide ("2026 Windy City
// Linen Price Guide 7.28.2026.xlsx", Specialty Price tab) plus a within-catalog
// near-duplicate scan. Each pair turned out to be the SAME real color split across
// two spellings in different categories (e.g. "Amalfi Saphire" had the Runner+Cuff
// variants, "Amalfi Sapphire" had the Napkin+Tablecloth variants) — standardizing
// the spelling merges them into one complete item across all its categories.
//
// Run: node scripts/fix-specialty-typos.mjs          (dry run)
//      node scripts/fix-specialty-typos.mjs --apply    (writes the changes)
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function slugify(input) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/["'’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// [spelling in DB, correct/canonical spelling]
// Round 1 (applied): typo duplicates, each split across categories under two spellings.
// Round 2 (applied): word-order-only differences vs the price guide — Rob asked to
// consolidate these too. Kept the catalog's existing spelling over the guide's for
// Bauhuas/Pallete/Tye Dye/Sequin(singular), since those are typos or inconsistent
// even within the guide's own other tabs — see this session's transcript.
const FIXES = [
  ["Amalfi Saphire", "Amalfi Sapphire"],
  ["Bahaus", "Bauhaus"],
  ["Brushstroke", "Brushstrokes"],
  ["Echo Lumier", "Echo Lumiere"],
  ["Pamela Palms", "Pamela Palm"],
  ["Houndstooth Black", "Black Houndstooth"],
  ["Ice Blue Chiffon", "Chiffon Ice Blue"],
  ["Geometric Gold Foil", "Geometric Foil Gold"],
  ["Geometric Silver Foil", "Geometric Foil Silver"],
  ["Amber Matrix", "Matrix Amber"],
  ["Burnt Orange Matrix", "Matrix Burnt Orange"],
  ["Ornamental Silver Lace", "Ornamental Lace Silver"],
  ["Ornamental White Lace", "Ornamental Lace White"],
  ["Navy Verve", "Verve Navy"],
];

const DRY_RUN = !process.argv.includes("--apply");

async function run() {
  for (const [from, to] of FIXES) {
    const products = await prisma.product.findMany({ where: { colorName: from } });
    console.log(`\n${from} -> ${to} (${products.length} products)`);
    for (const p of products) {
      // Guard against creating a true same-category duplicate (missed once before —
      // see the Bauhaus/Cuffs cleanup in this session).
      const sameCategoryCollision = await prisma.product.findFirst({
        where: { colorName: to, categoryId: p.categoryId, NOT: { id: p.id } },
      });
      if (sameCategoryCollision) {
        console.log(`  SKIP ${p.slug}: "${to}" already has a product in this category (${sameCategoryCollision.slug}) — needs manual review, not a clean merge`);
        continue;
      }
      let newSlug = slugify(to);
      const slugCollision = await prisma.product.findFirst({ where: { slug: newSlug, NOT: { id: p.id } } });
      if (slugCollision) newSlug = `${newSlug}-${p.externalId ?? p.id.slice(-4)}`;
      console.log(`  ${p.slug} -> ${newSlug} (${p.name} -> ${to})`);
      if (!DRY_RUN) {
        await prisma.product.update({
          where: { id: p.id },
          data: { name: to, colorName: to, slug: newSlug },
        });
      }
    }
  }
  if (DRY_RUN) console.log("\n(dry run — re-run with --apply to write these changes)");
  await prisma.$disconnect();
}

run();
