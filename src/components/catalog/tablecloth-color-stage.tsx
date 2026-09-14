"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

const DEFAULT_BG = "/visualizer/round-60-bg.png";
const DEFAULT_MASK = "/visualizer/round-60-mask.png";
const DEFAULT_SHADING = "/visualizer/round-60-shading.png";

// Tile size (px) the swatch photo is downsampled to before being used as a
// repeating canvas pattern. The source photos are ~900px square close-ups of
// the fabric weave; tiling at that native size would show only one or two
// blown-up repeats, so we shrink first for a texture that reads as fabric at
// the stage's render size.
const SWATCH_TILE_PX = 120;

const LENS_SIZE = 180; // CSS px, circular magnifier diameter
const LENS_ZOOM = 3.5;

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
      const tile = document.createElement("canvas");
      tile.width = SWATCH_TILE_PX;
      tile.height = SWATCH_TILE_PX;
      const tileCtx = tile.getContext("2d");
      const ctx = canvasRef.current?.getContext("2d");
      if (!tileCtx || !ctx) return;
      tileCtx.drawImage(img, 0, 0, SWATCH_TILE_PX, SWATCH_TILE_PX);
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
