// One-off: second batch of corrections from "Website Corrections.pdf" (2026-09).
// Handles everything build-catalog.mjs's overrides can't reach:
//   A. Pre-reseed cleanup — delete rows that are being excluded/deduped so
//      they don't linger as stale data until the next full reseed.
//   B. Post-reseed stragglers — products created by earlier one-off scripts
//      (never in catalog-raw.json, so they never flow through
//      colorGroupsFor()) that need the same color-group fix applied
//      directly. Identified by the absolute-path imageFilename convention
//      those scripts use ("/images/...") — confirmed empirically against
//      every name in this pass before writing this script.
//   C. Candace: rename to "Candace (Limited)", recolor, mark limited.
//
// Run AFTER `node scripts/build-catalog.mjs && npx prisma db seed`.
// Run:  node scripts/fix-corrections-2.mjs [--apply]

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const APPLY = process.argv.includes("--apply");

// Mirrors COLOR_GROUP_NAME_OVERRIDES in build-catalog.mjs for this pass, plus
// the rule-level Teal (blue -> green) fix for the one straggler it can't reach.
const EXPECTED_COLOR_GROUPS = {
  "Jute Dove": ["Gray"],
  "Mirage Vanilla": ["White"],
  "Dolce Vanilla": ["White"],
  "Soiree Champagne": ["Gold"],
  "Mirage Cloud": ["Gray"],
  "Serenity Driftwood": ["Ivory"],
  "Abstract Geometric": ["Multicolor", "Black"],
  Bauhaus: ["Multicolor"],
  Cairns: ["Orange"],
  "Cairns Reverse": ["Orange"],
  "Echo Lumiere": ["Gray"],
  "Echo Lumiere Reverse": ["Gray"],
  "Hampton Botanical Apple": ["Green"],
  "Helena Apple": ["Green"],
  "Helena Apple Reverse": ["Green"],
  Hex: ["Gray"],
  Holly: ["Multicolor"],
  "Josephine Lace": ["Pink/Blush"],
  "Key West": ["Multicolor"],
  "Kiwi Palazzo": ["Green"],
  Kringle: ["Red"],
  Laguna: ["Multicolor", "Green"],
  Lorelei: ["Multicolor"],
  Lucia: ["Multicolor", "Yellow"],
  Meteorite: ["Gray"],
  "Metropolitan Concrete": ["Gray"],
  "Midas Travertine": ["Gold"],
  "Midas Travertine Reverse": ["Gold"],
  Nadia: ["Purple/Burgundy"],
  Nantucket: ["Blue"],
  "Pamela Palm": ["Green"],
  "Pamela Palms": ["Green"],
  Patchwork: ["Multicolor"],
  Phoebe: ["Multicolor", "Blue"],
  Phoenix: ["Red"],
  Regency: ["Gray"],
  "Retro Vintage": ["Multicolor"],
  Romeo: ["Multicolor"],
  Santorini: ["Blue"],
  "Santorini Reverse": ["Blue"],
  Silhouette: ["Black"],
  "Sparkle Sheer Royal": ["Blue"],
  Spiro: ["Black", "White"],
  "Velvet Loden": ["Green"],
  "Velvet Spice": ["Orange"],
  "Verve Pearl": ["White"],
  Waterlily: ["Multicolor", "Pink/Blush"],
  Woodland: ["Gray"],
  "Woodland Reverse": ["White"],
  "Woodland Reversed": ["White"],
  "Wren Coastal": ["Blue"],
  Zebra: ["Black", "White"],
  "Jute Lipstick": ["Pink/Blush"],
  "Imperial Stripe Black (Limited)": ["Black"],
  "Imperial Stripe Burgundy (Limited)": ["Purple/Burgundy", "Red"],
  "Imperial Stripe Forest Green (Limited)": ["Green"],
  "Imperial Stripe Ivory (Limited)": ["Ivory"],
  "Imperial Stripe Navy (Limited)": ["Blue"],
  "Imperial Stripe Red (Limited)": ["Red"],
  "Imperial Stripe White (Limited)": ["White"],
  "Hampton Stripe Dune": ["Multicolor", "Brown/Beige/Cafe/Tan"],
  "Hampton Stripe Coastal": ["Multicolor", "Blue"],
  "Hampton Stripe Apple": ["Multicolor", "Green"],
  "Apple Cabana Stripe": ["Multicolor", "Green"],
  "Apple Gingham Mini Check": ["Multicolor", "Green"],
  "Willow Gingham Mini Check": ["Multicolor", "Green"],
  "Matte Lamour Raspberry": ["Red"],
  "Classic Solid Teal": ["Green"],
  "Matte Lamour Teal": ["Green"],
  "Shantung Teal": ["Green"],
  "Shantung Teal Reverse": ["Green"],
  "Shantung Teal Reversed": ["Green"],
};

