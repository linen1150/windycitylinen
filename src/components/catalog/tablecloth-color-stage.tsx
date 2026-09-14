"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

const DEFAULT_BG = "/visualizer/round-60-bg.png";
const DEFAULT_MASK = "/visualizer/round-60-mask.png";
const DEFAULT_SHADING = "/visualizer/round-60-shading.png";

// Tile size (px) used for the mirrored fallback (solids/non-periodic
// textures) — see buildMirroredTile. The source photos are ~900px square
// close-ups of the fabric weave; tiling at that native size would show only
// one or two blown-up repeats, so we shrink first for a texture that reads
// as fabric at the stage's render size.
const SWATCH_TILE_PX = 120;

// Working resolution for both period detection and the final periodic-tile
// crop — big enough to resolve a real printed check/stripe repeat, small
// enough that the autocorrelation scan (O(size * maxLag) per axis) is
// effectively instant.
const PERIOD_DETECT_SIZE = 600;
// A peak's score must clear this fraction of the signal's own variance to
// count as a genuine repeat rather than noise.
const MIN_PATTERN_CONFIDENCE = 0.4;
// A solid/near-flat swatch can still produce a deceptively "confident"
// autocorrelation ratio just from JPEG noise — this absolute variance floor
// (0-255 grayscale) rejects those regardless of confidence. Validated
// against real catalog photos: a solid measured ~2.5, a non-periodic
// textured fabric (Verve) ~68, a real gingham check ~636.
const MIN_PATTERN_VARIANCE = 20;

const LENS_SIZE = 180; // CSS px, circular magnifier diameter
const LENS_ZOOM = 3.5;

function toGrayscaleRow(data: Uint8ClampedArray, size: number, sampleLines: number[]) {
  const signal = new Float64Array(size);
  for (const y of sampleLines) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      signal[x] += (0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]) / sampleLines.length;
    }
  }
  return signal;
}

function toGrayscaleColumn(data: Uint8ClampedArray, size: number, sampleLines: number[]) {
  const signal = new Float64Array(size);
  for (const x of sampleLines) {
    for (let y = 0; y < size; y++) {
      const idx = (y * size + x) * 4;
      signal[y] += (0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]) / sampleLines.length;
    }
  }
  return signal;
}

// Finds a fabric's true repeat period via 1D autocorrelation (the same idea
// as table-setting-visualizer-consolidated.docx's Step 3): a real printed
// repeat — checks, stripes — produces a strong, sharp autocorrelation peak
// at the true period; a solid or a non-periodic texture (velvet grain, etc.)
// does not.
function detectPeriod(signal: Float64Array, minLag: number, maxLag: number) {
  const n = signal.length;
  let mean = 0;
  for (let i = 0; i < n; i++) mean += signal[i];
  mean /= n;
  const centered = new Float64Array(n);
  let energy = 0;
  for (let i = 0; i < n; i++) {
    centered[i] = signal[i] - mean;
    energy += centered[i] * centered[i];
  }
  const variance = energy / n;
  if (variance < 1e-6) return { period: 0, confidence: 0, variance };

  const scores = new Float64Array(maxLag - minLag + 1);
  for (let lag = minLag; lag <= maxLag; lag++) {
    let sum = 0;
    for (let i = 0; i < n - lag; i++) sum += centered[i] * centered[i + lag];
    scores[lag - minLag] = sum / (n - lag);
  }

  // Only trust a true local maximum. For a smooth/near-flat signal the
  // autocorrelation just decays monotonically with lag, which would
  // otherwise always "win" at the smallest lag searched — that's noise, not
  // a repeat.
  let bestLag = 0;
  let bestScore = -Infinity;
  for (let i = 1; i < scores.length - 1; i++) {
    if (scores[i] > scores[i - 1] && scores[i] > scores[i + 1] && scores[i] > bestScore) {
      bestScore = scores[i];
      bestLag = i + minLag;
    }
  }
  if (bestLag === 0) return { period: 0, confidence: 0, variance };
  return { period: bestLag, confidence: bestScore / variance, variance };
}

function buildPeriodicTile(work: HTMLCanvasElement, hPeriod: number, vPeriod: number) {
  const cropW = Math.floor(work.width / hPeriod) * hPeriod;
  const cropH = Math.floor(work.height / vPeriod) * vPeriod;
  const tile = document.createElement("canvas");
  tile.width = cropW;
  tile.height = cropH;
  tile.getContext("2d")!.drawImage(work, 0, 0, cropW, cropH, 0, 0, cropW, cropH);
  return tile;
}

