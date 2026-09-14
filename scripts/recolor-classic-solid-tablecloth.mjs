// Recolors a Classic Solid tablecloth photo to match its napkin's real
// photographed color (not the stored colorHex, which is often a much more
// saturated "ideal" swatch than what the actual photo shows).
//
// Technique: normalize the tablecloth's own brightness map (divide out its
// average luminance so it's centered on 1.0, preserving every fold/
// highlight/shadow), then multiply that texture map by the napkin's true
// fabric color — sampled as the per-channel MEDIAN of a tight (30%) center
// crop of the napkin photo.
//
// V1 of this script sampled the "brightest quarter" of a looser (60%) crop
// instead, on the theory that brighter = less likely to be shadow. That
// broke every dark/muted color (Black, Brown, Burgundy, Eggplant, Purple):
// on near-black fabric, the *brightest* pixels in frame are disproportion-
// ately warm wood-table bleed at the crop's edges, not fabric, so "brightest
// quarter" was averaging in contamination and pulling every dark color
// toward the same warm brown. Median of a tighter, more clearly-fabric-only
// crop is robust to outliers in *either* direction (stray bright bleed or
// stray dark shadow), which is why it replaced brightest-quartile-mean here.
//
// Two other approaches were tried and rejected before that: a straight HSL
// hue/saturation swap (kept original Lightness) was too subtle a shift;
// Lab-space statistical (Reinhard) transfer came out blotchy because these
// tablecloth photos have almost no natural shading variation, so matching
// the napkin's contrast/spread just amplified JPEG noise.
//
// Usage: node scripts/recolor-classic-solid-tablecloth.mjs <color-name> [--apply]
// e.g.:  node scripts/recolor-classic-solid-tablecloth.mjs Apple --apply
// Looks up the Tablecloths/Napkins imageFilename for that Classic Solid
// color from the DB. Without --apply, writes a preview to the scratchpad
// (safe — never touches public/images/). With --apply, overwrites the
// tablecloth file in place (+ regenerates its .webp). No DB changes either
// way — imageFilename doesn't change.
import sharp from "sharp";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

function clamp(v) {
  return Math.max(0, Math.min(255, v));
}

function median(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

async function medianFabricColor(path, cropFrac = 0.3) {
  const meta = await sharp(path).metadata();
  const w = Math.round(meta.width * cropFrac);
  const h = Math.round(meta.height * cropFrac);
  const left = Math.round((meta.width - w) / 2);
  const top = Math.round((meta.height - h) / 2);
  const { data, info } = await sharp(path)
    .extract({ left, top, width: w, height: h })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const n = info.width * info.height;
  const rs = new Array(n), gs = new Array(n), bs = new Array(n);
  for (let i = 0; i < n; i++) {
    const idx = i * info.channels;
    rs[i] = data[idx]; gs[i] = data[idx + 1]; bs[i] = data[idx + 2];
  }
  return [median(rs), median(gs), median(bs)];
}

async function recolor(clothPath, [targetR, targetG, targetB], outPath) {
  const { data, info } = await sharp(clothPath).raw().toBuffer({ resolveWithObject: true });
  const total = info.width * info.height;
  const lum = new Float32Array(total);
  let lumSum = 0;
  for (let i = 0; i < total; i++) {
    const idx = i * info.channels;
    const l = 0.2126 * data[idx] + 0.7152 * data[idx + 1] + 0.0722 * data[idx + 2];
    lum[i] = l;
    lumSum += l;
  }
  const lumAvg = lumSum / total;
  const out = Buffer.alloc(data.length);
  for (let i = 0; i < total; i++) {
    const idx = i * info.channels;
    const norm = lum[i] / lumAvg;
    out[idx] = clamp(Math.round(targetR * norm));
    out[idx + 1] = clamp(Math.round(targetG * norm));
    out[idx + 2] = clamp(Math.round(targetB * norm));
    if (info.channels === 4) out[idx + 3] = data[idx + 3];
  }
  await sharp(out, { raw: { width: info.width, height: info.height, channels: info.channels } })
    .jpeg({ quality: 90 })
    .toFile(outPath);
  await sharp(out, { raw: { width: info.width, height: info.height, channels: info.channels } })
    .webp({ quality: 82 })
    .toFile(outPath.replace(/\.jpg$/i, ".webp"));
}

async function main() {
  const colorName = process.argv[2];
  const apply = process.argv.includes("--apply");
  if (!colorName) throw new Error("Usage: node recolor-classic-solid-tablecloth.mjs <color-name> [--apply]");

  const cloth = await db.product.findFirst({
    where: { colorName, fabric: { name: "Classic Solid" }, category: { name: "Tablecloths and Overlays" } },
  });
  const napkin = await db.product.findFirst({
    where: { colorName, fabric: { name: "Classic Solid" }, category: { name: "Napkins" } },
  });
  if (!cloth?.imageFilename || !napkin?.imageFilename) {
    throw new Error(`Missing tablecloth or napkin (with a photo) for Classic Solid ${colorName}`);
  }
  if (napkin.imageFilename.startsWith("/")) {
    console.log(`Skipping ${colorName} — napkin has no real photo of its own yet (it's a stand-in pointing at the tablecloth itself).`);
    return;
  }

  const clothPath = `public/images/Tablecloths and Overlays/${cloth.imageFilename}`;
  const napkinPath = `public/images/Napkins/${napkin.imageFilename}`;

  const target = await medianFabricColor(napkinPath);
  console.log(`${colorName}: napkin target RGB(${target.map((v) => Math.round(v)).join(", ")})`);

  if (apply) {
    await recolor(clothPath, target, clothPath);
    console.log(`Applied: overwrote ${clothPath}`);
  } else {
    const outPath = String.raw`C:\Users\rob\AppData\Local\Temp\claude\C--Users-rob-code-windycitylinen\035e1607-ffd8-4d34-a840-b3d91e818ffd\scratchpad\recolor-preview-${colorName.replace(/\s+/g, "")}.jpg`;
    await recolor(clothPath, target, outPath);
    console.log(`Preview only: ${outPath}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
