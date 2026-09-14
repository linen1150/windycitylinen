// Backfills Product.keywords and Product<->Collection assignments from the
// old site's export (tblInventoryGallery.xlsx — Desktop). This is the
// "product keywords, collection assignments" item HANDOFF.md flags as
// unstarted content population.
//
// The gallery table is one row per photo, keyed by filename (txtFilename),
// carrying free-text search tags (txtAttributes) and a "-"-joined set of
// style groupings (txtGalleryInspirations) that already matches this site's
// 8 Collections almost exactly (old "Print/Theme" -> new "Themed Prints").
// txtFilename matches Product.imageFilename directly (verified: 953/953
// tagged gallery rows matched a product by exact filename, case-insensitive,
// touching 982 of 1234 products — the rest have no legacy tag data).
//
// Some filenames appear in multiple gallery rows (the same photo used for a
// tablecloth + runner + napkin variant, etc.); where those rows disagree
// slightly (typos, one row missing a tag the other has), this unions every
// keyword/collection seen for that filename rather than picking a side —
// never loses a tag, only ever adds.
//
// Usage:
//   node scripts/import-legacy-keywords-collections.mjs            # dry run, prints a diff summary
//   node scripts/import-legacy-keywords-collections.mjs --apply    # writes to the DB the script is run against
import XLSX from "xlsx";
import { PrismaClient } from "@prisma/client";

const XLSX_PATH = "C:/Users/rob/Desktop/tblInventoryGallery.xlsx";
const APPLY = process.argv.includes("--apply");

const INSPIRATION_RENAME = {
  "Print/Theme": "Themed Prints",
};

const db = new PrismaClient();

function parseKeywords(raw) {
  return String(raw || "")
    .split(/\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseInspirations(raw) {
  return String(raw || "")
    .split("-")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => INSPIRATION_RENAME[s] || s);
}

function dedupeCaseInsensitive(tokens) {
  const seen = new Map(); // lowercase -> first-seen original casing
  for (const t of tokens) {
    const key = t.toLowerCase();
    if (!seen.has(key)) seen.set(key, t);
  }
  return [...seen.values()];
}

async function main() {
  const wb = XLSX.readFile(XLSX_PATH);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });

  const taggedRows = rows.filter(
    (r) => String(r.txtFilename).trim() !== "" && (String(r.txtAttributes).trim() !== "" || String(r.txtGalleryInspirations).trim() !== ""),
  );

  // Union everything seen per filename.
  const byFilename = new Map();
  for (const r of taggedRows) {
    const fn = String(r.txtFilename).toLowerCase().trim();
    if (!byFilename.has(fn)) byFilename.set(fn, { keywords: [], collections: [] });
    const entry = byFilename.get(fn);
    entry.keywords.push(...parseKeywords(r.txtAttributes));
    entry.collections.push(...parseInspirations(r.txtGalleryInspirations));
  }
  for (const entry of byFilename.values()) {
    entry.keywords = dedupeCaseInsensitive(entry.keywords);
    entry.collections = dedupeCaseInsensitive(entry.collections);
  }

  const [products, collections] = await Promise.all([
    db.product.findMany({
      select: { id: true, slug: true, imageFilename: true, keywords: true, collections: { select: { collection: { select: { name: true } } } } },
    }),
    db.collection.findMany({ select: { id: true, name: true } }),
  ]);
  const collectionIdByName = new Map(collections.map((c) => [c.name, c.id]));

  const productsByFilename = new Map();
  for (const p of products) {
    const key = (p.imageFilename || "").toLowerCase().trim();
    if (!key) continue;
    if (!productsByFilename.has(key)) productsByFilename.set(key, []);
    productsByFilename.get(key).push(p);
  }

  let unmatchedFilenames = 0;
  let unmappedCollectionNames = new Set();
  const plans = []; // { product, newKeywords, newCollectionNames }

  for (const [fn, entry] of byFilename.entries()) {
    const matches = productsByFilename.get(fn);
    if (!matches || matches.length === 0) {
      unmatchedFilenames++;
      continue;
    }
    for (const name of entry.collections) {
      if (!collectionIdByName.has(name)) unmappedCollectionNames.add(name);
    }
    for (const product of matches) {
      plans.push({
        product,
        newKeywords: entry.keywords.join(", "),
        newCollectionNames: entry.collections.filter((n) => collectionIdByName.has(n)),
      });
    }
  }

  const changedKeywordCount = plans.filter((p) => p.newKeywords !== (p.product.keywords || "")).length;
  const changedCollectionCount = plans.filter((p) => {
    const current = new Set(p.product.collections.map((c) => c.collection.name));
    const next = new Set(p.newCollectionNames);
    if (current.size !== next.size) return true;
    for (const n of current) if (!next.has(n)) return true;
    return false;
  }).length;

  console.log(`Gallery rows with tags: ${taggedRows.length}`);
  console.log(`Distinct tagged filenames: ${byFilename.size}`);
  console.log(`Unmatched filenames (no product): ${unmatchedFilenames}`);
  console.log(`Unmapped collection names (no matching Collection): ${[...unmappedCollectionNames].join(", ") || "(none)"}`);
  console.log(`Products touched: ${plans.length}`);
  console.log(`Products with a keywords change: ${changedKeywordCount}`);
  console.log(`Products with a collections change: ${changedCollectionCount}`);

  console.log("\nSample (first 8):");
  for (const p of plans.slice(0, 8)) {
    console.log(`- ${p.product.slug}`);
    console.log(`    keywords: "${p.product.keywords}" -> "${p.newKeywords}"`);
    console.log(`    collections: [${p.product.collections.map((c) => c.collection.name).join(", ")}] -> [${p.newCollectionNames.join(", ")}]`);
  }

  if (!APPLY) {
    console.log("\nDry run only — pass --apply to write these changes.");
    return;
  }

  console.log("\nApplying...");
  let written = 0;
  for (const p of plans) {
    await db.$transaction([
      db.product.update({ where: { id: p.product.id }, data: { keywords: p.newKeywords } }),
      db.productCollection.deleteMany({ where: { productId: p.product.id } }),
      ...p.newCollectionNames.map((name) =>
        db.productCollection.create({ data: { productId: p.product.id, collectionId: collectionIdByName.get(name) } }),
      ),
    ]);
    written++;
  }
  console.log(`Wrote ${written} products.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
