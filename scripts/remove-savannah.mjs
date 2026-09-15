// One-off: remove the Savannah products entirely, per Tera's note — "The
// Savannah's should come off, be out of the books, they are so bad" — and
// Rob's direct confirmation to remove them.
//
// Run:  node scripts/remove-savannah.mjs [--apply]

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const APPLY = process.argv.includes("--apply");

async function main() {
  const rows = await db.product.findMany({ where: { name: { contains: "Savannah" } }, include: { category: true } });
  for (const r of rows) console.log(`${APPLY ? "DELETE" : "[dry run] would delete"}: "${r.name}" [${r.category.name}] id=${r.id}`);
  if (APPLY) {
    const result = await db.product.deleteMany({ where: { name: { contains: "Savannah" } } });
    console.log("deleted:", result.count);
  }
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
