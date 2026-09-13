// Builds the real 60" round background/shading/mask trio for the tablecloth
// color visualizer from a source photo of a table dressed in a plain white
// jacquard cloth (see tablecloth-visualizer-spec.md).
//
// Uses the full, uncropped photo (4:3) rather than a square crop, so the
// whole table is visible. The cloth cutout is a real pixel segmentation:
// 1. Flag pixels as "cloth candidate" if they're bright/neutral (not the
//    saturated fabric bolts or dark wood floor/chairs) AND inside a generous
//    bounding ellipse (keeps segmentation from leaking into far-away floor
//    that happens to share similar tone).
// 2. Flood-fill "background" inward from the image border, through
//    candidate=false pixels only. Whatever that flood-fill can't reach —
//    including dark shadow folds fully enclosed by cloth — becomes cloth.
//
// The shading layer is heavily blurred before masking: this is meant to
// carry the drape's fold/shadow shape, not the source fabric's own weave —
// a different (e.g. solid) fabric shouldn't visually inherit this photo's
// jacquard texture.
//
// Usage: node scripts/gen-visualizer-real-pair.mjs <source-photo.jpg>
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const WIDTH = 1200;
const HEIGHT = 900;
const OUT = "public/visualizer";
mkdirSync(OUT, { recursive: true });

const src = process.argv[2];
if (!src) {
  console.error("Usage: node scripts/gen-visualizer-real-pair.mjs <source-photo.jpg>");
  process.exit(1);
}

// Generous bounding ellipse (pixels, in the WIDTHxHEIGHT frame) that the
// color-threshold segmentation is allowed to search within. Tuned against
// one photo — re-check against a red-background mask preview if the source
// photo changes framing.
const BOUND = { cx: 600, cy: 500, rx: 520, ry: 420 };
const BRIGHT_MIN = 55;
const NEUTRAL_MAX = 30;
const SHADING_BLUR = 14;

const bgBuf = await sharp(src).resize(WIDTH, HEIGHT).jpeg({ quality: 92 }).toBuffer();
await sharp(bgBuf).toFile(`${OUT}/round-60-bg.jpg`);

const { data, info } = await sharp(bgBuf).raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
const N = width * height;

function inBound(x, y) {
  const dx = (x - BOUND.cx) / BOUND.rx;
  const dy = (y - BOUND.cy) / BOUND.ry;
  return dx * dx + dy * dy <= 1.15;
}

const isBg = new Uint8Array(N);
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = y * width + x;
    const i = idx * channels;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const mn = Math.min(r, g, b), mx = Math.max(r, g, b);
    const looksLikeCloth = mn > BRIGHT_MIN && mx - mn < NEUTRAL_MAX;
    isBg[idx] = looksLikeCloth && inBound(x, y) ? 0 : 1;
  }
}

const outside = new Uint8Array(N);
const qx = new Int32Array(N), qy = new Int32Array(N);
let qh = 0, qt = 0;
function push(x, y) {
  const idx = y * width + x;
  if (isBg[idx] && !outside[idx]) {
    outside[idx] = 1;
    qx[qt] = x; qy[qt] = y; qt++;
  }
}
for (let x = 0; x < width; x++) { push(x, 0); push(x, height - 1); }
for (let y = 0; y < height; y++) { push(0, y); push(width - 1, y); }
while (qh < qt) {
  const x = qx[qh], y = qy[qh]; qh++;
  if (x > 0) push(x - 1, y);
  if (x < width - 1) push(x + 1, y);
  if (y > 0) push(x, y - 1);
  if (y < height - 1) push(x, y + 1);
}

const maskRgba = Buffer.alloc(N * 4);
for (let i = 0; i < N; i++) {
  const cloth = outside[i] ? 0 : 255;
  maskRgba[i * 4] = 255; maskRgba[i * 4 + 1] = 255; maskRgba[i * 4 + 2] = 255; maskRgba[i * 4 + 3] = cloth;
}
const maskBuf = await sharp(maskRgba, { raw: { width, height, channels: 4 } }).blur(2).png().toBuffer();
await sharp(maskBuf).toFile(`${OUT}/round-60-mask.png`);

const blurredGrayscale = await sharp(bgBuf).grayscale().blur(SHADING_BLUR).linear(1.3, -25).toBuffer();
await sharp(blurredGrayscale)
  .ensureAlpha()
  .composite([{ input: maskBuf, blend: "dest-in" }])
  .png()
  .toFile(`${OUT}/round-60-shading.png`);

console.log("Wrote round-60-bg.jpg, round-60-mask.png, round-60-shading.png to", OUT);
