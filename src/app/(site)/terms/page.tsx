import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Windy City Linen's policies on order additions, cancellations, delivery windows and missing linen.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-8">
      <h1 className="font-display text-3xl">Terms &amp; Conditions</h1>

      <h2 className="mt-8 font-display text-xl">Please help us to serve you better</h2>
      <p className="mt-3 text-ink-soft">
        Serving our clients whose needs and orders change daily, if not hourly, is our
        primary concern. We will often have new inventory produced for your event based
        on your order confirmation. The following policies are in place to guide you
        through the ordering process so that every order can be filled in a timely
        manner. Thank you for your business!
      </p>

      <h2 className="mt-8 font-display text-xl">Additions to an order</h2>
      <p className="mt-3 text-ink-soft">
        Additions to an order may be made at no charge, based on the availability of the
        items requested. Additions may be treated as a separate order if the original
        order has already left our premises, and may be subject to a timed-delivery fee
        based on your schedule requirements.
      </p>

      <h2 className="mt-8 font-display text-xl">Cancellation of an order</h2>
      <p className="mt-3 text-ink-soft">
        To avoid a 40% restocking fee, we must receive a cancellation request no later
        than 12&nbsp;pm, two business days before the delivery date on your contract
        (excluding holidays). Cancellation requests must be sent by email to{" "}
        <a href={`mailto:${SITE.ordersEmail}`} className="text-wine underline">
          {SITE.ordersEmail}
        </a>{" "}
        — verbal communication and voice messages are not accepted. We&rsquo;ll send you
        a cancellation confirmation once your request is received; your sent email
        serves as proof of the request. Once an order has left for delivery, the full
        payment terms of the contract are in effect.
      </p>

      <h2 className="mt-8 font-display text-xl">Delivery</h2>
      <p className="mt-3 text-ink-soft">
        Standard deliveries are made between 9:00&nbsp;a.m. and 6:00&nbsp;p.m., Monday
        through Friday. Rush, timed and weekend/holiday deliveries are available —
        call{" "}
        <a href={`tel:${SITE.phoneHref}`} className="text-wine underline">
          {SITE.phone}
        </a>{" "}
        for pricing.
      </p>

      <h2 className="mt-8 font-display text-xl">Missing linen</h2>
      <p className="mt-3 text-ink-soft">
        All linen provided through a Windy City Linen order must be returned in full.
        Any items not returned are considered missing, and a replacement fee is charged
        per missing piece. Please account for all rented items at the end of your event
        to avoid additional charges.
      </p>
    </div>
  );
}
