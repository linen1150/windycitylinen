// Generalized version of recolor-classic-solid-tablecloth.mjs — same
// technique (normalize the source photo's own luminance map, multiply by a
// target color sampled as the per-channel median of a 30% center crop of a
// reference photo), but takes explicit file paths instead of looking up
// Classic Solid by DB colorName. Used for one-off recolors where the
// "correct" reference is some other sibling (a non-reverse version, a
// matching napkin, etc.) rather than the Classic Solid napkin convention.
//
// Usage: node scripts/recolor-generic.mjs <sourcePath> <referencePath> [--apply]
// Paths are relative to the repo root (e.g. "public/images/Tablecloths and
// Overlays/foo.jpg"). Without --apply, writes previews to the scratchpad.
// With --apply, overwrites sourcePath in place (+ regenerates its .webp).
import sharp from "sharp";
import { renameSync } from "node:fs";

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
  let lumCount = 0;
  for (let i = 0; i < total; i++) {
    const idx = i * info.channels;
    const r = data[idx], g = data[idx + 1], b = data[idx + 2];
    const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    lum[i] = l;
    // Exclude near-white/near-neutral studio-background pixels from the
    // average — a white backdrop (unlike a wood table or gray floor) is
    // bright enough to blow the multiply out into a neon cast on itself.
    const maxc = Math.max(r, g, b), minc = Math.min(r, g, b);
    const isBackground = l > 235 && maxc - minc < 12;
    if (!isBackground) {
      lumSum += l;
      lumCount++;
    }
  }
  const lumAvg = lumSum / (lumCount || total);
  const out = Buffer.alloc(data.length);
  for (let i = 0; i < total; i++) {
    const idx = i * info.channels;
    const r = data[idx], g = data[idx + 1], b = data[idx + 2];
    const maxc = Math.max(r, g, b), minc = Math.min(r, g, b);
    const isBackground = lum[i] > 235 && maxc - minc < 12;
    if (isBackground) {
      // Leave background pixels as-is instead of recoloring them.
      out[idx] = r;
      out[idx + 1] = g;
      out[idx + 2] = b;
    } else {
      let norm = lum[i] / lumAvg;
      // Soft-clip bright highlights (common on satin/sheen fabrics) instead
      // of a hard linear multiply, which blows a saturated target color out
      // to a clipped neon cast wherever direct light hits the fabric.
      if (norm > 1) norm = 1 + Math.tanh((norm - 1) * 0.6);
      out[idx] = clamp(Math.round(targetR * norm));
      out[idx + 1] = clamp(Math.round(targetG * norm));
      out[idx + 2] = clamp(Math.round(targetB * norm));
    }
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
  const [sourcePath, refPath] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const apply = process.argv.includes("--apply");
  if (!sourcePath || !refPath) {
    throw new Error("Usage: node recolor-generic.mjs <sourcePath> <referencePath> [--apply]");
  }

  const target = await medianFabricColor(refPath);
  console.log(`Reference "${refPath}": target RGB(${target.map((v) => Math.round(v)).join(", ")})`);

  if (apply) {
    // Write to a temp path first, then rename over the source — writing
    // in-place while sharp still holds a read handle (or the dev server's
    // watcher has one) fails with "unable to open for write" on Windows.
    const tmpJpg = sourcePath.replace(/\.jpg$/i, ".tmp.jpg");
    const tmpWebp = sourcePath.replace(/\.jpg$/i, ".tmp.webp");
    const finalWebp = sourcePath.replace(/\.jpg$/i, ".webp");
    await recolor(sourcePath, target, tmpJpg);
    renameSync(tmpJpg, sourcePath);
    renameSync(tmpWebp, finalWebp);
    console.log(`Applied: overwrote ${sourcePath}`);
  } else {
    const base = sourcePath.split(/[/\\]/).pop();
    const outPath = String.raw`C:\Users\rob\AppData\Local\Temp\claude\C--Users-rob-code-windycitylinen\035e1607-ffd8-4d34-a840-b3d91e818ffd\scratchpad\recolor-preview-${base}`;
    await recolor(sourcePath, target, outPath);
    console.log(`Preview only: ${outPath}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
