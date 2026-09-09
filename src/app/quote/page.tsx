import type { Metadata } from "next";
import { QuoteRequestForm } from "./quote-request-form";

export const metadata: Metadata = {
  title: "Request a Quote",
  description:
    "Review the linens you've selected and send them to the Windy City Linen team as one quote request. No pricing or checkout — we follow up within one business day.",
};

export default function QuotePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-8">
      <h1 className="font-display text-3xl">Request a quote</h1>
      <p className="mt-2 text-ink-soft">
        This sends your selected items to our team as a single request. We&rsquo;ll
        reply with pricing and availability within one business day. Nothing is
        charged and there is no checkout.
      </p>
      <div className="mt-8">
        <QuoteRequestForm />
      </div>
    </div>
  );
}
