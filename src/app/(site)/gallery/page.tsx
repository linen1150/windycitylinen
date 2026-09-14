import type { Metadata } from "next";
import { db } from "@/lib/db";
import { GalleryGrid } from "./gallery-grid";
import { CatalogPagination } from "@/components/catalog/catalog-pagination";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Real events dressed by Windy City Linen — tablecloths, runners, napkins and chair covers from weddings, galas and corporate events across Chicagoland and Milwaukee.",
  alternates: { canonical: "/gallery" },
};

const PAGE_SIZE = 48;

export default async function GalleryPage({ searchParams }: PageProps<"/gallery">) {
  const sp = await searchParams;
  const requestedPage = Math.max(
    1,
    Number.parseInt((Array.isArray(sp.page) ? sp.page[0] : sp.page) ?? "1", 10) || 1,
  );

  const total = await db.galleryItem.count({ where: { published: true } });
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  // A page beyond the last one (stale bookmark, hand-edited URL) used to render
  // an empty grid instead of clamping — dead end with no path back.
  const page = Math.min(requestedPage, pageCount);

  const items = await db.galleryItem.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8">
      <h1 className="font-display text-3xl">Gallery</h1>
      <p className="mt-2 max-w-xl text-ink-soft">
        A look at real events dressed with our linens — weddings, galas and
        corporate events across Chicagoland and Milwaukee.
      </p>

      {total === 0 ? (
        <div className="mt-10 border border-line bg-ivory p-10 text-center text-ink-soft">
          Photos coming soon.
        </div>
      ) : (
        <>
          <GalleryGrid items={items} startNumber={(page - 1) * PAGE_SIZE + 1} />
          <CatalogPagination page={page} pageCount={pageCount} />
        </>
      )}
    </div>
  );
}
