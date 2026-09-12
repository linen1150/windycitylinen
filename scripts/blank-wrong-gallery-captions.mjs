// One-off: after visually reviewing every Medium/Low-confidence gallery
// caption match (scripts/_review-sheets/*.jpg, generated from
// _gallery-caption-matches-medlow.json), clear the caption on photos where
// the photo clearly does not show the named product — wrong color, wrong
// pattern, or no linen visible at all. Row "#" numbers below are the row
// numbers from that same JSON file.
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";

const prisma = new PrismaClient();
const rows = JSON.parse(readFileSync("scripts/_gallery-caption-matches-medlow.json", "utf8"));
const decisions = JSON.parse(readFileSync("scripts/_review-decisions.json", "utf8"));
const blankNumbers = new Set(decisions.blank);

let cleared = 0;
let notFound = [];

for (const row of rows) {
  if (!blankNumbers.has(row["#"])) continue;
  const imagePath = `/gallery/${row.Photo}`;
  const item = await prisma.galleryItem.findFirst({ where: { imagePath } });
  if (!item) {
    notFound.push(row.Photo);
    continue;
  }
  await prisma.galleryItem.update({ where: { id: item.id }, data: { caption: "" } });
  cleared++;
}

console.log(`Cleared ${cleared} wrong gallery captions (of ${blankNumbers.size} flagged).`);
if (notFound.length) console.log("Photos not found:", notFound);
await prisma.$disconnect();