// Fallback for solids and non-periodic textures, where there's no true
// repeat to detect: a plain repeat of one crop shows a hard seam at every
// tile edge (whatever grain the fabric has reads as an obvious stamped
// grid). Building the tile from 4 mirrored copies makes each edge a
// mirror-image of its neighbor, so "repeat" has nothing to seam against —
// without needing to know anything about the fabric's actual pattern.
function buildMirroredTile(work: HTMLCanvasElement, size: number) {
  const base = document.createElement("canvas");
  base.width = size;
  base.height = size;
  base.getContext("2d")!.drawImage(work, 0, 0, size, size);

  const tile = document.createElement("canvas");
  tile.width = size * 2;
  tile.height = size * 2;
  const tileCtx = tile.getContext("2d")!;
  tileCtx.drawImage(base, 0, 0);
  tileCtx.save();
  tileCtx.translate(tile.width, 0);
  tileCtx.scale(-1, 1);
  tileCtx.drawImage(base, 0, 0);
  tileCtx.restore();
  tileCtx.save();
  tileCtx.translate(0, tile.height);
  tileCtx.scale(1, -1);
  tileCtx.drawImage(base, 0, 0);
  tileCtx.restore();
  tileCtx.save();
  tileCtx.translate(tile.width, tile.height);
  tileCtx.scale(-1, -1);
  tileCtx.drawImage(base, 0, 0);
  tileCtx.restore();
  return tile;
}

function buildSwatchTile(img: HTMLImageElement): HTMLCanvasElement {
  const work = document.createElement("canvas");
  work.width = PERIOD_DETECT_SIZE;
  work.height = PERIOD_DETECT_SIZE;
  const workCtx = work.getContext("2d")!;
  workCtx.drawImage(img, 0, 0, PERIOD_DETECT_SIZE, PERIOD_DETECT_SIZE);

  try {
    const { data } = workCtx.getImageData(0, 0, PERIOD_DETECT_SIZE, PERIOD_DETECT_SIZE);
    const minLag = Math.max(6, Math.round(PERIOD_DETECT_SIZE * 0.015));
    const maxLag = Math.floor(PERIOD_DETECT_SIZE / 2.2);
    const sampleLines = [0.4, 0.45, 0.5, 0.55, 0.6].map((f) => Math.floor(f * PERIOD_DETECT_SIZE));

    const h = detectPeriod(toGrayscaleRow(data, PERIOD_DETECT_SIZE, sampleLines), minLag, maxLag);
    const v = detectPeriod(toGrayscaleColumn(data, PERIOD_DETECT_SIZE, sampleLines), minLag, maxLag);

    const isPeriodic =
      h.period > 0 &&
      v.period > 0 &&
      h.variance > MIN_PATTERN_VARIANCE &&
      v.variance > MIN_PATTERN_VARIANCE &&
      h.confidence > MIN_PATTERN_CONFIDENCE &&
      v.confidence > MIN_PATTERN_CONFIDENCE;

    return isPeriodic ? buildPeriodicTile(work, h.period, v.period) : buildMirroredTile(work, SWATCH_TILE_PX);
  } catch {
    // Tainted canvas or other read failure — fall back without pixel access.
    return buildMirroredTile(work, SWATCH_TILE_PX);
  }
}

/**
 * Composites a product's real fabric color/texture into the real photographed
 * tablecloth cutout (see scripts/gen-visualizer-real-pair.mjs) so it shows up
 * draped on an actual table, folds and shadows included, instead of a flat
 * swatch. Shared by the /visualizer prototype and product pages.
 *
 * When `swatchUrl` is given (a close-up photo of the actual fabric), it's
 * tiled as the fill instead of a flat `colorHex` block — real weave/texture
 * instead of a solid color. Everything (background, colorized cloth, fold
 * shading) is flattened into one canvas so a hover/touch-drag magnifier lens
 * can zoom into the actual composited fabric close-up.
 */
