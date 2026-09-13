"use client";

import { useState } from "react";
import { COLOR_GROUPS } from "@/lib/catalog";
import { TableclothColorStage } from "@/components/catalog/tablecloth-color-stage";

export function VisualizerStage() {
  const [color, setColor] = useState(COLOR_GROUPS[0].hex);

  return (
    <div>
      <TableclothColorStage colorHex={color} className="w-full max-w-xl" />

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
