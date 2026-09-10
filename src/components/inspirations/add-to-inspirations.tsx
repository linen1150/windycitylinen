"use client";

import { useState } from "react";
import Link from "next/link";
import { useInspirations } from "./inspirations-store";
import type { ProductDetailData } from "@/lib/catalog";

export function AddToInspirations({ product }: { product: ProductDetailData }) {
  const { add } = useInspirations();
  const sizes = product.sizes;
  const [size, setSize] = useState(sizes[0] ?? "");
  const [added, setAdded] = useState(false);

  const submit = () => {
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      category: product.category,
      fabric: product.fabric,
      size,
      imageUrl: product.imageUrl,
      colorHex: product.colorHex,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  return (
    <div>
      {sizes.length > 0 && (
        <div className="mt-6">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Size
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`border px-3.5 py-2 text-[13px] ${
                  size === s ? "border-ink bg-ink text-white" : "border-line hover:border-ink"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          onClick={submit}
          className="bg-wine px-6 py-3 text-sm font-medium text-white hover:bg-[#652638]"
        >
          {added ? "Added to My Inspirations ✓" : "Add to My Inspirations"}
        </button>
        {added && (
          <Link href="/my-inspirations" className="text-sm text-wine underline underline-offset-2">
            View My Inspirations
          </Link>
        )}
      </div>

      <p className="mt-5 border-l-2 border-brass bg-ivory px-4 py-3 text-[13px] text-ink-soft">
        Save the linens you&rsquo;re considering to My Inspirations, then send the list to
        our team. No pricing is shown — we follow up directly with pricing based on your
        event, dates and delivery zone, usually within one business day.
      </p>
    </div>
  );
}
