import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";

const prisma = new PrismaClient();
const manifest = JSON.parse(readFileSync("scripts/_gallery-manifest.json", "utf8"));

const existing = await prisma.galleryItem.count();
if (existing > 0) {
  console.log(`galleryItem already has ${existing} rows — skipping (delete them first to re-seed).`);
  await prisma.$disconnect();
  process.exit(0);
}

await prisma.galleryItem.createMany({
  data: manifest.map((m, i) => ({
    order: i,
    imagePath: m.imagePath,
    caption: m.caption ?? "",
    published: true,
  })),
});

console.log(`Created ${manifest.length} gallery items.`);
await prisma.$disconnect();