async function main() {
  console.log("--- A. deletes ---");

  const mirageSandstone = await db.product.findMany({ where: { name: "Mirage Sandstone" }, include: { category: true } });
  for (const r of mirageSandstone) {
    console.log(`${APPLY ? "DELETE" : "[dry run] would delete"}: Mirage Sandstone [${r.category.name}] id=${r.id} (does not exist per Tera)`);
    if (APPLY) await db.product.delete({ where: { id: r.id } });
  }

  const picnicCheckRaspberry = await db.product.findFirst({ where: { name: "Picnic Check Raspberry" }, include: { category: true } });
  if (picnicCheckRaspberry) {
    console.log(`${APPLY ? "DELETE" : "[dry run] would delete"}: Picnic Check Raspberry [${picnicCheckRaspberry.category.name}] id=${picnicCheckRaspberry.id} (dupe of Raspberry Picnic Check)`);
    if (APPLY) await db.product.delete({ where: { id: picnicCheckRaspberry.id } });
  } else {
    console.log("SKIP delete (not found): Picnic Check Raspberry");
  }

  const dupeRaspberryLamour = await db.product.findFirst({
    where: { name: "Raspberry Matte Lamour", category: { name: "Tablecloths and Overlays" } },
    include: { category: true },
  });
  if (dupeRaspberryLamour && /Runner-RaspberryLamour/i.test(dupeRaspberryLamour.imageFilename || "")) {
    console.log(`${APPLY ? "DELETE" : "[dry run] would delete"}: Raspberry Matte Lamour [Tablecloths] id=${dupeRaspberryLamour.id} (dupe of the real "Matte Lamour Raspberry" tablecloth)`);
    if (APPLY) await db.product.delete({ where: { id: dupeRaspberryLamour.id } });
  } else if (dupeRaspberryLamour) {
    console.log(`SKIP delete (image doesn't match expected stand-in, check by hand): ${dupeRaspberryLamour.id} img=${dupeRaspberryLamour.imageFilename}`);
  } else {
    console.log("SKIP delete (not found, maybe already renamed by reseed): Raspberry Matte Lamour [Tablecloths]");
  }

  console.log("\n--- B. color-group stragglers (script-created rows, imageFilename starts with /images/) ---");
  for (const [name, expected] of Object.entries(EXPECTED_COLOR_GROUPS)) {
    const rows = await db.product.findMany({ where: { name }, include: { category: true } });
    for (const r of rows) {
      const isStraggler = (r.imageFilename || "").startsWith("/images/");
      if (!isStraggler) continue;
      const matches = JSON.stringify(r.colorGroups) === JSON.stringify(expected);
      if (matches) continue;
      console.log(`${APPLY ? "UPDATE" : "[dry run] would update"}: ${name} [${r.category.name}] id=${r.id} colorGroups -> ${JSON.stringify(expected)} (was ${JSON.stringify(r.colorGroups)})`);
      if (APPLY) await db.product.update({ where: { id: r.id }, data: { colorGroups: expected } });
    }
  }

  console.log("\n--- C. Candace ---");
  const candace = await db.product.findFirst({ where: { name: "Candace" }, include: { category: true } });
  if (candace) {
    console.log(`${APPLY ? "UPDATE" : "[dry run] would update"}: Candace -> "Candace (Limited)", colorGroups -> ["Blue"], limited -> true`);
    if (APPLY) {
      await db.product.update({
        where: { id: candace.id },
        data: { name: "Candace (Limited)", colorName: "Candace (Limited)", colorGroups: ["Blue"], limited: true },
      });
    }
  } else {
    console.log("SKIP (not found, maybe already renamed): Candace");
  }
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
