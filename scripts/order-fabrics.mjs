// One-off: set Fabric.order so Classic Solid sorts first everywhere (filters,
// catalog grid, admin dropdowns), then the rest alphabetically. Safe to re-run —
// always recomputes from scratch, so a newly added fabric gets slotted in
// alphabetically among the "rest" group automatically.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function run() {
  const fabrics = await prisma.fabric.findMany({ orderBy: { name: "asc" } });
  const classicSolid = fabrics.filter((f) => f.name === "Classic Solid");
  const rest = fabrics.filter((f) => f.name !== "Classic Solid");
  const ordered = [...classicSolid, ...rest];

  for (let i = 0; i < ordered.length; i++) {
    await prisma.fabric.update({ where: { id: ordered[i].id }, data: { order: i } });
    console.log(i, ordered[i].name);
  }
  await prisma.$disconnect();
}

run();
