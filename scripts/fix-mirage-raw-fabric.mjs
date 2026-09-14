// One-off: data/catalog-raw.json still lists every "Mirage ___" product under
// fabric="Specialty" — the split-mirage-fabric.mjs DB patch only ever touched
// the database, never the raw source data, so every `npm run db:build-catalog
// && npm run db:seed` regenerates catalog.json from this file and silently
// resets all 23 Mirage products back to Specialty (confirmed happening again
// today, 2026-09-14, right after re-fixing it in the database). This is the
// actual fix — update the source of truth so the reseed stops undoing it.
//
// Run once, then `npm run db:build-catalog && npm run db:seed`.
import { readFileSync, writeFileSync } from "node:fs";

const path = "data/catalog-raw.json";
const raw = JSON.parse(readFileSync(path, "utf8").replace(/^﻿/, ""));

let changed = 0;
for (const item of raw) {
  if (item.fabric === "Specialty" && /^Mirage /.test(item.name)) {
    item.fabric = "Mirage";
    changed++;
  }
}

writeFileSync(path, JSON.stringify(raw));
console.log(`Updated ${changed} items from Specialty to Mirage in ${path}.`);
