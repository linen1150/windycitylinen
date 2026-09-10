"use client";

import { useState } from "react";
import Link from "next/link";
import { Minus, Plus } from "lucide-react";
import { useInspirations } from "./inspirations-store";
import type { ProductDetailData } from "@/lib/catalog";

export function AddToInspirations({ product }: { product: ProductDetailData }) {
  const { add } = useInspirations();
  const sizes = product.sizes;
  const [size, setSize] = useState(sizes[0] ?? "");
  const [qty, setQty] = useState(10);
  const [added, setAdded] = useState(false);

  const submit = () => {
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      category: product.category,
      fabric: product.fabric,
      size,
      quantity: qty,
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

      <div className="mt-5">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
          Quantity
        </div>
        <div className="inline-flex items-center border border-line">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex size-9 items-center justify-center"
            aria-label="Decrease quantity"
          >
            <Minus size={13} />
          </button>
          <input
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number.parseInt(e.target.value, 10) || 1))}
            inputMode="numeric"
            className="w-14 border-x border-line py-2 text-center text-sm"
            aria-label="Quantity"
          />
          <button
            onClick={() => setQty((q) => q + 1)}
            className="flex size-9 items-center justify-center"
            aria-label="Increase quantity"
          >
            <Plus size={13} />
          </button>
        </div>
      </div>

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
        our team. No pricing is shown — we follow up directly with pricing based on
        quantity, dates and delivery zone, usually within one business day.
      </p>
    </div>
  );
}
