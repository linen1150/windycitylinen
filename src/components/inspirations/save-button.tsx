"use client";

import { Heart } from "lucide-react";
import { useInspirations, type Inspiration } from "./inspirations-store";

export function SaveButton({
  item,
  variant = "icon",
}: {
  item: Inspiration;
  variant?: "icon" | "full";
}) {
  const { has, toggle, hydrated } = useInspirations();
  const saved = hydrated && has(item.slug);

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={() => toggle(item)}
        className="inline-flex items-center gap-2 border border-line px-5 py-3 text-sm hover:border-ink"
        aria-pressed={saved}
      >
        <Heart size={15} className={saved ? "fill-wine text-wine" : ""} />
        {saved ? "Saved to My Inspirations" : "Save to My Inspirations"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        toggle(item);
      }}
      className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-white/95 shadow-sm"
      aria-label={saved ? "Remove from My Inspirations" : "Save to My Inspirations"}
      aria-pressed={saved}
    >
      <Heart size={14} className={saved ? "fill-wine text-wine" : "text-ink"} />
    </button>
  );
}
