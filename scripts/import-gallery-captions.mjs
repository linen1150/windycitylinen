// One-off: apply the High-confidence gallery→product name matches from
// gallery_product_matches.xlsx (produced by a separate Claude session that
// text-matched each /gallery photo filename against the catalog) as the
// caption on each matching GalleryItem, so the Gallery page's hover
// watermark shows the real linen name.
//
// Only "High" confidence rows are applied — see the workbook's "Read Me"
// sheet: Medium/Low/None need a human to actually look at the photo first.
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";

const prisma = new PrismaClient();
const inputFile = process.argv[2] ?? "scripts/_gallery-caption-matches.json";
const matches = JSON.parse(readFileSync(inputFile, "utf8"));

let updated = 0;
let notFoundPhoto = [];
let notFoundProduct = [];

for (const m of matches) {
  const imagePath = `/gallery/${m.Photo}`;
  const item = await prisma.galleryItem.findFirst({ where: { imagePath } });
  if (!item) {
    notFoundPhoto.push(m.Photo);
    continue;
  }

  let bestMatch = m["Best Match"];
  let product = await prisma.product.findFirst({ where: { name: { equals: bestMatch, mode: "insensitive" } } });
  if (!product) {
    // The workbook strips the parenthetical suffix real "(Limited)" products carry.
    const withParens = bestMatch.replace(/\s+Limited$/i, " (Limited)");
    product = await prisma.product.findFirst({ where: { name: { equals: withParens, mode: "insensitive" } } });
    if (product) bestMatch = product.name;
  }
  if (!product) {
    notFoundProduct.push(bestMatch);
    continue;
  }

  await prisma.galleryItem.update({ where: { id: item.id }, data: { caption: product.name } });
  updated++;
}

console.log(`Updated ${updated} gallery captions.`);
if (notFoundPhoto.length) console.log("Photos not found in galleryItem:", notFoundPhoto);
if (notFoundProduct.length) console.log("Products not found:", notFoundProduct);
await prisma.$disconnect();
