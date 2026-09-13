"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export function CatalogPagination({
  page,
  pageCount,
}: {
  page: number;
  pageCount: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (pageCount <= 1) return null;

  const hrefFor = (p: number) => {
    const params = new URLSearchParams(searchParams);
    if (p <= 1) params.delete("page");
    else params.set("page", String(p));
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  return (
    <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className="border border-line px-4 py-2 text-sm hover:border-ink">
          Previous
        </Link>
      ) : (
        <span className="border border-line px-4 py-2 text-sm opacity-40">Previous</span>
      )}
      <span className="px-3 text-sm text-ink-soft">
        Page {page} of {pageCount}
      </span>
      {page < pageCount ? (
        <Link href={hrefFor(page + 1)} className="border border-line px-4 py-2 text-sm hover:border-ink">
          Next
        </Link>
      ) : (
        <span className="border border-line px-4 py-2 text-sm opacity-40">Next</span>
      )}
    </nav>
  );
}
