// One-off: add the genuinely-new Specialty patterns/colors found in Rob's price
// guide that aren't in the catalog at all. Most of the ~38 "missing" items from
// the reconciliation report turned out to be existing products under a different
// spelling (see fix-specialty-typos.mjs) — this covers only the ones confirmed to
// have no existing match after a manual per-item check (see this session's
// transcript): Chiffon (4 new colors), Sparkle Sheer Turquoise, Sandstone, Wave.
//
// No product photos exist for these yet — they'll render with the site's woven
// gradient placeholder (see ProductImage) until real photos are added via the
// admin's image upload.
//
// Run: node scripts/add-missing-specialty-items.mjs         (dry run)
//      node scripts/add-missing-specialty-items.mjs --apply   (writes the changes)
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function slugify(input) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/["'’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Each entry: colorName, colorGroup (matches an existing catalog color-family
// filter, null if genuinely unknown), colorHex (rough estimate, null if unknown),
// and the categories/sizes it's offered in per the price guide's "Specialty
// Price" tab (Tablecloth sizes are real dimensions; Napkins/Runners/Cuffs use
// the single matching Size row, same convention as the rest of the catalog).
const NEW_ITEMS = [
  {
    colorName: "Chiffon Gold",
    colorGroup: "Gold",
    colorHex: "#C9A227",
    categories: {
      "Tablecloths and Overlays": ['120" Round', '132" Round', '90"x156" Banquet'],
      "Table Runners": ["Runners"],
    },
  },
  {
    colorName: "Chiffon Ivory",
    colorGroup: "Ivory",
    colorHex: "#F1EEE3",
    categories: {
      "Tablecloths and Overlays": ['120" Round', '132" Round', '90"x156" Banquet'],
      "Table Runners": ["Runners"],
    },
  },
  {
    colorName: "Chiffon Light Pink",
    colorGroup: "Pink/Blush",
    colorHex: "#D9AFAE",
    categories: {
      "Tablecloths and Overlays": ['120" Round', '132" Round', '90"x156" Banquet'],
      "Table Runners": ["Runners"],
    },
  },
  {
    colorName: "Chiffon White",
    colorGroup: "White",
    colorHex: "#FAFAFA",
    categories: {
      "Tablecloths and Overlays": ['120" Round', '132" Round', '90"x156" Banquet'],
      "Table Runners": ["Runners"],
    },
  },
  {
    colorName: "Sparkle Sheer Turquoise",
    colorGroup: "Blue",
    colorHex: "#30D5C8",
    categories: {
      "Tablecloths and Overlays": ['90" Square'],
    },
  },
  {
    colorName: "Sandstone",
    colorGroup: "Brown/Beige/Cafe/Tan",
    colorHex: "#B6A08A",
    categories: {
      "Tablecloths and Overlays": ['108" Round', '120" Round', '132" Round', '90"x156" Banquet', '108"x156" Banquet'],
      "Napkins": ["Napkins"],
      "Table Runners": ["Runners"],
      "Cuffs": ["Cuffs"],
    },
  },
  {
    colorName: "Wave",
    colorGroup: null,
    colorHex: null,
    categories: {
      "Tablecloths and Overlays": ['90" Square'],
    },
  },
];

const DRY_RUN = !process.argv.includes("--apply");

async function run() {
  const fabric = await prisma.fabric.findUniqueOrThrow({ where: { name: "Specialty" } });
  const categories = await prisma.category.findMany();
  const categoryByName = new Map(categories.map((c) => [c.name, c]));
  const sizes = await prisma.size.findMany();
  const sizeIdByName = new Map(sizes.map((s) => [s.name, s.id]));

  for (const item of NEW_ITEMS) {
    for (const [categoryName, sizeNames] of Object.entries(item.categories)) {
      const category = categoryByName.get(categoryName);
      const existing = await prisma.product.findFirst({
        where: { colorName: item.colorName, categoryId: category.id },
      });
      if (existing) {
        console.log(`SKIP ${item.colorName} / ${categoryName} — already exists (${existing.slug})`);
        continue;
      }
      let slug = slugify(item.colorName);
      const slugCollision = await prisma.product.findFirst({ where: { slug } });
      if (slugCollision) slug = `${slug}-${categoryName.toLowerCase().replace(/[^a-z]+/g, "-")}`;

      const sizeIds = sizeNames.map((n) => sizeIdByName.get(n)).filter(Boolean);
      console.log(`CREATE ${item.colorName} / ${categoryName} (${slug}) sizes: ${sizeNames.join(", ")}`);

      if (!DRY_RUN) {
        await prisma.product.create({
          data: {
            name: item.colorName,
            slug,
            categoryId: category.id,
            fabricId: fabric.id,
            colorName: item.colorName,
            colorHex: item.colorHex,
            colorGroup: item.colorGroup,
            limited: false,
            reverseSide: false,
            imageFilename: null,
            keywords: "",
            published: true,
            sizes: { create: sizeIds.map((sizeId) => ({ sizeId })) },
          },
        });
      }
    }
  }

  if (DRY_RUN) console.log("\n(dry run — re-run with --apply to write these changes)");
  await prisma.$disconnect();
}

run();
