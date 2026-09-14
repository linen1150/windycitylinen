// One-off: Aurora White and Aurora Ivory table runners don't exist in the
// catalog yet — every other piece (tablecloth, napkin, cuff) already has an
// Aurora White/Ivory row, but Table Runners never got one. Real photos were
// found in Dropbox (Website Updates 4.16.2025/Runners) and placed at
// public/images/Table Runners/AuroraWhiteRunner.jpg and AuroraIvoryRunner.jpg
// (+ matching .webp) before this script runs. Creates the two Product rows
// directly (bypassing catalog-raw.json, same as an admin-panel create), so
// they're not touched by a future db:build-catalog/db:seed.
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
  const category = await db.category.findFirst({ where: { name: "Table Runners" } });
  const fabric = await db.fabric.findFirst({ where: { name: "Specialty" } });
  const runnersSize = await db.size.findFirst({ where: { name: "Runners" } });
  if (!category || !fabric || !runnersSize) {
    throw new Error("Missing Table Runners category, Specialty fabric, or Runners size");
  }

  const entries = [
    {
      name: "Aurora White",
      colorName: "Aurora White",
      colorGroup: "White",
      keywords: "texture, neutral, wedding, winter",
      imageFilename: "AuroraWhiteRunner.jpg",
      slugBase: "aurora-white-runner",
    },
    {
      name: "Aurora Ivory",
      colorName: "Aurora Ivory",
      colorGroup: "Ivory",
      keywords: "texture, wedding, neutral, cream, off, winter",
      imageFilename: "AuroraIvoryRunner.jpg",
      slugBase: "aurora-ivory-runner",
    },
  ];

  for (const e of entries) {
    const existing = await db.product.findFirst({
      where: { categoryId: category.id, colorName: e.colorName },
    });
    if (existing) {
      console.log(`Skipping ${e.name} — already exists (${existing.slug})`);
      continue;
    }

    const slug = await uniqueSlug(e.slugBase);
    const product = await db.product.create({
      data: {
        name: e.name,
        slug,
        categoryId: category.id,
        fabricId: fabric.id,
        colorName: e.colorName,
        colorHex: "#B6A899", // matches the shared placeholder used by every other Aurora entry
        colorGroup: e.colorGroup,
        keywords: e.keywords,
        imageFilename: e.imageFilename,
        limited: false,
        reverseSide: false,
        published: true,
        sizes: { create: [{ sizeId: runnersSize.id }] },
      },
    });
    console.log(`Created ${product.name} -> ${product.slug} (${product.id})`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
