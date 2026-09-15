// Builds data/backend-items.json — a lookup table of Windy City Linen's real
// backend inventory item codes, used server-side to ground the document-quote
// feature's Claude extraction (so a client's uploaded order gets matched to
// an actual item number staff can key into the backend, not a made-up one).
//
// Source: an "Item Export" from the backend rental system (columns: Item
// Number, Description, Category, Size, Color, Qty, Unit Price, ...). Pricing
// columns are intentionally dropped here — this file only ever needs to
// answer "what's the real item code for X", never a price, and it must never
// be reachable from the client (kept in data/, not public/, same as
// catalog-raw.json).
//
// Re-run whenever Rob provides a fresh export:
//   node scripts/build-backend-items.mjs <path-to-ItemExport.xlsx>

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import XLSX from "xlsx";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = process.argv[2];

if (!sourcePath) {
  console.error("Usage: node scripts/build-backend-items.mjs <path-to-ItemExport.xlsx>");
  process.exit(1);
}

const wb = XLSX.readFile(sourcePath);
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });

// Drop: inactive items, group/header placeholder rows (no real category, or
// a description that's just "** NAME **"), and the Headers/Delivery/Misc
// housekeeping categories that aren't real rentable linens.
const SKIP_CATEGORIES = new Set(["", "Headers", "Delivery", "Misc"]);

const items = rows
  .filter((r) => r.Status === "A")
  .filter((r) => !SKIP_CATEGORIES.has(r.Category))
  .filter((r) => !/^\*\*.*\*\*$/.test(String(r.Description).trim()))
  .map((r) => ({
    itemNumber: String(r["Item Number"]).trim(),
    description: String(r.Description).trim(),
    category: String(r.Category).trim(),
    size: String(r.Size).trim(),
    color: String(r.Color).trim(),
  }));

writeFileSync(join(root, "data/backend-items.json"), JSON.stringify({ generatedAt: new Date().toISOString(), items }, null, 2));
console.log(`backend-items.json written: ${items.length} active items (of ${rows.length} raw rows)`);