export function TableclothColorStage({
  colorHex,
  swatchUrl,
  bg = DEFAULT_BG,
  mask = DEFAULT_MASK,
  shading = DEFAULT_SHADING,
  className = "",
}: {
  colorHex: string;
  swatchUrl?: string | null;
  bg?: string;
  mask?: string;
  shading?: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lensCanvasRef = useRef<HTMLCanvasElement>(null);
  const bgImgRef = useRef<HTMLImageElement | null>(null);
  const maskImgRef = useRef<HTMLImageElement | null>(null);
  const shadingImgRef = useRef<HTMLImageElement | null>(null);
  const swatchPatternRef = useRef<CanvasPattern | null>(null);

  const [lensActive, setLensActive] = useState(false);
  const [lensPos, setLensPos] = useState({ left: 0, top: 0 });
  const [touchDragging, setTouchDragging] = useState(false);

  const paint = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const maskImg = maskImgRef.current;
    if (!canvas || !ctx || !maskImg) return;
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    if (bgImgRef.current) ctx.drawImage(bgImgRef.current, 0, 0, width, height);

    ctx.drawImage(maskImg, 0, 0, width, height);
    ctx.globalCompositeOperation = "source-in";
    ctx.fillStyle = swatchPatternRef.current ?? colorHex;
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = "source-over";

    if (shadingImgRef.current) {
      ctx.globalCompositeOperation = "multiply";
      ctx.drawImage(shadingImgRef.current, 0, 0, width, height);
      ctx.globalCompositeOperation = "source-over";
    }
  };

  useEffect(() => {
    const img = new Image();
    img.src = bg;
    img.onload = () => {
      bgImgRef.current = img;
      paint();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bg]);

  useEffect(() => {
    const img = new Image();
    img.src = mask;
    img.onload = () => {
      maskImgRef.current = img;
      paint();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mask]);

  useEffect(() => {
    const img = new Image();
    img.src = shading;
    img.onload = () => {
      shadingImgRef.current = img;
      paint();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shading]);

  useEffect(() => {
    swatchPatternRef.current = null;
    if (!swatchUrl) {
      paint();
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = swatchUrl;
    img.onload = () => {
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;
      const tile = buildSwatchTile(img);
      swatchPatternRef.current = ctx.createPattern(tile, "repeat");
      paint();
    };
    img.onerror = () => paint();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swatchUrl, colorHex]);

  const updateLens = (clientX: number, clientY: number) => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const lens = lensCanvasRef.current;
    if (!container || !canvas || !lens) return false;
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) return false;

    setLensPos({ left: x, top: y });

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const srcW = (LENS_SIZE / LENS_ZOOM) * scaleX;
    const srcH = (LENS_SIZE / LENS_ZOOM) * scaleY;
    const srcX = Math.max(0, Math.min(canvas.width - srcW, x * scaleX - srcW / 2));
    const srcY = Math.max(0, Math.min(canvas.height - srcH, y * scaleY - srcH / 2));

    const lensCtx = lens.getContext("2d");
    if (!lensCtx) return true;
    lensCtx.clearRect(0, 0, lens.width, lens.height);
    lensCtx.drawImage(canvas, srcX, srcY, srcW, srcH, 0, 0, lens.width, lens.height);
    return true;
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch" && !touchDragging) return;
    const inside = updateLens(e.clientX, e.clientY);
    setLensActive(inside);
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") {
      setTouchDragging(true);
      setLensActive(updateLens(e.clientX, e.clientY));
    }
  };

  const endLens = () => {
    setLensActive(false);
    setTouchDragging(false);
  };

  return (
    <div
      ref={containerRef}
      className={`relative aspect-[4/3] overflow-hidden border border-line bg-ivory touch-none ${className}`}
      onPointerEnter={handlePointerMove}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerUp={endLens}
      onPointerLeave={endLens}
      onPointerCancel={endLens}
    >
      <canvas ref={canvasRef} width={1200} height={900} className="absolute inset-0 h-full w-full" />

      {/* Always mounted (just hidden) so the ref exists before the first
          hover/touch — otherwise the very first pointer move has nothing to
          draw into and the lens never appears. */}
      <canvas
        ref={lensCanvasRef}
        width={LENS_SIZE * 2}
        height={LENS_SIZE * 2}
        hidden={!lensActive}
        className="pointer-events-none absolute rounded-full border-2 border-white shadow-lg"
        style={{
          left: lensPos.left - LENS_SIZE / 2,
          top: lensPos.top - LENS_SIZE / 2,
          width: LENS_SIZE,
          height: LENS_SIZE,
        }}
      />
      <div
        hidden={!lensActive}
        className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 bg-ink/70 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white"
      >
        Fabric close-up
      </div>
      <div
        hidden={lensActive}
        className="pointer-events-none absolute right-2 top-2 bg-ink/60 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white"
      >
        Hover to zoom
      </div>
    </div>
  );
}
