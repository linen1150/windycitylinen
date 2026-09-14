// Rebuilds the round-60 mask/shading trio from the reference images embedded
// in table-setting-visualizer-consolidated.docx, instead of the ad-hoc
// threshold segmentation from gen-visualizer-real-pair.mjs.
//
// The docx bundles a clean matte cutout of the round table on solid black
// (2a9d52bc...) and a matching precomputed grayscale shading/fold map, also
// on solid black (9063b119...) — same table, pixel-aligned. The cutout's
// background is essentially perfect black (histogram check: ~34% of pixels
// <=5, next-to-none between 5 and 50), so the mask derived from it is far
// more accurate than the bounding-ellipse + flood-fill approach used before.
//
// Unlike the old pipeline there's no real-photo background layer here: the
// shading render has no studio clutter to show, so the cloth sits directly
// on the page's own card background (transparent bg asset) instead.
//
// Usage: node scripts/gen-visualizer-from-docx-assets.mjs <media-dir>
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const OUT = "public/visualizer";
mkdirSync(OUT, { recursive: true });

const mediaDir = process.argv[2];
if (!mediaDir) {
  console.error("Usage: node scripts/gen-visualizer-from-docx-assets.mjs <media-dir>");
  process.exit(1);
}

const CUTOUT = `${mediaDir}/2a9d52bc59e6b6376daf4bf0f5f5d2d93fb77a32.jpg`;
const SHADING_SRC = `${mediaDir}/9063b119d2445dc64bf869e903742d2c83e650fc.jpg`;

const WIDTH = 1200;
const HEIGHT = 900;
const CLOTH_THRESHOLD = 15; // max(r,g,b) above this = cloth, per the histogram check

const { data: cutoutData, info } = await sharp(CUTOUT)
  .resize(WIDTH, HEIGHT)
  .raw()
  .toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
const N = width * height;

// Build a real RGBA buffer (white, alpha = cloth/not-cloth) rather than a
// bare single-channel buffer — a source with no alpha channel is treated as
// fully opaque by "dest-in" regardless of its pixel values, which silently
// produces an all-opaque mask.
const alphaRgba = Buffer.alloc(N * 4);
for (let i = 0; i < N; i++) {
  const idx = i * channels;
  const mx = Math.max(cutoutData[idx], cutoutData[idx + 1], cutoutData[idx + 2]);
  const a = mx > CLOTH_THRESHOLD ? 255 : 0;
  alphaRgba[i * 4] = 255;
  alphaRgba[i * 4 + 1] = 255;
  alphaRgba[i * 4 + 2] = 255;
  alphaRgba[i * 4 + 3] = a;
}
// Small feather to soften the jaggy JPEG-compression edge.
const alphaPng = await sharp(alphaRgba, { raw: { width, height, channels: 4 } })
  .blur(1.5)
  .png()
  .toBuffer();

const maskRgba = await sharp({
  create: { width, height, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
})
  .composite([{ input: alphaPng, blend: "dest-in" }])
  .png()
  .toBuffer();
await sharp(maskRgba).toFile(`${OUT}/round-60-mask.png`);

// Shading map: the docx's precomputed fold/shadow map, clipped to the same
// mask so it only darkens the cloth region when multiply-blended.
await sharp(SHADING_SRC)
  .resize(WIDTH, HEIGHT)
  .grayscale()
  .ensureAlpha()
  .composite([{ input: alphaPng, blend: "dest-in" }])
  .png()
  .toFile(`${OUT}/round-60-shading.png`);

// No real-photo background anymore — the cloth sits on the page's own card
// background, so this is just a fully transparent placeholder the same size.
await sharp({
  create: { width, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
})
  .png()
  .toFile(`${OUT}/round-60-bg.png`);

console.log("Wrote round-60-bg.png, round-60-mask.png, round-60-shading.png to", OUT);
