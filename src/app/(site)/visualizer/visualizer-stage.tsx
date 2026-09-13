"use client";

import { useEffect, useRef, useState } from "react";
import { COLOR_GROUPS } from "@/lib/catalog";

type Shape = { id: string; label: string; bg: string; mask: string; shading: string };

const SHAPES: Shape[] = [
  {
    id: "round-60",
    label: "60\" Round",
    bg: "/visualizer/round-60-bg.jpg",
    mask: "/visualizer/round-60-mask.png",
    shading: "/visualizer/round-60-shading.png",
  },
];

export function VisualizerStage() {
  const [shapeId, setShapeId] = useState(SHAPES[0].id);
  const [color, setColor] = useState(COLOR_GROUPS[0].hex);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskImgRef = useRef<HTMLImageElement | null>(null);
  const shape = SHAPES.find((s) => s.id === shapeId) ?? SHAPES[0];

  const paint = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const mask = maskImgRef.current;
    if (!canvas || !ctx || !mask) return;
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    // Draw the real cloth-cutout mask, then keep only the color fill where
    // the mask was opaque — colorizes the exact photographed silhouette
    // instead of an approximated geometric shape.
    ctx.drawImage(mask, 0, 0, width, height);
    ctx.globalCompositeOperation = "source-in";
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = "source-over";
  };

  useEffect(() => {
    const img = new Image();
    img.src = shape.mask;
    img.onload = () => {
      maskImgRef.current = img;
      paint();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shape.mask]);

  useEffect(() => {
    paint();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color]);

  return (
    <div>
      {SHAPES.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {SHAPES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setShapeId(s.id)}
              className={`border px-3 py-1.5 text-sm ${
                s.id === shapeId ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      <div className="relative aspect-square w-full max-w-xl overflow-hidden border border-line bg-ivory">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={shape.bg} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <canvas ref={canvasRef} width={900} height={900} className="absolute inset-0 h-full w-full" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={shape.shading}
          alt={`${shape.label} table dressed in a linen`}
          className="absolute inset-0 h-full w-full object-cover mix-blend-multiply"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {COLOR_GROUPS.map((c) => (
          <button
            key={c.name}
            type="button"
            onClick={() => setColor(c.hex)}
            aria-label={c.name}
            aria-pressed={color === c.hex}
            title={c.name}
            className={`size-8 rounded-full border-2 ${
              color === c.hex ? "border-ink" : "border-line"
            }`}
            style={{ backgroundColor: c.hex }}
          />
        ))}
      </div>
    </div>
  );
}
