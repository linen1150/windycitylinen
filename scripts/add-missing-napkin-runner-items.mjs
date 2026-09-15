// One-off: create the Napkin/Table Runner products confirmed missing by
// cross-checking the 2026 price guide against the live catalog (the guide
// prices these items in a category where no matching product row exists).
// Each new row reuses its sibling's real photo (a different category, same
// print/color) as a clearly-appropriate stand-in — same fabric swatch, no
// duplicated bytes — except Sparkle Sheer Turquoise, whose sibling itself has
// no photo on file yet, so it correctly falls through to the "Coming soon"
// placeholder.
//
// Run:  node scripts/add-missing-napkin-runner-items.mjs [--apply]
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

const NEW_ITEMS = [
  {
    category: "Napkins",
    name: "Hex",
    colorName: "Hex",
    colorHex: "#B6A899",
    colorGroups: ["Brown/Beige/Cafe/Tan"],
    imageFilename: "/images/Tablecloths and Overlays/hex.jpg",
    keywords: "Silver, Charcoal, retro, geometric, 50's, 60's, 70's",
  },
  {
    category: "Napkins",
    name: "Brushstrokes",
    colorName: "Brushstrokes",
    colorHex: "#B6A899",
    colorGroups: ["Purple/Burgundy"],
    imageFilename: "/images/Table Runners/BrushstrokesRunner.jpg",
    keywords: "paint, abstract, easter, spring, taylor",
  },
  {
    category: "Napkins",
    name: "Red Shantung Swirl",
    colorName: "Red Shantung Swirl",
    colorHex: "#B6A899",
    colorGroups: ["Red"],
    imageFilename: "/images/Tablecloths and Overlays/shantungswirlred.jpg",
    keywords: "red, holiday, embroidered",
  },
  {
    category: "Napkins",
    name: "Indigo Bloom",
    colorName: "Indigo Bloom",
    colorHex: "#B6A899",
    colorGroups: ["Blue"],
    imageFilename: "/images/Tablecloths and Overlays/indigobloom.jpg",
    keywords: "Floral, Paisley, botanical, thanksgiving, autumn, mother's, fall, blue",
  },
  {
    category: "Napkins",
    name: "Eleanor - Bone",
    colorName: "Eleanor - Bone",
    colorHex: "#B6A899",
    colorGroups: ["Ivory"],
    imageFilename: "/images/Tablecloths and Overlays/eleanorspeciality.jpg",
    keywords: "bone, ivory, off white, wedding, gatsby, beige, winter, gala, formal, traditional",
  },
  {
    category: "Table Runners",
    name: "Sparkle Sheer Ivory",
    colorName: "Sparkle Sheer Ivory",
    colorHex: "#B6A899",
    colorGroups: ["Ivory"],
    imageFilename: "/images/Tablecloths and Overlays/tablecloth20.jpg",
    keywords: "",
  },
  {
    category: "Table Runners",
    name: "Sparkle Sheer Lilac",
    colorName: "Sparkle Sheer Lilac",
    colorHex: "#B6A899",
    colorGroups: ["Purple/Burgundy"],
    imageFilename: "/images/Tablecloths and Overlays/tablecloth8.jpg",
    keywords: "",
  },
  {
    category: "Table Runners",
    name: "Sparkle Sheer White",
    colorName: "Sparkle Sheer White",
    colorHex: "#B6A899",
    colorGroups: ["White"],
    imageFilename: "/images/Tablecloths and Overlays/tablecloth8.jpg",
    keywords: "",
  },
  {
    category: "Table Runners",
    name: "Sparkle Sheer Black",
    colorName: "Sparkle Sheer Black",
    colorHex: "#B6A899",
    colorGroups: ["Black"],
    imageFilename: "/images/Tablecloths and Overlays/tablecloth23.jpg",
    keywords: "",
  },
  {
    category: "Table Runners",
    name: "Sparkle Sheer Gold",
    colorName: "Sparkle Sheer Gold",
    colorHex: "#B6A899",
    colorGroups: ["Gold"],
    imageFilename: "/images/Tablecloths and Overlays/tablecloth6.jpg",
    keywords: "",
  },
  {
    category: "Table Runners",
    name: "Sparkle Sheer Royal",
    colorName: "Sparkle Sheer Royal",
    colorHex: "#B6A899",
    colorGroups: ["Brown/Beige/Cafe/Tan"],
    imageFilename: "/images/Tablecloths and Overlays/tablecloth22.jpg",
    keywords: "",
  },
  {
    category: "Table Runners",
    name: "Sparkle Sheer Turquoise",
    colorName: "Sparkle Sheer Turquoise",
    colorHex: "#30D5C8",
    colorGroups: ["Blue"],
    imageFilename: null, // sibling tablecloth also has no photo yet
    keywords: "",
  },
];

async function main() {
  const fabric = await db.fabric.findFirst({ where: { name: "Specialty" } });
  if (!fabric) throw new Error("Specialty fabric not found");

  for (const item of NEW_ITEMS) {
    const category = await db.category.findFirst({ where: { name: item.category } });
    if (!category) throw new Error(`Category not found: ${item.category}`);

    const existing = await db.product.findFirst({
      where: { name: item.name, categoryId: category.id, fabricId: fabric.id },
    });
    if (existing) {
      console.log(`SKIP (already exists): ${item.name} [${item.category}]`);
      continue;
    }

    const sizeName = item.category === "Napkins" ? "Napkins" : "Runners";
    const size = await db.size.findFirst({ where: { name: sizeName } });
    if (!size) throw new Error(`Size not found: ${sizeName}`);

    let slug = slugify(`${item.name} ${item.category}`);
    let n = 1;
    while (await db.product.findFirst({ where: { slug } })) {
      slug = `${slugify(`${item.name} ${item.category}`)}-${++n}`;
    }

    console.log(`${APPLY ? "CREATE" : "[dry run] would create"}: ${item.name} [${item.category}] slug=${slug} image=${item.imageFilename ?? "(none — Coming soon placeholder)"}`);

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
          keywords: item.keywords,
          imageFilename: item.imageFilename,
          limited: false,
          reverseSide: false,
          published: true,
          sizes: { create: [{ sizeId: size.id }] },
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
