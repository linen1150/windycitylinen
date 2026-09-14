// One-off: apply the real Dropbox photos pulled for the Photo Shot List's
// "Found" items. Overwrites the existing (wrong-content) .jpg at each path
// and regenerates its matching .webp via sharp, since imageFilename in the
// DB/catalog-raw.json already points at these exact filenames — no data
// changes needed, just the file bytes.
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

const PULLS = String.raw`C:\Users\rob\AppData\Local\Temp\claude\C--Users-rob-code-windycitylinen\035e1607-ffd8-4d34-a840-b3d91e818ffd\scratchpad\dropbox-pulls`;
const IMAGES = String.raw`C:\Users\rob\code\windycitylinen\public\images`;

const swaps = [
  { src: "shantung-turquoise-reverse.jpg", dest: "Tablecloths and Overlays/shantungturquoise2.jpg" },
  { src: "slate-shantung-reverse.jpg", dest: "Tablecloths and Overlays/shantungslateblue2.jpg" },
  { src: "shantung-light-pink-front.jpg", dest: "Tablecloths and Overlays/shantunglightping.jpg" },
  { src: "shantung-light-pink-reverse.jpg", dest: "Tablecloths and Overlays/shantunglightpink2.jpg" },
  { src: "shantung-wedgewood-reverse.jpg", dest: "Tablecloths and Overlays/shantungwedgewood2.jpg" },
  { src: "velvet-champagne-gold.jpg", dest: "Tablecloths and Overlays/velvetgold.jpg" },
  { src: "teal-matte-lamour.jpg", dest: "Tablecloths and Overlays/mattelamourteal.jpg" },
  { src: "harmony-terracotta-runner.jpg", dest: "Table Runners/HarmonyTerracottaRunner.jpg" },
];

for (const { src, dest } of swaps) {
  const srcPath = path.join(PULLS, src);
  const destPath = path.join(IMAGES, dest);
  const webpPath = destPath.replace(/\.jpg$/i, ".webp");

  const buf = await fs.readFile(srcPath);
  await fs.writeFile(destPath, buf);
  await sharp(buf).webp({ quality: 82 }).toFile(webpPath);

  console.log(`Updated ${dest} (+ .webp) from ${src}`);
}
