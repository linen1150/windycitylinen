import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Windy City Linen has dressed tables for Chicago and Milwaukee events since 2008, with showrooms in Wheeling, IL and Elm Grove, WI.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-8">
      <h1 className="font-display text-3xl">About Windy City Linen</h1>
      <div className="mt-6 space-y-4 text-ink-soft">
        <p>
          Founded in Chicago in {SITE.since}, Windy City Linen has spent nearly two
          decades helping planners, caterers and hosts set tables that match the
          scale of their event — from intimate dinners to two-thousand-guest galas.
        </p>
        <p>
          With showrooms in {SITE.showrooms[0]} and {SITE.showrooms[1]}, our team
          works directly with clients on fabric, color and sizing before any order
          ships — pressed, packed and delivered ready to lay.
        </p>
        <p>
          We don&rsquo;t publish pricing or run a checkout. Tell us what you&rsquo;re
          planning and we&rsquo;ll build a quote around your quantities, dates and
          delivery zone.
        </p>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="/products" variant="primary">Browse the collection</ButtonLink>
        <ButtonLink href="/contact" variant="secondary">Contact the team</ButtonLink>
      </div>
    </div>
  );
}
