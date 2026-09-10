import type { Metadata } from "next";
import { InspirationsList } from "./inspirations-list";

export const metadata: Metadata = {
  title: "My Inspirations",
  description:
    "The linens you've saved from the Windy City Linen catalog. Adjust quantities, then send the list to our team as one quote request. Saved to this browser, no account needed.",
};

export default function MyInspirationsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-8">
      <h1 className="font-display text-3xl">My Inspirations</h1>
      <p className="mt-2 max-w-xl text-ink-soft">
        Everything you&rsquo;ve saved, in one place — set the quantities you need and
        send the whole list to our team for a quote. No account, no pricing, no
        checkout. Your list is saved to this browser.
      </p>
      <div className="mt-8">
        <InspirationsList />
      </div>
    </div>
  );
}
