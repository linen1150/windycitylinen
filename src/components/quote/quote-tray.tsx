"use client";

import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { useQuote } from "./quote-store";
import { ProductImage } from "@/components/catalog/product-image";

export function QuoteTray() {
  const { lines, isOpen, close, remove, setQuantity, count } = useQuote();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40">
      <button
        aria-label="Close quote request"
        onClick={close}
        className="absolute inset-0 bg-ink/40"
      />
      <div className="absolute right-0 top-0 flex h-full w-[380px] max-w-[90vw] flex-col bg-paper shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="font-display text-lg">Your quote request</h2>
          <button onClick={close} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          {lines.length === 0 && (
            <p className="py-8 text-sm text-ink-soft">
              Nothing added yet — browse the catalog and choose “Add to quote request”
              on any item. No pricing is shown; our team quotes each request directly.
            </p>
          )}
          {lines.map((line, i) => (
            <div key={`${line.productId}-${line.size}`} className="flex gap-3 border-b border-line py-4">
              <ProductImage
                src={line.imageUrl}
                alt={line.name}
                colorHex={line.colorHex}
                className="size-14 shrink-0"
              />
              <div className="flex-1">
                <Link href={`/product/${line.slug}`} onClick={close} className="text-sm font-medium hover:underline">
                  {line.name}
                </Link>
                <div className="text-xs text-ink-soft">{line.size || "Size TBD"}</div>
                <div className="mt-2 inline-flex items-center border border-line">
                  <button
                    onClick={() => setQuantity(i, line.quantity - 1)}
                    className="flex size-7 items-center justify-center"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-9 text-center text-sm">{line.quantity}</span>
                  <button
                    onClick={() => setQuantity(i, line.quantity + 1)}
                    className="flex size-7 items-center justify-center"
                    aria-label="Increase quantity"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
              <button onClick={() => remove(i)} aria-label="Remove item" className="text-ink-soft">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="border-t border-line px-6 py-4">
          <p className="mb-3 text-xs text-ink-soft">
            {count > 0
              ? "No prices shown — submitting sends this list to our team for a full quote."
              : "Add items to get started."}
          </p>
          <Link
            href="/quote"
            onClick={close}
            aria-disabled={count === 0}
            className={`block w-full bg-wine px-6 py-3 text-center text-sm font-medium text-white hover:bg-[#652638] ${
              count === 0 ? "pointer-events-none opacity-50" : ""
            }`}
          >
            Review &amp; request quote
          </Link>
        </div>
      </div>
    </div>
  );
}
