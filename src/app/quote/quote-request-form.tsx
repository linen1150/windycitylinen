"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useQuote } from "@/components/quote/quote-store";
import { ProductImage } from "@/components/catalog/product-image";
import { submitInquiry, type InquiryFormState } from "@/app/actions";
import { Field, Textarea } from "@/components/ui/field";

const initial: InquiryFormState = { status: "idle" };

export function QuoteRequestForm() {
  const { lines, count, remove, setQuantity, clear } = useQuote();
  const [state, action, pending] = useActionState(submitInquiry, initial);

  useEffect(() => {
    if (state.status === "success") clear();
  }, [state.status, clear]);

  if (state.status === "success") {
    return (
      <div className="border border-line bg-ivory p-8 text-center">
        <h2 className="font-display text-2xl">Request received</h2>
        <p className="mx-auto mt-3 max-w-md text-ink-soft">
          Thanks — your quote request is in. A member of our team will follow up
          within one business day.
        </p>
        <Link href="/products" className="mt-6 inline-block bg-wine px-6 py-3 text-sm font-medium text-white">
          Keep browsing
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="type" value="QUOTE_TRAY" />
      <input type="hidden" name="items" value={JSON.stringify(lines)} />

      <section>
        <h2 className="mb-3 font-display text-lg">
          Items ({count})
        </h2>
        {lines.length === 0 ? (
          <p className="border border-line p-4 text-sm text-ink-soft">
            Your list is empty.{" "}
            <Link href="/products" className="text-wine underline">Browse the catalog</Link>{" "}
            and add items, or send a general message from the{" "}
            <Link href="/contact" className="text-wine underline">contact page</Link>.
          </p>
        ) : (
          <ul className="divide-y divide-line border border-line">
            {lines.map((line, i) => (
              <li key={`${line.productId}-${line.size}`} className="flex items-center gap-4 p-3">
                <ProductImage
                  src={line.imageUrl}
                  alt={line.name}
                  colorHex={line.colorHex}
                  className="size-14 shrink-0"
                />
                <div className="flex-1">
                  <Link href={`/product/${line.slug}`} className="text-sm font-medium hover:underline">
                    {line.name}
                  </Link>
                  <div className="text-xs text-ink-soft">{line.size || "Size TBD"}</div>
                </div>
                <label className="text-xs text-ink-soft">
                  Qty{" "}
                  <input
                    type="number"
                    min={1}
                    value={line.quantity}
                    onChange={(e) => setQuantity(i, Number.parseInt(e.target.value, 10) || 1)}
                    className="w-16 border border-line px-2 py-1 text-sm"
                  />
                </label>
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
        )}
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-lg">Your details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" name="name" required error={state.status === "error" ? state.fieldErrors?.name : undefined} />
          <Field label="Email" name="email" type="email" required error={state.status === "error" ? state.fieldErrors?.email : undefined} />
          <Field label="Phone" name="phone" type="tel" />
          <Field label="Event date" name="eventDate" type="date" />
          <Field label="Venue" name="venue" />
          <Field label="Guest count" name="guestCount" />
        </div>
        <Textarea label="Anything else we should know?" name="message" />
        {/* Honeypot */}
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden
        />
      </section>

      {state.status === "error" && (
        <p className="border-l-2 border-wine bg-ivory px-4 py-3 text-sm text-wine">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-wine px-8 py-3 text-sm font-medium text-white hover:bg-[#652638] disabled:opacity-50"
      >
        {pending ? "Sending…" : "Submit quote request"}
      </button>
      <p className="text-xs text-ink-soft">
        No pricing is shown anywhere on this site. Submitting sends your list and
        details to our team for a personalized quote.
      </p>
    </form>
  );
}
