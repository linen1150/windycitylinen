"use client";

import { useState } from "react";
import Link from "next/link";
import { useInspirations } from "./inspirations-store";
import type { ProductDetailData } from "@/lib/catalog";

export function AddToInspirations({ product }: { product: ProductDetailData }) {
  const { add } = useInspirations();
  const sizes = product.sizes;
  const [selected, setSelected] = useState<string[]>(sizes[0] ? [sizes[0]] : []);
  const [added, setAdded] = useState(0);

  const toggle = (s: string) =>
    setSelected((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const submit = () => {
    const chosen = selected.length ? selected : [""];
    for (const size of chosen) {
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
    }
    setAdded(chosen.length);
    setTimeout(() => setAdded(0), 3000);
  };

  return (
    <div>
      {sizes.length > 0 && (
        <div className="mt-6">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Size <span className="font-normal normal-case">— choose one or more</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => {
              const on = selected.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(s)}
                  className={`border px-3.5 py-2 text-[13px] ${
                    on ? "border-ink bg-ink text-white" : "border-line hover:border-ink"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={submit}
          className="bg-wine px-6 py-3 text-sm font-medium text-white hover:bg-[#652638]"
        >
          {added
            ? `Added ${added === 1 ? "" : `${added} sizes `}to My Inspirations ✓`
            : selected.length > 1
              ? `Add ${selected.length} sizes to My Inspirations`
              : "Add to My Inspirations"}
        </button>
        {added > 0 && (
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
