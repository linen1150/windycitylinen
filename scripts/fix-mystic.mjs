// One-off: "Mystic cloth needs to be added" (missing tablecloth) and fix its
// colorGroups (currently the generic Brown/Beige placeholder fallback; it's
// actually a navy-on-white damask print). Napkin and Runner already share
// the same correct photo, so "runner doesn't match napkin" looks already
// resolved — nothing to recolor there.
//
// Run:  node scripts/fix-mystic.mjs [--apply]

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

async function main() {
  const existing = await db.product.findMany({ where: { name: "Mystic" } });
  for (const r of existing) {
    console.log(`${APPLY ? "UPDATE" : "[dry run] would update"}: Mystic colorGroups -> ["Blue","White"] (was ${JSON.stringify(r.colorGroups)})`);
    if (APPLY) await db.product.update({ where: { id: r.id }, data: { colorGroups: ["Blue", "White"] } });
  }

  const category = await db.category.findFirst({ where: { name: "Tablecloths and Overlays" } });
  const fabric = await db.fabric.findFirst({ where: { name: "Specialty" } });
  const already = await db.product.findFirst({ where: { name: "Mystic", categoryId: category.id, fabricId: fabric.id } });
  if (already) {
    console.log("SKIP (already exists): Mystic [Tablecloths and Overlays]");
  } else {
    const fullSizes = await db.size.findMany({
      where: { name: { in: ['54" Square', '90" Square', '90" Round', '96" Round', '108" Round', '120" Square', '120" Round', '132" Square', '132" Round', '72"x120" Banquet', '90"x132" Banquet', '90"x156" Banquet', '108"x156" Banquet', '114"x180" Banquet'] } },
    });
    const slug = await uniqueSlug(slugify("Mystic Tablecloths and Overlays"));
    console.log(`${APPLY ? "CREATE" : "[dry run] would create"}: Mystic [Tablecloths and Overlays] slug=${slug} image=/images/Napkins/SpecialtyMystic.jpg`);
    if (APPLY) {
      await db.product.create({
        data: {
          name: "Mystic",
          slug,
          categoryId: category.id,
          fabricId: fabric.id,
          colorName: "Mystic",
          colorHex: "#2C3E6B",
          colorGroups: ["Blue", "White"],
          keywords: "damask, navy",
          imageFilename: "/images/Napkins/SpecialtyMystic.jpg",
          limited: false,
          reverseSide: false,
          published: true,
          sizes: { create: fullSizes.map((s) => ({ sizeId: s.id })) },
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
