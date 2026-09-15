// One-off: naming fixes from Tera's punch list.
// - "Velvet Champagne Gold" -> "Velvet Gold" (all 4 items)
// - "Amalfi Saphire" -> "Amalfi Sapphire" (typo, matches the correctly
//   spelled Napkins/Tablecloths rows)
// - "Matrix Burnt Orange" -> "Burnt Orange Matrix" (word order, matches the
//   Cuffs row's naming)
// - Delete the leftover singular "Brushstroke" napkin — duplicate of the
//   correctly named "Brushstrokes" napkin created earlier this pass.
//
// Run:  node scripts/fix-tera-renames.mjs [--apply]

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const APPLY = process.argv.includes("--apply");

async function renameAll(where, newName) {
  const rows = await db.product.findMany({ where });
  for (const r of rows) {
    console.log(`${APPLY ? "RENAME" : "[dry run] would rename"}: "${r.name}" -> "${newName}" [${r.id}]`);
    if (APPLY) {
      await db.product.update({
        where: { id: r.id },
        data: { name: newName, colorName: newName },
      });
    }
  }
}

async function main() {
  await renameAll({ name: { contains: "Velvet Champagne Gold" } }, "Velvet Gold");
  await renameAll({ name: { contains: "Amalfi Saphire" } }, "Amalfi Sapphire");
  await renameAll({ name: "Matrix Burnt Orange" }, "Burnt Orange Matrix");

  const dupe = await db.product.findFirst({ where: { name: "Brushstroke" }, include: { category: true } });
  if (dupe) {
    console.log(`${APPLY ? "DELETE" : "[dry run] would delete"}: "Brushstroke" [${dupe.category.name}] id=${dupe.id} (duplicate of "Brushstrokes")`);
    if (APPLY) await db.product.delete({ where: { id: dupe.id } });
  } else {
    console.log('SKIP delete (not found): "Brushstroke"');
  }
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
