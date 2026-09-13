import "server-only";
import { cache } from "react";
import path from "node:path";
import sharp from "sharp";

/**
 * Average color of a product's swatch photo, sampled directly from the
 * image (resize to 1x1 does the averaging) rather than trusting the
 * catalog's stored colorHex — swatch photos are the more accurate source,
 * and colorHex values don't always match what the fabric actually looks
 * like on camera.
 */
export const getSwatchAverageColor = cache(async (imageUrl: string | null): Promise<string | null> => {
  if (!imageUrl || !imageUrl.startsWith("/images/")) return null;
  try {
    const filePath = path.join(process.cwd(), "public", decodeURIComponent(imageUrl));
    const { data } = await sharp(filePath)
      .resize(1, 1, { fit: "cover" })
      .raw()
      .toBuffer({ resolveWithObject: true });
    const [r, g, b] = data;
    return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
  } catch {
    return null;
  }
});
