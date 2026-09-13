"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Plus } from "lucide-react";
import { ProductImage } from "@/components/catalog/product-image";
import { useInspirations } from "@/components/inspirations/inspirations-store";
import { VirtualMarcelaAvatar } from "./virtual-marcela-avatar";
import type { ProductSearchResult } from "@/lib/ai/product-search-tool";

type Mode = "prompt" | "simple" | "loading" | "lookbook" | "error";

export function DesignCenterPanel() {
  const { lines, add, removeBySlug, has } = useInspirations();
  const [mode, setMode] = useState<Mode>("prompt");
  const [note, setNote] = useState("");
  const [suggestions, setSuggestions] = useState<ProductSearchResult[]>([]);

  async function buildLookbook() {
    setMode("loading");
    try {
      const res = await fetch("/api/design-center", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: lines }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setNote(data.note ?? "");
      setSuggestions(data.suggestions ?? []);
      setMode("lookbook");
    } catch {
      setMode("error");
    }
  }

  function toggle(p: ProductSearchResult) {
    if (has(p.slug)) {
      removeBySlug(p.slug);
      return;
    }
    add({
      productId: p.id,
      slug: p.slug,
      name: p.name,
      category: p.category,
      fabric: p.fabric,
      size: "",
      imageUrl: p.imageUrl,
      colorHex: p.colorHex,
    });
  }

  return (
    <section className="border border-line bg-ivory p-5">
      <div className="flex items-start gap-3">
        <VirtualMarcelaAvatar size={36} className="mt-0.5 shrink-0 rounded-full" />
        <div className="flex-1">
          {mode === "prompt" && (
            <>
              <p className="text-sm text-ink">
                Want to see these together? I can lay your swatches out as a lookbook
                — or pull in a few matching pieces to round out the look.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setMode("simple")}
                  className="border border-line bg-white px-4 py-2 text-xs font-medium hover:border-ink"
                >
                  Just my swatches
                </button>
                <button
                  type="button"
                  onClick={buildLookbook}
                  className="bg-brass px-4 py-2 text-xs font-medium text-white hover:bg-brass-dark"
                >
                  Add matching pieces
                </button>
              </div>
            </>
          )}

          {mode === "loading" && (
            <p className="text-sm text-ink-soft">Putting your lookbook together…</p>
          )}

          {mode === "error" && (
            <>
              <p className="text-sm text-ink-soft">
                Couldn&rsquo;t build that right now — here are just your swatches instead.
              </p>
              <button
                type="button"
                onClick={() => setMode("simple")}
                className="mt-2 text-xs text-ink-soft underline"
              >
                Show my swatches
              </button>
            </>
          )}

          {(mode === "simple" || mode === "lookbook") && (
            <>
              <p className="text-sm text-ink">
                {mode === "lookbook" && note
                  ? note
                  : "Here's how your saved swatches look together."}
              </p>
              <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                {lines.map((line) => (
                  <Link key={`${line.productId}-${line.size}`} href={`/product/${line.slug}`}>
                    <ProductImage
                      src={line.imageUrl}
                      alt={line.name}
                      colorHex={line.colorHex}
                      className="aspect-square w-full border border-line"
                    />
                  </Link>
                ))}
                {mode === "lookbook" &&
                  suggestions.map((p) => {
                    const saved = has(p.slug);
                    return (
                      <div key={p.slug} className="relative">
                        <Link href={`/product/${p.slug}`}>
                          <ProductImage
                            src={p.imageUrl}
                            alt={`${p.fabric} ${p.colorName} ${p.category.replace(/s$/, "").toLowerCase()}`}
                            colorHex={p.colorHex}
                            className="aspect-square w-full border border-dashed border-brass"
                          />
                        </Link>
                        <button
                          type="button"
                          onClick={() => toggle(p)}
                          aria-label={saved ? "Remove from My Inspirations" : "Save to My Inspirations"}
                          className={`absolute right-1 top-1 flex size-6 items-center justify-center rounded-full shadow ${
                            saved ? "bg-sage text-white hover:bg-sage/80" : "bg-white/90 text-ink hover:bg-white"
                          }`}
                        >
                          {saved ? <Check size={14} /> : <Plus size={14} />}
                        </button>
                      </div>
                    );
                  })}
              </div>
              {mode === "simple" && (
                <button
                  type="button"
                  onClick={buildLookbook}
                  className="mt-3 text-xs text-ink-soft underline"
                >
                  Suggest matching pieces →
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
