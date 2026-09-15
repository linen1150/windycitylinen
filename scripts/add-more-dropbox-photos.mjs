// One-off: real photos pulled from Rob's Dropbox for products that had none
// on file. Sources:
//   - Wave: WCL Sales Team Folder/WEBSITE cropped pics 5.23.24/ALL/Wave ivory.jpg
//   - Sky Sedona: .../creativeedgechicago_..._2025-08-07_2233/windy city
//     linen 900 x 900 pixels/specialty/specialty 900 x 900 pixels/sedona sky.jpg
//   - Candace: same folder, specialty candace.jpg
//   - Neon Tangerine/Orange/Pink/Yellow: rob spiro/Standard Polyester/
//     Standard Polyester - Neon <Color> <#>.jpg (the supplier's own swatch
//     shoot). Neon Green was searched for across all of Dropbox and doesn't
//     exist anywhere — still has no photo.
//   - Sparkle Sheer Turquoise and the 4 Chiffon colors: searched, nothing
//     usable found (Chiffon only turned up an event photo, not a clean
//     product shot) — still have no photo.
//
// Run:  node scripts/add-more-dropbox-photos.mjs [--apply]

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const UPDATES = [
  { name: "Wave", imageFilename: "wave.jpg" },
  { name: "Sky Sedona", imageFilename: "sky-sedona.jpg" },
  { name: "Candace", imageFilename: "candace.jpg" },
  { name: "Classic Solid Neon Tangerine", imageFilename: "neon-tangerine.jpg" },
  { name: "Classic Solid Neon Orange", imageFilename: "neon-orange.jpg" },
  { name: "Classic Solid Neon Pink", imageFilename: "neon-pink.jpg" },
  { name: "Classic Solid Neon Yellow", imageFilename: "neon-yellow.jpg" },
];

async function main() {
  const category = await db.category.findFirst({ where: { name: "Tablecloths and Overlays" } });
  for (const u of UPDATES) {
    const row = await db.product.findFirst({ where: { name: u.name, categoryId: category.id } });
    if (!row) {
      console.log(`SKIP (not found): ${u.name}`);
      continue;
    }
    console.log(`${APPLY ? "UPDATE" : "[dry run] would update"}: ${u.name} imageFilename -> ${u.imageFilename} (was ${row.imageFilename})`);
    if (APPLY) await db.product.update({ where: { id: row.id }, data: { imageFilename: u.imageFilename } });
  }
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
