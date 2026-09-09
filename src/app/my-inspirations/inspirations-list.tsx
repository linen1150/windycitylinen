"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useInspirations } from "@/components/inspirations/inspirations-store";
import { ProductImage } from "@/components/catalog/product-image";
import { ButtonLink } from "@/components/ui/button";

export function InspirationsList() {
  const { items, hydrated, remove } = useInspirations();

  if (!hydrated) return null;

  if (items.length === 0) {
    return (
      <div className="border border-line bg-ivory p-8 text-center">
        <p className="text-ink-soft">You haven&rsquo;t saved anything yet.</p>
        <ButtonLink href="/products" variant="primary" className="mt-4">
          Browse the collection
        </ButtonLink>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.slug} className="group relative">
            <Link href={`/product/${item.slug}`} className="block">
              <ProductImage
                src={item.imageUrl}
                alt={item.name}
                colorHex={item.colorHex}
                className="aspect-square w-full"
              />
              <div className="mt-3 text-sm font-medium">{item.name}</div>
              <div className="text-xs text-ink-soft">{item.fabric}</div>
            </Link>
            <button
              onClick={() => remove(item.slug)}
              className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-white/95 shadow-sm"
              aria-label={`Remove ${item.name}`}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <p className="mt-8 text-sm text-ink-soft">
        Ready for pricing?{" "}
        <Link href="/products" className="text-wine underline">
          Add these to a quote request
        </Link>{" "}
        from each product page.
      </p>
    </>
  );
}
