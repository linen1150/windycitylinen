// One-off: Classic Solid table runners for Caribbean Blue, Coral and Maize
// were named just the bare color ("Caribbean", "Coral", "Maize") instead of
// matching their tablecloth/napkin siblings' "Classic Solid <Color>"
// convention. Dusty Rose and Forest Green runners were each listed twice —
// same product, two different photos from the same shoot, confirmed by eye —
// keeping the correctly-named one and dropping the duplicate.
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const renames = [
  { match: { colorName: "Caribbean", category: { name: "Table Runners" } }, name: "Classic Solid Caribbean Blue", colorName: "Caribbean Blue" },
  { match: { colorName: "Coral", category: { name: "Table Runners" }, fabric: { name: "Classic Solid" } }, name: "Classic Solid Coral", colorName: "Coral" },
  { match: { colorName: "Maize", category: { name: "Table Runners" } }, name: "Classic Solid Maize", colorName: "Maize" },
];

for (const r of renames) {
  const res = await db.product.updateMany({ where: r.match, data: { name: r.name, colorName: r.colorName } });
  console.log(`Renamed ${res.count} -> "${r.name}"`);
}

const dupeIds = [
  "cmtu7tw8z018m7erk49r0uw6e", // "Dusty Rose" runner, dup of "Classic Solid Dusty Rose"
  "cmtu7tw91018o7erkfikajpns", // "Forest Green" runner, dup of "Classic Solid Forest Green"
];
const del = await db.product.deleteMany({ where: { id: { in: dupeIds } } });
console.log(`Deleted ${del.count} duplicate runners.`);

await db.$disconnect();
