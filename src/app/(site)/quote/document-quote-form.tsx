"use client";

import { useActionState, useRef, useState } from "react";
import { UploadCloud, FileText, X } from "lucide-react";
import Link from "next/link";
import { Field, Textarea } from "@/components/ui/field";
import { ButtonLink } from "@/components/ui/button";
import { submitInquiry, type InquiryFormState } from "@/app/actions";
import type { ExtractedItem, ExtractedOrder } from "@/app/api/quote-request/extract/route";

type ReviewItem = ExtractedItem & { id: string; include: boolean };

const initial: InquiryFormState = { status: "idle" };

export function DocumentQuoteForm() {
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [order, setOrder] = useState<ExtractedOrder | null>(null);
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [state, action, pending] = useActionState(submitInquiry, initial);

  async function extract(f: File) {
    setFile(f);
    setExtracting(true);
    setExtractError(null);
    setOrder(null);
    setItems([]);
    try {
      const form = new FormData();
      form.append("file", f);
      if (note.trim()) form.append("note", note.trim());
      const res = await fetch("/api/quote-request/extract", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong reading that file.");
      const result = data as ExtractedOrder;
      setOrder(result);
      setItems(
        result.items.map((it, i) => ({
          ...it,
          id: `${i}-${it.description.slice(0, 20)}`,
          include: true,
        })),
      );
    } catch (err) {
      setExtractError(err instanceof Error ? err.message : "Something went wrong reading that file.");
    } finally {
      setExtracting(false);
    }
  }

  function reset() {
    setFile(null);
    setOrder(null);
    setItems([]);
    setExtractError(null);
  }

  if (state.status === "success") {
    return (
      <div className="border border-line bg-ivory p-8 text-center">
        <h2 className="font-display text-2xl">Request received</h2>
        <p className="mx-auto mt-3 max-w-md text-ink-soft">
          Thanks — we&rsquo;ve got your order and our team will follow up with
          pricing and availability within one business day.
        </p>
        <ButtonLink href="/products" variant="primary" className="mt-6">
          Keep browsing
        </ButtonLink>
      </div>
    );
  }

  const included = items.filter((it) => it.include);
  const err = (k: string) => (state.status === "error" ? state.fieldErrors?.[k] : undefined);

  return (
    <div className="space-y-8">
      {!order && (
        <div>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files?.[0];
              if (f) extract(f);
            }}
            onClick={() => inputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center gap-3 border-2 border-dashed p-10 text-center transition-colors ${
              dragOver ? "border-brass bg-ivory" : "border-line hover:border-brass-dark"
            }`}
          >
            <UploadCloud size={28} className="text-ink-soft" />
            <div>
              <p className="text-sm font-medium">
                {extracting ? "Reading your document…" : "Drop a document here, or click to choose one"}
              </p>
              <p className="mt-1 text-xs text-ink-soft">PDF, JPG, PNG, or WebP — up to 15 MB</p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) extract(f);
              }}
            />
          </div>

          <div className="mt-4">
            <Textarea
              label="Anything to add before we read it? (optional)"
              name="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. this is for a Saturday wedding, we may also want matching napkins"
              rows={2}
            />
          </div>

          {extractError && (
            <p className="mt-4 border-l-2 border-wine bg-ivory px-4 py-3 text-sm text-wine">{extractError}</p>
          )}
        </div>
      )}

      {order && (
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4 border border-line bg-ivory p-4">
            <div className="flex items-start gap-3">
              <FileText size={18} className="mt-0.5 shrink-0 text-brass-dark" />
              <div>
                <p className="text-sm font-medium">{file?.name}</p>
                <p className="mt-1 text-sm text-ink-soft">{order.summary}</p>
              </div>
            </div>
            <button type="button" onClick={reset} className="shrink-0 text-xs text-ink-soft underline">
              Start over
            </button>
          </div>

          {items.length === 0 ? (
            <p className="border border-line bg-ivory p-4 text-sm text-ink-soft">
              We didn&rsquo;t find any linen items in that document — you can still send it
              along using the message field below, or try a different file.
            </p>
          ) : (
            <div>
              <h2 className="mb-3 font-display text-lg">
                {included.length} item{included.length === 1 ? "" : "s"} found — review before sending
              </h2>
              <ul className="divide-y divide-line border border-line">
                {items.map((it, i) => (
                  <li key={it.id} className={`p-3 ${it.include ? "" : "opacity-40"}`}>
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium">
                          {it.matchedProductSlug ? (
                            <Link href={`/product/${it.matchedProductSlug}`} className="hover:underline" target="_blank">
                              {it.matchedProductName || it.description}
                            </Link>
                          ) : (
                            it.description
                          )}
                        </div>
                        <div className="text-xs text-ink-soft">
                          {it.size || "size to confirm"}
                          {it.matchedBackendItemNumber && (
                            <span className="ml-2 font-mono text-[11px] text-ink-soft">
                              [{it.matchedBackendItemNumber}]
                            </span>
                          )}
                        </div>
                        {it.note && <div className="mt-1 text-xs italic text-brass-dark">{it.note}</div>}
                      </div>
                      <label className="flex shrink-0 items-center gap-1.5 text-xs text-ink-soft">
                        Qty
                        <input
                          type="number"
                          min={1}
                          max={9999}
                          value={it.quantity ?? 1}
                          onChange={(e) => {
                            const q = Math.max(1, Number(e.target.value) || 1);
                            setItems((prev) => prev.map((p, pi) => (pi === i ? { ...p, quantity: q } : p)));
                          }}
                          className="w-16 border border-line bg-paper px-2 py-1 text-sm outline-none focus:border-ink"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setItems((prev) => prev.map((p, pi) => (pi === i ? { ...p, include: !p.include } : p)))
                        }
                        aria-label={it.include ? "Remove item" : "Include item"}
                        className="shrink-0 text-ink-soft hover:text-wine"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <form action={action} className="space-y-5">
            <input type="hidden" name="type" value="DOCUMENT" />
            <input type="hidden" name="sourceSummary" value={order.summary} />
            <input
              type="hidden"
              name="items"
              value={JSON.stringify(
                included.map((it) => ({
                  productId: undefined,
                  name: it.matchedProductName || it.description,
                  size: it.size || "",
                  quantity: it.quantity ?? 1,
                  backendItemNumber: it.matchedBackendItemNumber || "",
                })),
              )}
            />

            <div>
              <h2 className="font-display text-lg">Send this to our team</h2>
              <p className="mt-1 text-sm text-ink-soft">
                We&rsquo;ll take this order and follow up with pricing and availability,
                usually within one business day.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" name="name" required error={err("name")} />
              <Field label="Email" name="email" type="email" required error={err("email")} />
              <Field label="Phone" name="phone" type="tel" />
              <Field
                label="Event date"
                name="eventDate"
                type="date"
                defaultValue={order.eventDate || undefined}
              />
              <Field label="Venue" name="venue" defaultValue={order.venue || undefined} />
              <Field label="Guest count" name="guestCount" defaultValue={order.guestCount || undefined} />
            </div>
            <Textarea label="Anything else we should know?" name="message" />

            {/* Honeypot */}
            <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

            {state.status === "error" && (
              <p className="border-l-2 border-wine bg-ivory px-4 py-3 text-sm text-wine">{state.message}</p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="bg-brass px-8 py-3 text-sm font-medium text-white hover:bg-brass-dark disabled:opacity-50"
            >
              {pending ? "Sending…" : "Send this order"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
