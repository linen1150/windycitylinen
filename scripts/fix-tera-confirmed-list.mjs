// One-off: the "confirmed, safe" items from Tera's 2026-09-15 punch list —
// a duplicate cuff, missing reverse-side Shantung runners, a missing
// Raspberry Matte Lamour tablecloth, and two incomplete Hampton Dune prints.
// Each new row reuses a same-print/color sibling's real photo as a stand-in.
//
// Run:  node scripts/fix-tera-confirmed-list.mjs [--apply]
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

const DELETE_NAMES = [
  // Duplicate cuff — same item as "Peach Jute", which stays.
  { name: "Jute Peach", category: "Cuffs" },
];

const SHANTUNG_REVERSE_RUNNERS = [
  { name: "Shantung Silver Reverse", colorName: "Silver", colorHex: "#B9BDC1", colorGroups: ["Gray"], imageFilename: "/images/Napkins/ShantungSilverReversed.jpg", keywords: "Silver, Gray, hanukkah, holiday, grey, wedding, NYE, gala, winter" },
  { name: "Shantung Turquoise Reverse", colorName: "Turquoise", colorHex: "#2FB6B0", colorGroups: ["Blue"], imageFilename: "/images/Napkins/ShantungTurquoiseReversed.jpg", keywords: "ocean, pool, luau, hawaii, summer, green" },
  { name: "Shantung Slate Reverse", colorName: "Slate", colorHex: "#5B7A9D", colorGroups: ["Blue"], imageFilename: "/images/Napkins/NapkinsSlateShantungReverse2.jpg", keywords: "Slate, Blue" },
  { name: "Shantung Black Reverse", colorName: "Black", colorHex: "#20232A", colorGroups: ["Black"], imageFilename: "/images/Tablecloths and Overlays/shantungblack2.jpg", keywords: "halloween, masculine, gala, NYE, disco" },
  { name: "Shantung Wedgewood Reverse", colorName: "Wedgewood", colorHex: "#5B7EA0", colorGroups: ["Blue"], imageFilename: "/images/Napkins/ShantungWedgewoodReversed.jpg", keywords: "blue, coastal, light, federal, lobster, beach, pool, winter, shower, tea, taylor, mother's, easter" },
  { name: "Shantung Light Pink Reverse", colorName: "Light Pink", colorHex: "#E8B7C4", colorGroups: ["Pink/Blush"], imageFilename: "/images/Napkins/ShantungLightPinkReversed.jpg", keywords: "blush, wedding, shower, tea, bridgerton, easter, mother's, taylor" },
];

const RASPBERRY_LAMOUR_SIZES = ["90\" Square", "96\" Round", "108\" Round", "120\" Round", "132\" Square", "132\" Round", "90\"x132\" Banquet", "90\"x156\" Banquet", "108\"x156\" Banquet"];

const HAMPTON_ITEMS = [
  {
    printName: "Hampton Botanical Dune",
    colorName: "Hampton Botanical Dune",
    colorHex: "#B6A899",
    colorGroups: ["Brown/Beige/Cafe/Tan"],
    sourceImage: "/images/Tablecloths and Overlays/dunehamptonbotanical.jpg",
    keywords: "flora, monochromatic, garden, thanksgiving, preppy, coastal, wedding, shower, mothers, spring, fall, summer, luncheon, tea",
  },
  {
    printName: "Hampton Stripe Dune",
    colorName: "Hampton Stripe Dune",
    colorHex: "#B6A899",
    colorGroups: ["Multicolor"],
    sourceImage: "/images/Tablecloths and Overlays/dunehamptonstripe1.jpg",
    keywords: "flora, monochromatic, garden, thanksgiving, preppy, coastal, wedding, shower, mothers, spring, fall, summer, luncheon, tea",
  },
];

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
        name,
        slug,
        categoryId: category.id,
        fabricId: fabric.id,
        colorName,
        colorHex,
        colorGroups,
        keywords,
        imageFilename,
        limited: false,
        reverseSide: name.includes("Reverse"),
        published: true,
        sizes: { create: sizes.map((s) => ({ sizeId: s.id })) },
      },
    });
  }
}

async function main() {
  // 1. Delete the duplicate cuff.
  for (const d of DELETE_NAMES) {
    const category = await db.category.findFirst({ where: { name: d.category } });
    const row = await db.product.findFirst({ where: { name: d.name, categoryId: category.id } });
    if (!row) {
      console.log(`SKIP delete (not found): ${d.name} [${d.category}]`);
      continue;
    }
    console.log(`${APPLY ? "DELETE" : "[dry run] would delete"}: ${d.name} [${d.category}] id=${row.id}`);
    if (APPLY) await db.product.delete({ where: { id: row.id } });
  }

  // 2. Fix Raspberry Matte Lamour's colorGroups on its existing siblings (it's
  // a red/magenta berry color, not brown — same class of fix as Classic Solid
  // Raspberry and Jute Lipstick earlier this project).
  const raspberrySiblings = await db.product.findMany({ where: { name: "Raspberry Matte Lamour" } });
  for (const r of raspberrySiblings) {
    if (JSON.stringify(r.colorGroups) === JSON.stringify(["Red"])) continue;
    console.log(`${APPLY ? "UPDATE" : "[dry run] would update"}: Raspberry Matte Lamour colorGroups -> ["Red"] (was ${JSON.stringify(r.colorGroups)})`);
    if (APPLY) await db.product.update({ where: { id: r.id }, data: { colorGroups: ["Red"] } });
  }

  // 3. Create the 6 missing Shantung reverse-side table runners.
  for (const item of SHANTUNG_REVERSE_RUNNERS) {
    await createProduct({
      categoryName: "Table Runners",
      fabricName: "Shantung",
      name: item.name,
      colorName: item.colorName,
      colorHex: item.colorHex,
      colorGroups: item.colorGroups,
      imageFilename: item.imageFilename,
      keywords: item.keywords,
      sizeNames: ["Runners"],
    });
  }

  // 4. Create the missing Raspberry Matte Lamour tablecloth.
  await createProduct({
    categoryName: "Tablecloths and Overlays",
    fabricName: "Matte Lamour",
    name: "Raspberry Matte Lamour",
    colorName: "Raspberry Matte Lamour",
    colorHex: "#B6A899",
    colorGroups: ["Red"],
    imageFilename: "/images/Table Runners/Runner-RaspberryLamour.jpg",
    keywords: "",
    sizeNames: RASPBERRY_LAMOUR_SIZES,
  });

  // 5. Create the missing Hampton Botanical Dune / Hampton Stripe Dune
  // Napkin, Table Runner, and Cuff variants.
  for (const h of HAMPTON_ITEMS) {
    for (const categoryName of ["Napkins", "Table Runners", "Cuffs"]) {
      await createProduct({
        categoryName,
        fabricName: "Specialty",
        name: h.printName,
        colorName: h.colorName,
        colorHex: h.colorHex,
        colorGroups: h.colorGroups,
        imageFilename: h.sourceImage,
        keywords: h.keywords,
        sizeNames: [categoryName === "Napkins" ? "Napkins" : categoryName === "Table Runners" ? "Runners" : "Cuffs"],
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
