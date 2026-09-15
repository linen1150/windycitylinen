"use client";

import { useState } from "react";

function shade(hex: string, amt: number) {
  const n = parseInt(hex.replace("#", ""), 16);
  if (Number.isNaN(n)) return hex;
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const r = clamp((n >> 16) + amt);
  const g = clamp(((n >> 8) & 0xff) + amt);
  const b = clamp((n & 0xff) + amt);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Product photo with a woven-gradient fallback for items that have no image on
 * file yet. Plain <img> (not next/image) because the ~1,200 photos are already
 * optimized and served straight from /public.
 */
export function ProductImage({
  src,
  alt,
  colorHex,
  className = "",
  sizes,
}: {
  src: string | null;
  alt: string;
  colorHex: string | null;
  className?: string;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);
  const base = colorHex || "#DACBAA";

  if (!src || failed) {
    return (
      <div
        className={`swatch-fallback flex flex-col items-center justify-center gap-1.5 ${className}`}
        style={
          {
            "--c1": base,
            "--c2": shade(base, 18),
          } as React.CSSProperties
        }
        aria-label={`${alt} — photo coming soon`}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          width="28"
          height="28"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="text-ink/70"
        >
          <circle cx="12" cy="12" r="9" />
          <circle cx="9" cy="10" r="1.1" fill="currentColor" stroke="none" />
          <circle cx="15" cy="10" r="1.1" fill="currentColor" stroke="none" />
          <path d="M8 14.3c1 1.3 2.5 2 4 2s3-.7 4-2" strokeLinecap="round" />
        </svg>
        <span aria-hidden="true" className="text-[10px] font-semibold uppercase tracking-wider text-ink/70">
          Coming soon
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      sizes={sizes}
      className={`object-cover ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
