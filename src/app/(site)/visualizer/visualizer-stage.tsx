"use client";

import { useEffect, useRef, useState } from "react";
import { COLOR_GROUPS } from "@/lib/catalog";

type Shape = { id: string; label: string; bg: string; shading: string };

const SHAPES: Shape[] = [
  {
    id: "round-60",
    label: "60\" Round",
    bg: "/visualizer/test-round-bg.jpg",
    shading: "/visualizer/test-round-shading.png",
  },
];

// Circle position/radius as a fraction of the square stage — must match the
// clip circle baked into the shading PNG (see scripts/gen-visualizer-placeholders.mjs).
const CLOTH = { cx: 0.5, cy: 0.5, r: 0.3667 };

export function VisualizerStage() {
  const [shapeId, setShapeId] = useState(SHAPES[0].id);
  const [color, setColor] = useState(COLOR_GROUPS[0].hex);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shape = SHAPES.find((s) => s.id === shapeId) ?? SHAPES[0];

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(width * CLOTH.cx, height * CLOTH.cy, width * CLOTH.r, 0, Math.PI * 2);
    ctx.fill();
  }, [color, shapeId]);

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
