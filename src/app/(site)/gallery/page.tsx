import type { Metadata } from "next";
import { db } from "@/lib/db";
import { ProductImage } from "@/components/catalog/product-image";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Real events dressed by Windy City Linen — tablecloths, runners, napkins and chair covers from weddings, galas and corporate events across Chicagoland and Milwaukee.",
};

export default async function GalleryPage() {
  const items = await db.galleryItem.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8">
      <h1 className="font-display text-3xl">Gallery</h1>
      <p className="mt-2 max-w-xl text-ink-soft">
        A look at real events dressed with our linens — weddings, galas and
        corporate events across Chicagoland and Milwaukee.
      </p>

      {items.length === 0 ? (
        <div className="mt-10 border border-line bg-ivory p-10 text-center text-ink-soft">
          Photos coming soon.
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <figure key={item.id}>
              <ProductImage
                src={item.imagePath || null}
                alt={item.caption || "Windy City Linen event photo"}
                colorHex={null}
                className="aspect-square w-full border border-line"
              />
              {item.caption && (
                <figcaption className="mt-1.5 text-xs text-ink-soft">{item.caption}</figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
