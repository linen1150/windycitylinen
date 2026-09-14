// One-off: public/gallery/ has 34 files that are byte-identical duplicates of
// another file (same photo saved/uploaded twice under a different filename),
// found via SHA-256 hashing every file and grouping by hash. 29 of those
// groups have either matching captions or one real caption + empty ones — for
// those, safe to auto-resolve: keep the row with a caption (earliest order on
// ties), delete the rest. 3 groups have genuinely conflicting non-empty
// captions on the same photo (e.g. "Halas Navy" vs "Mirage Tide" on a photo
// that's visibly a navy geometric print, not the neutral solid Mirage is) —
// those need a human call and are only reported here, never auto-deleted.
//
// Usage:
//   node scripts/dedupe-gallery.mjs            # dry run, prints the plan
//   node scripts/dedupe-gallery.mjs --apply    # deletes the resolved duplicate rows
import { readdirSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { PrismaClient } from "@prisma/client";

const APPLY = process.argv.includes("--apply");
const db = new PrismaClient();

async function main() {
  const dir = "public/gallery";
  const files = readdirSync(dir);
  const byHash = new Map();
  for (const f of files) {
    const buf = readFileSync(`${dir}/${f}`);
    const hash = createHash("sha256").update(buf).digest("hex");
    if (!byHash.has(hash)) byHash.set(hash, []);
    byHash.get(hash).push(f);
  }
  const dupeGroups = [...byHash.values()].filter((v) => v.length > 1);

  const allPaths = dupeGroups.flat().map((f) => `/gallery/${f}`);
  const rows = await db.galleryItem.findMany({
    where: { imagePath: { in: allPaths } },
    select: { id: true, imagePath: true, caption: true, order: true },
  });
  const byPath = new Map(rows.map((r) => [r.imagePath, r]));

  const toDelete = [];
  const conflicts = [];
  for (const group of dupeGroups) {
    const items = group.map((f) => byPath.get(`/gallery/${f}`)).filter(Boolean);
    if (items.length < 2) continue;
    const nonEmptyCaptions = new Set(items.filter((i) => i.caption.trim()).map((i) => i.caption.trim().toLowerCase()));
    if (nonEmptyCaptions.size > 1) {
      conflicts.push(items);
      continue;
    }
    const withCaption = items.filter((i) => i.caption.trim());
    const keep = (withCaption.length ? withCaption : items).sort((a, b) => a.order - b.order)[0];
    for (const i of items) if (i.id !== keep.id) toDelete.push(i);
  }

  console.log(`Duplicate photo groups: ${dupeGroups.length}`);
  console.log(`Rows to delete (clear-cut dupes): ${toDelete.length}`);
  console.log(`Conflicting groups (skipped, need a human call): ${conflicts.length}`);
  console.log("\nConflicts:");
  for (const items of conflicts) {
    console.log(items.map((i) => `  "${i.caption || "(empty)"}" — order ${i.order} — ${i.imagePath}`).join("\n") + "\n");
  }

  if (!APPLY) {
    console.log("Dry run only — pass --apply to delete the clear-cut duplicate rows.");
    return;
  }

  const res = await db.galleryItem.deleteMany({ where: { id: { in: toDelete.map((i) => i.id) } } });
  console.log(`Deleted ${res.count} duplicate rows.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
