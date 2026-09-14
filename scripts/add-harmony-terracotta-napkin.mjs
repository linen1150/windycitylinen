// One-off: Harmony Terracotta napkin doesn't exist in the catalog yet — every
// other piece (runner) already has one, but the napkin never got added. No
// napkin-specific photo turned up anywhere in Dropbox, so per Rob's call this
// points at the runner's real photo as a stand-in (absolute path, so it
// doesn't need duplicating into public/images/Napkins/) rather than leaving
// the napkin off the site. Swap in a real napkin photo here once one exists.
//
// Run against local dev DB by default; pass DATABASE_URL=<production> to
// run against production instead.
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function uniqueSlug(base) {
  let slug = base;
  let n = 1;
  while (await db.product.findFirst({ where: { slug } })) {
    slug = `${base}-${++n}`;
  }
  return slug;
}

async function main() {
  const category = await db.category.findFirst({ where: { name: "Napkins" } });
  const fabric = await db.fabric.findFirst({ where: { name: "Specialty" } });
  const napkinsSize = await db.size.findFirst({ where: { name: "Napkins" } });
  if (!category || !fabric || !napkinsSize) {
    throw new Error("Missing Napkins category, Specialty fabric, or Napkins size");
  }

  const existing = await db.product.findFirst({
    where: { categoryId: category.id, colorName: "Harmony Terracotta" },
  });
  if (existing) {
    console.log(`Skipping — already exists (${existing.slug})`);
    return;
  }

  const slug = await uniqueSlug("harmony-terracotta-napkin");
  const product = await db.product.create({
    data: {
      name: "Harmony Terracotta",
      slug,
      categoryId: category.id,
      fabricId: fabric.id,
      colorName: "Harmony Terracotta",
      colorHex: "#B6A899",
      colorGroup: "Copper",
      keywords: "gauze, crinkle, cheese, cloth, head, cake, rust, autumn",
      imageFilename: "/images/Table Runners/HarmonyTerracottaRunner.jpg",
      limited: false,
      reverseSide: false,
      published: true,
      sizes: { create: [{ sizeId: napkinsSize.id }] },
    },
  });
  console.log(`Created ${product.name} -> ${product.slug} (${product.id})`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
