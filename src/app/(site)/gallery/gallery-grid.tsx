"use client";

import { useCallback, useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { ProductImage } from "@/components/catalog/product-image";

type Item = { id: string; imagePath: string; caption: string };

export function GalleryGrid({ items }: { items: Item[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const prev = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i - 1 + items.length) % items.length)),
    [items.length],
  );
  const next = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i + 1) % items.length)),
    [items.length],
  );

  useEffect(() => {
    if (openIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [openIndex, close, prev, next]);

  const open = openIndex !== null ? items[openIndex] : null;

  return (
    <>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item, i) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setOpenIndex(i)}
            className="group relative block aspect-square overflow-hidden border border-line text-left"
            aria-label={item.caption || "View photo full size"}
          >
            <ProductImage
              src={item.imagePath || null}
              alt={item.caption || "Windy City Linen event photo"}
              colorHex={null}
              className="h-full w-full"
            />
            {item.caption && (
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 p-3 text-center opacity-0 transition-all duration-150 group-hover:bg-black/50 group-hover:opacity-100">
                <span className="font-display text-base text-white drop-shadow sm:text-lg">
                  {item.caption}
                </span>
              </span>
            )}
          </button>
        ))}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-4 top-4 text-white/80 hover:text-white"
          >
            <X size={28} />
          </button>

          {items.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                aria-label="Previous photo"
                className="absolute left-2 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white sm:left-4"
              >
                <ChevronLeft size={32} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                aria-label="Next photo"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white sm:right-4"
              >
                <ChevronRight size={32} />
              </button>
            </>
          )}

          <div
            className="flex max-h-full max-w-full flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={open.imagePath}
              alt={open.caption || "Windy City Linen event photo"}
              className="max-h-[85vh] max-w-[90vw] object-contain"
            />
            {open.caption && <p className="mt-3 text-sm text-white/80">{open.caption}</p>}
          </div>
        </div>
      )}
    </>
  );
}
