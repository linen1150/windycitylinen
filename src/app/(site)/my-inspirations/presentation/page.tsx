"use client";

import { useState } from "react";
import Link from "next/link";
import { Printer } from "lucide-react";
import { useInspirations } from "@/components/inspirations/inspirations-store";
import { ProductImage } from "@/components/catalog/product-image";
import { ButtonLink } from "@/components/ui/button";
import { BridgetteAvatar } from "@/components/site/bridgette-avatar";
import { SITE } from "@/lib/site";

type Result = { title: string; intro: string; captions: Record<string, string> };

export default function PresentationPage() {
  const { lines, hydrated } = useInspirations();
  const [theme, setTheme] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/design-center/present", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: lines, theme }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong — please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!hydrated) return null;

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-8">
        <h1 className="font-display text-2xl">Nothing saved yet</h1>
        <p className="mt-3 text-ink-soft">
          Save a few linens to My Inspirations first, then come back to build a presentation.
        </p>
        <ButtonLink href="/products" variant="primary" className="mt-6">
          Browse the collection
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-8">
      <div className="print:hidden">
        <Link href="/my-inspirations" className="text-xs text-ink-soft underline">
          ← Back to My Inspirations
        </Link>

        {!result && (
          <div className="mt-4 border border-line bg-ivory p-5">
            <div className="flex items-start gap-3">
              <BridgetteAvatar size={36} className="mt-0.5 shrink-0 rounded-full" />
              <div className="flex-1">
                <p className="text-sm text-ink">
                  Tell me how you&rsquo;d like these presented — a theme, an occasion,
                  a mood — or leave it blank and I&rsquo;ll keep it simple.
                </p>
                <input
                  type="text"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="e.g. &ldquo;show these with a Christmas theme&rdquo;"
                  maxLength={300}
                  className="mt-3 w-full border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={generate}
                    disabled={loading}
                    className="bg-brass px-4 py-2 text-xs font-medium text-white hover:bg-brass-dark disabled:opacity-50"
                  >
                    {loading ? "Building…" : "Build my presentation"}
                  </button>
                </div>
                {error && <p className="mt-2 text-xs text-wine">{error}</p>}
              </div>
            </div>
          </div>
        )}

        {result && (
          <button
            type="button"
            onClick={() => window.print()}
            className="mt-4 inline-flex items-center gap-2 bg-brass px-4 py-2 text-xs font-medium text-white hover:bg-brass-dark"
          >
            <Printer size={14} />
            Print / save as PDF
          </button>
        )}
      </div>

      <div className="mt-8 border border-line bg-white p-8 print:mt-0 print:border-0 print:p-0">
        <div className="text-center">
          <div className="font-display text-sm uppercase tracking-[0.2em] text-brass-dark">
            {SITE.name}
          </div>
          <h1 className="mt-2 font-display text-3xl">
            {result?.title || "My Inspirations"}
          </h1>
          {result?.intro && (
            <p className="mx-auto mt-2 max-w-lg text-sm text-ink-soft">{result.intro}</p>
          )}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3">
          {lines.map((line) => (
            <div key={`${line.productId}-${line.size}`}>
              <ProductImage
                src={line.imageUrl}
                alt={line.name}
                colorHex={line.colorHex}
                className="aspect-square w-full border border-line"
              />
              <div className="mt-2 text-center">
                <div className="text-sm font-medium">{line.name}</div>
                <div className="text-xs text-ink-soft">
                  {line.fabric} · {line.size || "size to confirm"}
                </div>
                {result?.captions[line.slug] && (
                  <div className="mt-1 text-xs italic text-brass-dark">
                    {result.captions[line.slug]}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-[11px] text-ink-soft print:block hidden">
          {SITE.phone} · {SITE.email} — pricing and availability confirmed by our team.
        </p>
      </div>
    </div>
  );
}
