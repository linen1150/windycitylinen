import type { Metadata } from "next";
import { DocumentQuoteForm } from "./document-quote-form";

export const metadata: Metadata = {
  title: "Request a Quote",
  description:
    "Drop in an event order, linen wish-list, or spec sheet and we'll read it, match it to real inventory, and get it ready for our team to quote.",
  robots: { index: false, follow: false },
};

export default function QuotePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-8">
      <h1 className="font-display text-3xl">Request a Quote</h1>
      <p className="mt-2 max-w-xl text-ink-soft">
        Have an existing order, linen list, or spec sheet? Drop it in below and
        we&rsquo;ll read it, match each item to our inventory, and pass it straight
        to our team — no need to re-type anything. No pricing or checkout here;
        we follow up directly.
      </p>
      <div className="mt-8">
        <DocumentQuoteForm />
      </div>
    </div>
  );
}
