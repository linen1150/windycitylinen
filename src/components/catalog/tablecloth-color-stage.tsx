"use client";

import { useEffect, useRef } from "react";

const DEFAULT_BG = "/visualizer/round-60-bg.jpg";
const DEFAULT_MASK = "/visualizer/round-60-mask.png";
const DEFAULT_SHADING = "/visualizer/round-60-shading.png";

/**
 * Composites a solid color into the real photographed tablecloth cutout
 * (see scripts/gen-visualizer-real-pair.mjs) so a product's exact color
 * shows up draped on an actual table, folds and shadows included, instead
 * of a flat swatch. Shared by the /visualizer prototype and product pages.
 */
export function TableclothColorStage({
  colorHex,
  bg = DEFAULT_BG,
  mask = DEFAULT_MASK,
  shading = DEFAULT_SHADING,
  className = "",
}: {
  colorHex: string;
  bg?: string;
  mask?: string;
  shading?: string;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskImgRef = useRef<HTMLImageElement | null>(null);

  const paint = (color: string) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const maskImg = maskImgRef.current;
    if (!canvas || !ctx || !maskImg) return;
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(maskImg, 0, 0, width, height);
    ctx.globalCompositeOperation = "source-in";
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = "source-over";
  };

  useEffect(() => {
    const img = new Image();
    img.src = mask;
    img.onload = () => {
      maskImgRef.current = img;
      paint(colorHex);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mask]);

  useEffect(() => {
    paint(colorHex);
  }, [colorHex]);

  return (
    <div className={`relative aspect-square overflow-hidden border border-line bg-ivory ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={bg} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <canvas ref={canvasRef} width={900} height={900} className="absolute inset-0 h-full w-full" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={shading}
        alt="A round table dressed with this linen color"
        className="absolute inset-0 h-full w-full object-cover mix-blend-multiply"
      />
    </div>
  );
}
