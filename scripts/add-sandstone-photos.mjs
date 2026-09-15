// One-off: Sandstone had no photo in any category. Pulled real photos from
// Dropbox (Tablecloth: WCL Sales Team Folder/WCL 04.21.2026/WCL 04.21.2026/
// sandstone.jpg; Napkin/Runner/Cuff: .../Northshore photos 5-4-26/
// northshorephotography_edited_2026-05-01_1648/edited/*_sandstone_r.jpg) and
// placed them at public/images/<Category>/sandstone.jpg (+.webp).
//
// Run:  node scripts/add-sandstone-photos.mjs [--apply]

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const CATEGORIES = ["Tablecloths and Overlays", "Napkins", "Table Runners", "Cuffs"];

async function main() {
  for (const cat of CATEGORIES) {
    const category = await db.category.findFirst({ where: { name: cat } });
    const rows = await db.product.findMany({ where: { name: "Sandstone", categoryId: category.id } });
    for (const r of rows) {
      console.log(`${APPLY ? "UPDATE" : "[dry run] would update"}: Sandstone [${cat}] imageFilename -> sandstone.jpg (was ${r.imageFilename})`);
      if (APPLY) await db.product.update({ where: { id: r.id }, data: { imageFilename: "sandstone.jpg" } });
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
