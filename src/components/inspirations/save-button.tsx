"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { useInspirations } from "./inspirations-store";
import type { ProductCardData } from "@/lib/catalog";

/** Quick add/remove toggle used on catalog cards (no size picker — size is
 *  chosen later on the product page or the My Inspirations list). */
export function SaveButton({ product }: { product: ProductCardData }) {
  const { has, add, removeBySlug, hydrated } = useInspirations();
  const saved = hydrated && has(product.slug);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        if (saved) {
          removeBySlug(product.slug);
        } else {
          add({
            productId: product.id,
            slug: product.slug,
            name: product.name,
            category: product.category,
            fabric: product.fabric,
            size: "",
            imageUrl: product.imageUrl,
            colorHex: product.colorHex,
          });
        }
      }}
      className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-white/95 shadow-sm"
      aria-label={saved ? "Remove from My Inspirations" : "Save to My Inspirations"}
      aria-pressed={saved}
    >
      {saved ? (
        <BookmarkCheck size={15} className="text-brass-dark" />
      ) : (
        <Bookmark size={15} className="text-ink" />
      )}
    </button>
  );
}
