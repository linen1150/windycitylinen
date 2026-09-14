// Recolors a Classic Solid tablecloth photo to match its napkin's real
// photographed color (not the stored colorHex, which is often a much more
// saturated "ideal" swatch than what the actual photo shows).
//
// Technique (confirmed against the Apple color): normalize the tablecloth's
// own brightness map (divide out its average luminance so it's centered on
// 1.0, preserving every fold/highlight/shadow), then multiply that texture
// map by the napkin's true fabric color — sampled from the brightest quarter
// of pixels in a safe center crop, since a plain whole-image average gets
// pulled toward the dark wood table background and gets muted by folded
// shadow areas.
//
// Two other approaches were tried and rejected: a straight HSL hue/
// saturation swap (kept original Lightness) was too subtle a shift; Lab-
// space statistical (Reinhard) transfer came out blotchy because these
// tablecloth photos have almost no natural shading variation, so matching
// the napkin's contrast/spread just amplified JPEG noise.
//
// Usage: node scripts/recolor-classic-solid-tablecloth.mjs <color-name>
// e.g.:  node scripts/recolor-classic-solid-tablecloth.mjs Apple
// Looks up the Tablecloths/Napkins imageFilename for that Classic Solid
// color from the DB, recolors, and overwrites the tablecloth file in place
// (+ regenerates its .webp). No DB changes — imageFilename doesn't change.
import sharp from "sharp";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

function clamp(v) {
  return Math.max(0, Math.min(255, v));
}

async function brightestQuarterColor(path, cropFrac = 0.6) {
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
  const pixels = [];
  for (let i = 0; i < n; i++) {
    const idx = i * info.channels;
    const r = data[idx], g = data[idx + 1], b = data[idx + 2];
    const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    pixels.push([r, g, b, l]);
  }
  pixels.sort((a, b) => b[3] - a[3]);
  const top25 = pixels.slice(0, Math.floor(pixels.length * 0.25));
  let rSum = 0, gSum = 0, bSum = 0;
  for (const [r, g, b] of top25) { rSum += r; gSum += g; bSum += b; }
  return [rSum / top25.length, gSum / top25.length, bSum / top25.length];
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
  if (!colorName) throw new Error("Usage: node recolor-classic-solid-tablecloth.mjs <color-name>");

  const cloth = await db.product.findFirst({
    where: { colorName, fabric: { name: "Classic Solid" }, category: { name: "Tablecloths and Overlays" } },
  });
  const napkin = await db.product.findFirst({
    where: { colorName, fabric: { name: "Classic Solid" }, category: { name: "Napkins" } },
  });
  if (!cloth?.imageFilename || !napkin?.imageFilename) {
    throw new Error(`Missing tablecloth or napkin (with a photo) for Classic Solid ${colorName}`);
  }

  const clothPath = `public/images/Tablecloths and Overlays/${cloth.imageFilename}`;
  const napkinPath = `public/images/Napkins/${napkin.imageFilename}`;

  const target = await brightestQuarterColor(napkinPath);
  console.log(`${colorName}: napkin target RGB(${target.map((v) => Math.round(v)).join(", ")})`);
  await recolor(clothPath, target, clothPath);
  console.log(`Recolored ${clothPath}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
