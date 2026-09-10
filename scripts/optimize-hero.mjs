// One-off: optimize the home hero photos.
// Reads the source files listed below from public/home/, writes hero-N.jpg + hero-N.webp,
// and removes the originals. Re-run only when adding new source images.
//   node scripts/optimize-hero.mjs

import sharp from "sharp";
import { readdir, rename, unlink } from "node:fs/promises";
import { join } from "node:path";

const DIR = "public/home";
const MAX_W = 1600;

// Order = carousel order. Add/replace source filenames here, then re-run.
const SOURCES = [
  "April Landing Page alternative.jpg",
  "Runner header.png",
  "runner header 3.jpg",
  "Specialty cat 2.jpg",
];

const existing = new Set(await readdir(DIR));

let n = 0;
for (const src of SOURCES) {
  if (!existing.has(src)) {
    console.warn(`  skip (missing): ${src}`);
    continue;
  }
  n += 1;
  const input = join(DIR, src);
  const base = `hero-${n}`;

  const pipeline = sharp(input)
    .rotate() // respect EXIF orientation
    .resize({ width: MAX_W, withoutEnlargement: true });

  const meta = await sharp(input).metadata();

  await pipeline
    .clone()
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(join(DIR, `${base}.jpg`));
  await pipeline
    .clone()
    .webp({ quality: 78 })
    .toFile(join(DIR, `${base}.webp`));

  const out = await sharp(join(DIR, `${base}.jpg`)).metadata();
  console.log(`  ${base}: ${meta.width}x${meta.height} -> ${out.width}x${out.height}  (from "${src}")`);
}

// Remove the originals (they aren't the ones referenced by the site).
for (const src of SOURCES) {
  if (existing.has(src)) {
    // move first so a re-run is possible from a backup if needed
    await rename(join(DIR, src), join(DIR, `_source_${src}`)).catch(() => {});
    await unlink(join(DIR, `_source_${src}`)).catch(() => {});
  }
}

console.log(`Done — ${n} hero image(s).`);
