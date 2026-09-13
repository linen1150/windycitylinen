"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

/** Page numbers to show: first, last, current ± 1, with gaps collapsed to null. */
function pageList(current: number, total: number): (number | null)[] {
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | null)[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) out.push(null);
    out.push(sorted[i]);
  }
  return out;
}

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
    <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className="border border-line px-4 py-2 text-sm hover:border-ink">
          Previous
        </Link>
      ) : (
        <span className="border border-line px-4 py-2 text-sm opacity-40">Previous</span>
      )}

      {pageList(page, pageCount).map((p, i) =>
        p === null ? (
          <span key={`gap-${i}`} className="px-1 text-sm text-ink-soft">
            &hellip;
          </span>
        ) : p === page ? (
          <span key={p} aria-current="page" className="border border-ink bg-ink px-3 py-2 text-sm text-white">
            {p}
          </span>
        ) : (
          <Link key={p} href={hrefFor(p)} className="border border-line px-3 py-2 text-sm hover:border-ink">
            {p}
          </Link>
        ),
      )}

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
