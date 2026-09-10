"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useInspirations } from "@/components/inspirations/inspirations-store";
import { ProductImage } from "@/components/catalog/product-image";
import { submitInquiry, type InquiryFormState } from "@/app/actions";
import { Field, Textarea } from "@/components/ui/field";
import { ButtonLink } from "@/components/ui/button";

const initial: InquiryFormState = { status: "idle" };

export function InspirationsList() {
  const { lines, count, remove, clear, hydrated } = useInspirations();
  const [state, action, pending] = useActionState(submitInquiry, initial);

  useEffect(() => {
    if (state.status === "success") clear();
  }, [state.status, clear]);

  if (!hydrated) return null;

  if (state.status === "success") {
    return (
      <div className="border border-line bg-ivory p-8 text-center">
        <h2 className="font-display text-2xl">List received</h2>
        <p className="mx-auto mt-3 max-w-md text-ink-soft">
          Thanks — your list is with our team. A member of our team will follow up
          with pricing and availability within one business day.
        </p>
        <ButtonLink href="/products" variant="primary" className="mt-6">
          Keep browsing
        </ButtonLink>
      </div>
    );
  }

  if (count === 0) {
    return (
      <div className="border border-line bg-ivory p-8 text-center">
        <p className="text-ink-soft">
          You haven&rsquo;t saved anything yet. Use the bookmark on any linen while you
          browse, or &ldquo;Add to My Inspirations&rdquo; on a product page.
        </p>
        <ButtonLink href="/products" variant="primary" className="mt-4">
          Browse the collection
        </ButtonLink>
      </div>
    );
  }

  const err = (k: string) => (state.status === "error" ? state.fieldErrors?.[k] : undefined);

  return (
    <div className="space-y-10">
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-display text-lg">
            {count} {count === 1 ? "linen" : "linens"} saved
          </h2>
          <button onClick={clear} className="text-xs text-ink-soft underline">
            Clear list
          </button>
        </div>
        <ul className="divide-y divide-line border border-line">
          {lines.map((line, i) => (
            <li key={`${line.productId}-${line.size}`} className="flex items-center gap-4 p-3">
              <Link href={`/product/${line.slug}`}>
                <ProductImage
                  src={line.imageUrl}
                  alt={line.name}
                  colorHex={line.colorHex}
                  className="size-16 shrink-0"
                />
              </Link>
              <div className="flex-1">
                <Link href={`/product/${line.slug}`} className="text-sm font-medium hover:underline">
                  {line.name}
                </Link>
                <div className="text-xs text-ink-soft">
                  {line.fabric} · {line.size || "size to confirm"}
                </div>
              </div>
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-xs text-ink-soft underline"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </section>

      <form action={action} className="space-y-5">
        <input type="hidden" name="type" value="QUOTE_TRAY" />
        <input type="hidden" name="items" value={JSON.stringify(lines)} />

        <div>
          <h2 className="font-display text-lg">Send this list to our team</h2>
          <p className="mt-1 text-sm text-ink-soft">
            We&rsquo;ll take your list and follow up with pricing and availability,
            usually within one business day. No pricing or checkout here.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" name="name" required error={err("name")} />
          <Field label="Email" name="email" type="email" required error={err("email")} />
          <Field label="Phone" name="phone" type="tel" />
          <Field label="Event date" name="eventDate" type="date" />
          <Field label="Venue" name="venue" />
          <Field label="Guest count" name="guestCount" />
        </div>
        <Textarea label="Anything else we should know? (sizes, colors, timing…)" name="message" />

        {/* Honeypot */}
        <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

        {state.status === "error" && (
          <p className="border-l-2 border-wine bg-ivory px-4 py-3 text-sm text-wine">
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="bg-brass px-8 py-3 text-sm font-medium text-white hover:bg-brass-dark disabled:opacity-50"
        >
          {pending ? "Sending…" : "Send my list"}
        </button>
      </form>
    </div>
  );
}
