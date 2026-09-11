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

// [typo spelling in DB, correct spelling confirmed against the price guide]
const FIXES = [
  ["Amalfi Saphire", "Amalfi Sapphire"],
  ["Bahaus", "Bauhaus"],
  ["Brushstroke", "Brushstrokes"],
  ["Echo Lumier", "Echo Lumiere"],
  ["Pamela Palms", "Pamela Palm"],
];

const DRY_RUN = !process.argv.includes("--apply");

async function run() {
  for (const [typo, correct] of FIXES) {
    const products = await prisma.product.findMany({ where: { colorName: typo } });
    console.log(`\n${typo} -> ${correct} (${products.length} products)`);
    for (const p of products) {
      let newSlug = slugify(correct);
      const collision = await prisma.product.findFirst({ where: { slug: newSlug, NOT: { id: p.id } } });
      if (collision) newSlug = `${newSlug}-${p.externalId ?? p.id.slice(-4)}`;
      console.log(`  ${p.slug} -> ${newSlug} (${p.name} -> ${correct})`);
      if (!DRY_RUN) {
        await prisma.product.update({
          where: { id: p.id },
          data: { name: correct, colorName: correct, slug: newSlug },
        });
      }
    }
  }
  if (DRY_RUN) console.log("\n(dry run — re-run with --apply to write these changes)");
  await prisma.$disconnect();
}

run();
