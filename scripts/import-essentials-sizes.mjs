// One-off: replace the seeded category-default tablecloth sizes with the real
// per-fabric size availability from Rob's price guide ("2026 Windy City Linen
// Price Guide 7.28.2026.xlsx", Essentials tab — presence of a price = the fabric
// is offered in that size). No price values are stored here or anywhere in the
// app; only which sizes exist per fabric.
//
// Run: node scripts/import-essentials-sizes.mjs        (dry run, prints a report)
//      node scripts/import-essentials-sizes.mjs --apply  (writes the changes)
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Sizes with a price in the Essentials tab, per fabric row (Napkin/Tie/Runner/Cuff
// columns excluded — those map to separate single-size categories, not dimensions).
const ESSENTIALS_SIZES = {
  "Classic Solid": [
    '54" Square', '90" Square', '90" Round', '96" Round', '108" Round', '120" Square',
    '120" Round', '132" Square', '132" Round', '72"x120" Banquet', '90"x132" Banquet',
    '90"x156" Banquet', '108"x156" Banquet', '114"x180" Banquet',
  ],
  "Imperial Stripe": [
    '90" Square', '90" Round', '108" Round', '120" Round', '132" Round',
    '72"x120" Banquet', '90"x132" Banquet', '90"x156" Banquet', '108"x156" Banquet',
  ],
  "Picnic Check": [
    '54" Square', '90" Square', '90" Round', '108" Round', '120" Round', '132" Round',
    '72"x120" Banquet', '90"x132" Banquet', '90"x156" Banquet',
  ],
  "Shantung": [
    '96" Round', '108" Round', '120" Square', '120" Round', '132" Square', '132" Round',
    '90"x132" Banquet', '90"x156" Banquet', '108"x156" Banquet',
  ],
  "Matte Lamour": [
    '90" Square', '96" Round', '108" Round', '120" Round', '132" Square', '132" Round',
    '90"x132" Banquet', '90"x156" Banquet', '108"x156" Banquet',
  ],
  "Serenity": [
    '96" Round', '108" Round', '120" Round', '132" Round',
    '90"x156" Banquet', '108"x156" Banquet',
  ],
  "Bengaline": [
    '90" Square', '96" Round', '108" Round', '120" Square', '120" Round', '132" Square',
    '132" Round', '90"x132" Banquet', '90"x156" Banquet', '108"x156" Banquet',
  ],
  "Soiree": [
    '90" Square', '108" Round', '120" Round', '132" Round',
    '90"x132" Banquet', '90"x156" Banquet', '108"x156" Banquet',
  ],
  "Bichon Crush": [
    '90" Square', '90" Round', '108" Round', '120" Round', '132" Round',
    '90"x132" Banquet', '90"x156" Banquet', '108"x156" Banquet',
  ],
  "Jute": [
    '108" Round', '120" Square', '120" Round', '132" Round',
    '90"x132" Banquet', '90"x156" Banquet', '108"x156" Banquet',
  ],
};

// Mirage lives under fabric=Specialty (colorName starts with "Mirage"), not its
// own Fabric row.
const MIRAGE_SIZES = [
  '96" Round', '108" Round', '120" Round', '132" Round', '90"x156" Banquet', '108"x156" Banquet',
];

const DRY_RUN = !process.argv.includes("--apply");

async function applySizes(label, products, sizeIds) {
  const before = products.length ? products[0].sizes.length : 0;
  console.log(`${label} -> ${sizeIds.length} sizes | ${products.length} tablecloth products (sample before: ${before} sizes)`);
  if (DRY_RUN) return;
  for (const p of products) {
    await prisma.productSize.deleteMany({ where: { productId: p.id } });
    await prisma.productSize.createMany({ data: sizeIds.map((sizeId) => ({ productId: p.id, sizeId })) });
  }
  console.log(`  applied to ${products.length} products`);
}

async function run() {
  const sizes = await prisma.size.findMany();
  const sizeIdByName = new Map(sizes.map((s) => [s.name, s.id]));
  const fabrics = await prisma.fabric.findMany();
  const fabricByName = new Map(fabrics.map((f) => [f.name, f]));
  const tablecloth = await prisma.category.findFirst({ where: { name: "Tablecloths and Overlays" } });

  for (const [fabricName, sizeNames] of Object.entries(ESSENTIALS_SIZES)) {
    const fabric = fabricByName.get(fabricName);
    if (!fabric) {
      console.log(`SKIP (fabric not found): ${fabricName}`);
      continue;
    }
    const sizeIds = sizeNames.map((n) => sizeIdByName.get(n)).filter(Boolean);
    const products = await prisma.product.findMany({
      where: { fabricId: fabric.id, categoryId: tablecloth.id },
      include: { sizes: true },
    });
    await applySizes(fabricName, products, sizeIds);
  }

  const specialty = fabricByName.get("Specialty");
  const mirageSizeIds = MIRAGE_SIZES.map((n) => sizeIdByName.get(n)).filter(Boolean);
  const mirageProducts = await prisma.product.findMany({
    where: { fabricId: specialty.id, categoryId: tablecloth.id, colorName: { startsWith: "Mirage" } },
    include: { sizes: true },
  });
  await applySizes("Mirage", mirageProducts, mirageSizeIds);

  if (DRY_RUN) console.log("\n(dry run — re-run with --apply to write these changes)");
  await prisma.$disconnect();
}

run();
