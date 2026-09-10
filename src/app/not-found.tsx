import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <Link href="/" className="font-script text-3xl text-ink">
        Windy City Linen
      </Link>
      <p className="mt-6 font-display text-2xl">We couldn&rsquo;t find that page.</p>
      <p className="mt-2 text-sm text-ink-soft">
        It may have moved, or the link may be out of date.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/"
          className="bg-brass px-6 py-3 text-sm font-medium text-white hover:bg-brass-dark"
        >
          Back to home
        </Link>
        <Link href="/products" className="border border-ink px-6 py-3 text-sm font-medium">
          Browse products
        </Link>
      </div>
    </div>
  );
}
