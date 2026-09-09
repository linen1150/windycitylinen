"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function CatalogPagination({
  page,
  pageCount,
}: {
  page: number;
  pageCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (pageCount <= 1) return null;

  const go = (p: number) => {
    const params = new URLSearchParams(searchParams);
    if (p <= 1) params.delete("page");
    else params.set("page", String(p));
    router.replace(`${pathname}?${params.toString()}`, { scroll: true });
  };

  return (
    <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
      <button
        onClick={() => go(page - 1)}
        disabled={page <= 1}
        className="border border-line px-4 py-2 text-sm disabled:opacity-40"
      >
        Previous
      </button>
      <span className="px-3 text-sm text-ink-soft">
        Page {page} of {pageCount}
      </span>
      <button
        onClick={() => go(page + 1)}
        disabled={page >= pageCount}
        className="border border-line px-4 py-2 text-sm disabled:opacity-40"
      >
        Next
      </button>
    </nav>
  );
}
