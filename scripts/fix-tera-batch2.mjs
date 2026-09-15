// One-off: second batch of confirmed items from Tera's punch list — color/
// attribute mistags, a duplicate, a rename, and missing category variants
// for several Specialty prints. Each new row reuses a same-print sibling's
// real photo as a stand-in.
//
// Run:  node scripts/fix-tera-batch2.mjs [--apply]

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

const FULL_SIZES = ['54" Square', '90" Square', '90" Round', '96" Round', '108" Round', '120" Square', '120" Round', '132" Square', '132" Round', '72"x120" Banquet', '90"x132" Banquet', '90"x156" Banquet', '108"x156" Banquet', '114"x180" Banquet'];
const PICNIC_CHECK_SIZES = ['54" Square', '90" Square', '90" Round', '108" Round', '120" Round', '132" Round', '72"x120" Banquet', '90"x132" Banquet', '90"x156" Banquet'];

async function createProduct({ categoryName, fabricName, name, colorName, colorHex, colorGroups, imageFilename, keywords, sizeNames, reverseSide = false }) {
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
        limited: false, reverseSide, published: true,
        sizes: { create: sizes.map((s) => ({ sizeId: s.id })) },
      },
    });
  }
}

async function main() {
  // A. Color/attribute fixes — mistagged as the generic Brown/Beige fallback.
  const colorFixes = [
    { name: "Cambric", groups: ["Pink/Blush"] },
    { name: "Middleton Lace", groups: ["Ivory"] },
    { name: "Cinderella", groups: ["White"] },
  ];
  for (const fix of colorFixes) {
    const rows = await db.product.findMany({ where: { name: fix.name } });
    for (const r of rows) {
      if (JSON.stringify(r.colorGroups) === JSON.stringify(fix.groups)) continue;
      console.log(`${APPLY ? "UPDATE" : "[dry run] would update"}: ${fix.name} [${r.id}] colorGroups -> ${JSON.stringify(fix.groups)} (was ${JSON.stringify(r.colorGroups)})`);
      if (APPLY) await db.product.update({ where: { id: r.id }, data: { colorGroups: fix.groups } });
    }
  }

  // B. Delete the duplicate "Navy Sequins" runner (dupe of "Sequins Lace Navy").
  const dupe = await db.product.findFirst({ where: { name: "Navy Sequins" }, include: { category: true } });
  if (dupe) {
    console.log(`${APPLY ? "DELETE" : "[dry run] would delete"}: Navy Sequins [${dupe.category.name}] id=${dupe.id}`);
    if (APPLY) await db.product.delete({ where: { id: dupe.id } });
  } else {
    console.log('SKIP delete (not found): Navy Sequins');
  }

  // C. Rename "Eleanor - Bone" -> "Eleanor".
  const eleanorRows = await db.product.findMany({ where: { name: "Eleanor - Bone" } });
  for (const r of eleanorRows) {
    console.log(`${APPLY ? "RENAME" : "[dry run] would rename"}: "Eleanor - Bone" -> "Eleanor" [${r.id}]`);
    if (APPLY) await db.product.update({ where: { id: r.id }, data: { name: "Eleanor", colorName: "Eleanor" } });
  }

  // D. Create missing category variants.
  await createProduct({
    categoryName: "Tablecloths and Overlays", fabricName: "Picnic Check",
    name: "Raspberry Picnic Check", colorName: "Raspberry Picnic Check",
    colorHex: "#B6A899", colorGroups: ["Multicolor"],
    imageFilename: "/images/Table Runners/Runner-RaspberryPicnicCheck.jpg",
    keywords: "", sizeNames: PICNIC_CHECK_SIZES,
  });
  await createProduct({
    categoryName: "Napkins", fabricName: "Picnic Check",
    name: "Raspberry Picnic Check", colorName: "Raspberry Picnic Check",
    colorHex: "#B6A899", colorGroups: ["Multicolor"],
    imageFilename: "/images/Table Runners/Runner-RaspberryPicnicCheck.jpg",
    keywords: "", sizeNames: ["Napkins"],
  });

  await createProduct({
    categoryName: "Table Runners", fabricName: "Specialty",
    name: "Dolce Biscotti", colorName: "Dolce Biscotti",
    colorHex: "#B6A899", colorGroups: ["Brown/Beige/Cafe/Tan"],
    imageFilename: "/images/Tablecloths and Overlays/dolcetaupespeciality.jpg",
    keywords: "sheer, wedding, overlay, upscale, designer, damask", sizeNames: ["Runners"],
  });
  await createProduct({
    categoryName: "Table Runners", fabricName: "Specialty",
    name: "Dolce Vanilla", colorName: "Dolce Vanilla",
    colorHex: "#B6A899", colorGroups: ["Ivory"],
    imageFilename: "/images/Tablecloths and Overlays/dolcewhitespeciality.jpg",
    keywords: "sheer, wedding, overlay, upscale, designer, damask", sizeNames: ["Runners"],
  });

  await createProduct({
    categoryName: "Table Runners", fabricName: "Specialty",
    name: "Eleanor", colorName: "Eleanor",
    colorHex: "#B6A899", colorGroups: ["Ivory"],
    imageFilename: "/images/Tablecloths and Overlays/eleanorspeciality.jpg",
    keywords: "bone, ivory, off white, wedding, gatsby, beige, winter, gala, formal, traditional", sizeNames: ["Runners"],
  });
  await createProduct({
    categoryName: "Cuffs", fabricName: "Specialty",
    name: "Eleanor", colorName: "Eleanor",
    colorHex: "#B6A899", colorGroups: ["Ivory"],
    imageFilename: "/images/Tablecloths and Overlays/eleanorspeciality.jpg",
    keywords: "bone, ivory, off white, wedding, gatsby, beige, winter, gala, formal, traditional", sizeNames: ["Cuffs"],
  });

  await createProduct({
    categoryName: "Table Runners", fabricName: "Specialty",
    name: "Woodland", colorName: "Woodland",
    colorHex: "#B6A899", colorGroups: ["Brown/Beige/Cafe/Tan"],
    imageFilename: "/images/Tablecloths and Overlays/Woodlands.jpg",
    keywords: "White, Silver, grey, gray, natural, nature, holiday, winter, fall, thanksgiving, gala", sizeNames: ["Runners"],
  });

  await createProduct({
    categoryName: "Napkins", fabricName: "Specialty",
    name: "Regency", colorName: "Regency",
    colorHex: "#B6A899", colorGroups: ["Brown/Beige/Cafe/Tan"],
    imageFilename: "/images/Tablecloths and Overlays/laguna.jpg",
    keywords: "Silver, Charcoal, damask, holiday, neutral, gray, ornamental, winter", sizeNames: ["Napkins"],
  });

  await createProduct({
    categoryName: "Cuffs", fabricName: "Specialty",
    name: "Tie Dye", colorName: "Tie Dye",
    colorHex: "#B6A899", colorGroups: ["Multicolor"],
    imageFilename: "/images/Napkins/SpecialtyTyeDye.jpg",
    keywords: "", sizeNames: ["Cuffs"],
  });

  await createProduct({
    categoryName: "Napkins", fabricName: "Specialty",
    name: "Halas Navy", colorName: "Halas Navy",
    colorHex: "#B6A899", colorGroups: ["Blue"],
    imageFilename: "/images/Tablecloths and Overlays/halasnavy.jpg",
    keywords: "60's, 70's, father's, Blue, retro, geometric, football, theme, modern, Patriotic, USA, 4th, America, Independence", sizeNames: ["Napkins"],
  });
  await createProduct({
    categoryName: "Cuffs", fabricName: "Specialty",
    name: "Halas Navy", colorName: "Halas Navy",
    colorHex: "#B6A899", colorGroups: ["Blue"],
    imageFilename: "/images/Tablecloths and Overlays/halasnavy.jpg",
    keywords: "60's, 70's, father's, Blue, retro, geometric, football, theme, modern, Patriotic, USA, 4th, America, Independence", sizeNames: ["Cuffs"],
  });
  await createProduct({
    categoryName: "Napkins", fabricName: "Specialty",
    name: "Halas Tangerine", colorName: "Halas Tangerine",
    colorHex: "#B6A899", colorGroups: ["Orange"],
    imageFilename: "/images/Tablecloths and Overlays/halastangerine.jpg",
    keywords: "Orange, retro, geometric, football, theme, modern, father's, 60's, 70's, halloween, fall, thanksgiving", sizeNames: ["Napkins"],
  });
  await createProduct({
    categoryName: "Cuffs", fabricName: "Specialty",
    name: "Halas Tangerine", colorName: "Halas Tangerine",
    colorHex: "#B6A899", colorGroups: ["Orange"],
    imageFilename: "/images/Tablecloths and Overlays/halastangerine.jpg",
    keywords: "Orange, retro, geometric, football, theme, modern, father's, 60's, 70's, halloween, fall, thanksgiving", sizeNames: ["Cuffs"],
  });

  await createProduct({
    categoryName: "Tablecloths and Overlays", fabricName: "Specialty",
    name: "Bauhaus", colorName: "Bauhaus",
    colorHex: "#B6A899", colorGroups: ["Brown/Beige/Cafe/Tan"],
    imageFilename: "/images/Napkins/Napkin-Bauhaus2.jpg",
    keywords: "americana, 4th, patriotic, quilt, gingham", sizeNames: FULL_SIZES,
  });

  await createProduct({
    categoryName: "Napkins", fabricName: "Specialty",
    name: "Patchwork", colorName: "Patchwork",
    colorHex: "#B6A899", colorGroups: ["Brown/Beige/Cafe/Tan"],
    imageFilename: "/images/Tablecloths and Overlays/patchwork.jpg",
    keywords: "plaid, america, patriotic, july, memorial, labor, american, USA, 4th, Independence", sizeNames: ["Napkins"],
  });
  await createProduct({
    categoryName: "Table Runners", fabricName: "Specialty",
    name: "Patchwork", colorName: "Patchwork",
    colorHex: "#B6A899", colorGroups: ["Brown/Beige/Cafe/Tan"],
    imageFilename: "/images/Tablecloths and Overlays/patchwork.jpg",
    keywords: "plaid, america, patriotic, july, memorial, labor, american, USA, 4th, Independence", sizeNames: ["Runners"],
  });
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
