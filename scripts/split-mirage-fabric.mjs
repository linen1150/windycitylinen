// One-off: Mirage was a colorName pattern under fabric=Specialty, but Rob's price
// guide treats it as its own Essentials-tier fabric (like Bengaline, Bichon Crush,
// Serenity) — give it a real Fabric row and move its products over. Idempotent:
// safe to re-run. Note this only guards against recreating the Fabric row — the
// product reassignment always re-runs, since a later `db:seed` regenerates
// products from data/catalog-raw.json (which doesn't know about this split) and
// silently resets them back to Specialty without touching the Fabric row itself.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function run() {
  const specialty = await prisma.fabric.findUniqueOrThrow({ where: { name: "Specialty" } });
  let mirage = await prisma.fabric.findUnique({ where: { name: "Mirage" } });
  if (!mirage) {
    mirage = await prisma.fabric.create({ data: { name: "Mirage", slug: "mirage" } });
    console.log("Created Mirage fabric.");
  }

  const result = await prisma.product.updateMany({
    where: { fabricId: specialty.id, colorName: { startsWith: "Mirage" } },
    data: { fabricId: mirage.id },
  });
  console.log(`Moved ${result.count} products from Specialty to Mirage.`);

  await prisma.$disconnect();
}

run();
