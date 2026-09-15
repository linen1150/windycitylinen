// One-off: from Tera's 9/15 punch list — 5 "neon" Classic Solid colors, a
// renamed "Sky Sedona", and "Candace" don't exist anywhere in the catalog
// and have no reference photo to stand in from. Per instruction, add each as
// a Tablecloth-only product with no photo (renders the "Coming soon" smiley
// placeholder site-wide) rather than guess at a color/photo that isn't real.
//
// Run:  node scripts/add-neon-sedona-candace.mjs [--apply]
// Default is a dry run; pass --apply to actually write.

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const APPLY = process.argv.includes("--apply");

function slugify(input) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/["'’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function uniqueSlug(base) {
  let slug = base;
  let n = 1;
  while (await db.product.findFirst({ where: { slug } })) {
    slug = `${base}-${++n}`;
  }
  return slug;
}

const CLASSIC_SOLID_SIZES = ["54\" Square", "90\" Square", "90\" Round", "96\" Round", "108\" Round", "120\" Square", "120\" Round", "132\" Square", "132\" Round", "72\"x120\" Banquet", "90\"x132\" Banquet", "90\"x156\" Banquet", "108\"x156\" Banquet", "114\"x180\" Banquet"];

const ITEMS = [
  { fabric: "Classic Solid", name: "Classic Solid Neon Tangerine", colorName: "Neon Tangerine", colorHex: "#FF6B35", colorGroups: ["Orange"], sizes: CLASSIC_SOLID_SIZES },
  { fabric: "Classic Solid", name: "Classic Solid Neon Orange", colorName: "Neon Orange", colorHex: "#FF5F00", colorGroups: ["Orange"], sizes: CLASSIC_SOLID_SIZES },
  { fabric: "Classic Solid", name: "Classic Solid Neon Pink", colorName: "Neon Pink", colorHex: "#FF1493", colorGroups: ["Pink/Blush"], sizes: CLASSIC_SOLID_SIZES },
  { fabric: "Classic Solid", name: "Classic Solid Neon Green", colorName: "Neon Green", colorHex: "#39FF14", colorGroups: ["Green"], sizes: CLASSIC_SOLID_SIZES },
  { fabric: "Classic Solid", name: "Classic Solid Neon Yellow", colorName: "Neon Yellow", colorHex: "#FFFF33", colorGroups: ["Yellow"], sizes: CLASSIC_SOLID_SIZES },
  { fabric: "Specialty", name: "Sky Sedona", colorName: "Sky Sedona", colorHex: "#7EC8E3", colorGroups: ["Blue"], sizes: null }, // null = keep the existing full-range default (no per-item price-guide data)
  { fabric: "Specialty", name: "Candace", colorName: "Candace", colorHex: "#B6A899", colorGroups: ["Brown/Beige/Cafe/Tan"], sizes: null },
];

async function main() {
  const category = await db.category.findFirst({ where: { name: "Tablecloths and Overlays" } });
  const fullSizeRows = await db.size.findMany({
    where: { name: { in: CLASSIC_SOLID_SIZES } },
  });

  for (const item of ITEMS) {
    const fabric = await db.fabric.findFirst({ where: { name: item.fabric } });
    const existing = await db.product.findFirst({ where: { name: item.name, categoryId: category.id, fabricId: fabric.id } });
    if (existing) {
      console.log(`SKIP (already exists): ${item.name}`);
      continue;
    }
    const sizeRows = item.sizes
      ? fullSizeRows.filter((s) => item.sizes.includes(s.name))
      : fullSizeRows; // Specialty items with no guide data: same full-range default as everything else unmapped

    const slug = await uniqueSlug(slugify(item.name));
    console.log(`${APPLY ? "CREATE" : "[dry run] would create"}: ${item.name} [Tablecloths and Overlays] slug=${slug} (no photo — Coming soon placeholder)`);
    if (APPLY) {
      await db.product.create({
        data: {
          name: item.name,
          slug,
          categoryId: category.id,
          fabricId: fabric.id,
          colorName: item.colorName,
          colorHex: item.colorHex,
          colorGroups: item.colorGroups,
          keywords: "",
          imageFilename: null,
          limited: false,
          reverseSide: false,
          published: true,
          sizes: { create: sizeRows.map((s) => ({ sizeId: s.id })) },
        },
      });
    }
  }
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
