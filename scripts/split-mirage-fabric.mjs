// One-off: Mirage was a colorName pattern under fabric=Specialty, but Rob's price
// guide treats it as its own Essentials-tier fabric (like Bengaline, Bichon Crush,
// Serenity) — give it a real Fabric row and move its products over. Idempotent:
// safe to re-run (no-ops if the Mirage fabric already exists).
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function run() {
  const existing = await prisma.fabric.findUnique({ where: { name: "Mirage" } });
  if (existing) {
    console.log("Mirage fabric already exists — nothing to do.");
    await prisma.$disconnect();
    return;
  }

  const specialty = await prisma.fabric.findUniqueOrThrow({ where: { name: "Specialty" } });
  const mirage = await prisma.fabric.create({ data: { name: "Mirage", slug: "mirage" } });
  const result = await prisma.product.updateMany({
    where: { fabricId: specialty.id, colorName: { startsWith: "Mirage" } },
    data: { fabricId: mirage.id },
  });
  console.log(`Created Mirage fabric and moved ${result.count} products from Specialty.`);

  await prisma.$disconnect();
}

run();
