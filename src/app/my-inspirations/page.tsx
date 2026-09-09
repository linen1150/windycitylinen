import type { Metadata } from "next";
import { InspirationsList } from "./inspirations-list";

export const metadata: Metadata = {
  title: "My Inspirations",
  description:
    "Your saved linens from the Windy City Linen catalog — compare options and share a shortlist with your planner. Saved to this browser, no account needed.",
};

export default function MyInspirationsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-8">
      <h1 className="font-display text-3xl">My Inspirations</h1>
      <p className="mt-2 max-w-xl text-ink-soft">
        Tap the heart on any linen to save it here. It&rsquo;s a private shortlist for
        comparing options or sharing with your planner — saved to this browser, with
        no account or email required. When you&rsquo;re ready, add pieces to a quote
        request and our team follows up with pricing.
      </p>
      <div className="mt-8">
        <InspirationsList />
      </div>
    </div>
  );
}
