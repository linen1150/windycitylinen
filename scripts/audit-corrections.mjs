import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const NAMES = [
  "Jute Dove", "Mirage Vanilla", "Dolce Vanilla", "Soiree Champagne",
  "Teal", "Mirage Cloud", "Mirage Sandstone", "Sandstone", "Serenity Driftwood",
  "Abstract Geometric", "Bauhaus", "Cairns", "Candace", "Echo Lumiere",
  "Hampton Botanical Apple", "Hampton Botanical Rose", "Helena Apple", "Hex",
  "Holly", "Josephine", "Key West", "Kiwi Palazzo", "Kringle", "Laguna",
  "Lorelei", "Lucia", "Meteorite", "Metropolitan Concrete", "Midas Travertine",
  "Nadia", "Nantucket", "Pamela Palm", "Patchwork", "Phoebe", "Phoenix",
  "Regency", "Retro Vintage", "Romeo", "Santorini", "Silhouette",
  "Sparkle Sheer Royal", "Spiro", "Velvet Loden", "Velvet Spice", "Verve Pearl",
  "Water Lily", "Waterlily", "Woodland", "Wren Coastal", "Zebra",
  "Raspberry Picnic Check", "Picnic Check Raspberry", "Apple Mini Check",
  "Hampton Stripe", "Cabana Stripe", "Hampton Stripe Dune", "Hampton Stripe Coastal",
  "Willow Check", "Jute Lipstick", "Raspberry Matte Lamour", "Matte Lamour Raspberry",
];

async function main() {
  for (const name of NAMES) {
    const rows = await db.product.findMany({
      where: { name: { contains: name, mode: "insensitive" } },
      include: { category: true, fabric: true },
      orderBy: [{ name: "asc" }, { category: { name: "asc" } }],
    });
    if (rows.length === 0) {
      console.log(`\n=== "${name}" === NOT FOUND`);
      continue;
    }
    console.log(`\n=== "${name}" === (${rows.length} rows)`);
    for (const r of rows) {
      console.log(`  [${r.id}] "${r.name}" | ${r.category.name} | ${r.fabric.name} | groups=${JSON.stringify(r.colorGroups)} | img=${r.imageFilename}`);
    }
  }

  console.log("\n\n=== Imperial Stripe fabric products ===");
  const isRows = await db.product.findMany({
    where: { fabric: { name: "Imperial Stripe" } },
    include: { category: true },
    orderBy: [{ name: "asc" }],
  });
  for (const r of isRows) {
    console.log(`  [${r.id}] "${r.name}" | ${r.category.name} | groups=${JSON.stringify(r.colorGroups)}`);
  }
}

main().then(() => db.$disconnect()).catch(async (e) => { console.error(e); await db.$disconnect(); process.exit(1); });
