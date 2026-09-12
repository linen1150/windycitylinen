import sharp from "sharp";
import { readdirSync, statSync, mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import path from "node:path";

const SRC = "C:\\Users\\rob\\WCL Sales Dropbox\\WCL Sales Team Folder\\Photography\\Event Photos";
const OUT_DIR = "public/gallery";
const MANIFEST = "scripts/_gallery-manifest.json";

const EXCLUDE = new Set([
  "A PHOTO PROCESS",
  "Chair Pads ( do not use for socials)",
  "PHOTO RELEASE FORM",
  "WCL High Resolution",
]);

const IMAGE_RE = /\.(jpe?g|png)$/i;
const HEIC_RE = /\.heic$/i;

function walkFiles(dir) {
  let out = [];
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out = out.concat(walkFiles(full));
    else if (e.isFile()) out.push(full);
  }
  return out;
}

function slugify(name, used) {
  let slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70)
    .replace(/-+$/g, "");
  if (!slug) slug = "event";
  let candidate = slug;
  let i = 2;
  while (used.has(candidate)) {
    candidate = `${slug}-${i++}`;
  }
  used.add(candidate);
  return candidate;
}

mkdirSync(OUT_DIR, { recursive: true });

const folders = readdirSync(SRC, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !EXCLUDE.has(d.name))
  .map((d) => d.name)
  .sort();

const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : [];
const done = new Set(manifest.map((m) => m.folder));
const used = new Set(manifest.map((m) => m.imagePath.replace(/^\/gallery\//, "").replace(/\.jpg$/, "")));

const skipped = [];
const todo = folders.filter((f) => !done.has(f));
let i = 0;

for (const folder of todo) {
  i++;
  const dir = path.join(SRC, folder);
  const files = walkFiles(dir);

  const jpgPngFiles = files.filter((f) => IMAGE_RE.test(f));
  const heicFiles = files.filter((f) => HEIC_RE.test(f));
  const candidates = jpgPngFiles.length > 0 ? jpgPngFiles : heicFiles;

  if (candidates.length === 0) {
    skipped.push({ folder, reason: "no image files" });
    continue;
  }

  const withSize = candidates.map((f) => ({ path: f, size: statSync(f).size }));
  withSize.sort((a, b) => b.size - a.size);
  const chosen = withSize[0];
  const slug = slugify(folder, used);
  const outPath = path.join(OUT_DIR, `${slug}.jpg`);

  try {
    await sharp(chosen.path, { failOn: "none" })
      .rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(outPath);
    manifest.push({ folder, imagePath: `/gallery/${slug}.jpg`, caption: "" });
    writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
  } catch (err) {
    skipped.push({ folder, reason: `sharp failed on ${path.basename(chosen.path)}: ${err.message}` });
    continue;
  }

  if (i % 25 === 0) console.log(`  …${i}/${todo.length}`);
}

console.log(`\nTotal in manifest: ${manifest.length}`);
console.log(`This run processed ${todo.length - skipped.length} new photos, skipped ${skipped.length}:`);
for (const s of skipped) console.log(`  - ${s.folder}: ${s.reason}`);
