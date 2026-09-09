import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-8">
      <p className="font-display text-sm uppercase tracking-widest text-brass-dark">
        404
      </p>
      <h1 className="mt-3 font-display text-3xl">We couldn&rsquo;t find that page.</h1>
      <p className="mt-3 text-ink-soft">
        It may have moved, or the link may be out of date. Try the catalog or head
        back home.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <ButtonLink href="/" variant="primary">Back to home</ButtonLink>
        <ButtonLink href="/products" variant="secondary">Browse products</ButtonLink>
      </div>
      <p className="mt-6 text-sm text-ink-soft">
        Looking for something specific?{" "}
        <Link href="/search" className="text-wine underline">Search the catalog</Link>.
      </p>
    </div>
  );
}
