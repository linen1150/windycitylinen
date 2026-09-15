// One-off: third batch of confirmed items from Tera's punch list.
// - Burgundy items findable under Red as well as Purple/Burgundy (the
//   catalog has no separate "Burgundy" filter group — it's merged into
//   "Purple/Burgundy" — so this adds Red as a second tag rather than
//   replacing anything, matching the multi-color tagging already in place
//   elsewhere).
// - Splash: missing its Tablecloth entirely; also its Runner/Cuff were
//   still on the generic Brown/Beige placeholder while the Napkin had
//   already been fixed to Multicolor — bringing them in line.
// - Stripe Black and White: missing its Cuff.
//
// Run:  node scripts/fix-tera-batch3.mjs [--apply]

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

async function createProduct({ categoryName, fabricName, name, colorName, colorHex, colorGroups, imageFilename, keywords, sizeNames }) {
  const category = await db.category.findFirst({ where: { name: categoryName } });
  const fabric = await db.fabric.findFirst({ where: { name: fabricName } });
  const existing = await db.product.findFirst({ where: { name, categoryId: category.id, fabricId: fabric.id } });
  if (existing) {
    console.log(`SKIP (already exists): ${name} [${categoryName}]`);
    return;
  }
  const sizes = await db.size.findMany({ where: { name: { in: sizeNames } } });
  const slug = await uniqueSlug(slugify(`${name} ${categoryName}`));
  console.log(`${APPLY ? "CREATE" : "[dry run] would create"}: ${name} [${categoryName}] slug=${slug} image=${imageFilename}`);
  if (APPLY) {
    await db.product.create({
      data: {
        name, slug, categoryId: category.id, fabricId: fabric.id,
        colorName, colorHex, colorGroups, keywords, imageFilename,
        limited: false, reverseSide: false, published: true,
        sizes: { create: sizes.map((s) => ({ sizeId: s.id })) },
      },
    });
  }
}

async function main() {
  // A. Burgundy -> also findable under Red.
  const burgundyRows = await db.product.findMany({ where: { colorName: { contains: "Burgundy" } } });
  for (const r of burgundyRows) {
    if (r.colorGroups.includes("Red")) continue;
    const next = [...r.colorGroups, "Red"];
    console.log(`${APPLY ? "UPDATE" : "[dry run] would update"}: ${r.name} colorGroups -> ${JSON.stringify(next)} (was ${JSON.stringify(r.colorGroups)})`);
    if (APPLY) await db.product.update({ where: { id: r.id }, data: { colorGroups: next } });
  }

  // B. Splash Runner/Cuff -> Multicolor (matches the Napkin, already fixed).
  const splashRows = await db.product.findMany({ where: { name: "Splash" }, include: { category: true } });
  for (const r of splashRows) {
    if (JSON.stringify(r.colorGroups) === JSON.stringify(["Multicolor"])) continue;
    console.log(`${APPLY ? "UPDATE" : "[dry run] would update"}: Splash [${r.category.name}] colorGroups -> ["Multicolor"] (was ${JSON.stringify(r.colorGroups)})`);
    if (APPLY) await db.product.update({ where: { id: r.id }, data: { colorGroups: ["Multicolor"] } });
  }

  // C. Create the missing Splash tablecloth and Stripe Black and White cuff.
  await createProduct({
    categoryName: "Tablecloths and Overlays", fabricName: "Specialty",
    name: "Splash", colorName: "Splash",
    colorHex: "#B6A899", colorGroups: ["Multicolor"],
    imageFilename: "/images/Napkins/Napkin-Splash2.jpg",
    keywords: "", sizeNames: ['54" Square', '90" Square', '90" Round', '96" Round', '108" Round', '120" Square', '120" Round', '132" Square', '132" Round', '72"x120" Banquet', '90"x132" Banquet', '90"x156" Banquet', '108"x156" Banquet', '114"x180" Banquet'],
  });

  await createProduct({
    categoryName: "Cuffs", fabricName: "Specialty",
    name: "Stripe Black and White", colorName: "Stripe Black and White",
    colorHex: "#B6A899", colorGroups: ["Black", "White", "Multicolor"],
    imageFilename: "/images/Table Runners/SpecialtyStripeBlackandWhite.jpg",
    keywords: "french, paris, circus, modern, 50's, retro", sizeNames: ["Cuffs"],
  });
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
