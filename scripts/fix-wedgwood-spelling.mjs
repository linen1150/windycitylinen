// One-off: "Wedgewood" -> "Wedgwood" (the real spelling) in product name and
// colorName. Slugs are left alone (already-shared/bookmarked URLs, and slugs
// aren't customer-visible spelling).
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const rows = await db.product.findMany({
  where: { OR: [{ name: { contains: "Wedgewood" } }, { colorName: { contains: "Wedgewood" } }] },
});

let n = 0;
for (const r of rows) {
  await db.product.update({
    where: { id: r.id },
    data: {
      name: r.name.replace(/Wedgewood/g, "Wedgwood"),
      colorName: r.colorName.replace(/Wedgewood/g, "Wedgwood"),
    },
  });
  n++;
}
console.log(`Fixed spelling on ${n} products.`);
await db.$disconnect();
