import type { Metadata } from "next";
import { getFacets, searchCatalog } from "@/lib/catalog";
import { parseCatalogQuery } from "@/lib/catalog-query";
import { CatalogBrowser } from "@/components/catalog/catalog-browser";

export const metadata: Metadata = {
  title: "All Linen Rentals",
  description:
    "Browse the full Windy City Linen catalog — tablecloths, overlays, napkins, table runners, cuffs, spandex and chair covers. Filter by color, fabric, size and collection, then request a quote.",
};

export default async function ProductsPage({ searchParams }: PageProps<"/products">) {
  const query = parseCatalogQuery(await searchParams);
  const [facets, result] = await Promise.all([getFacets(), searchCatalog(query)]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
      <h1 className="font-display text-3xl">All products</h1>
      <p className="mt-2 max-w-xl text-ink-soft">
        Every linen in the collection. Use the filters to narrow by color, fabric,
        size or collection — pricing is quoted directly by our team.
      </p>
      <div className="mt-8">
        <CatalogBrowser
          facets={facets}
          products={result.products}
          total={result.total}
          page={result.page}
          pageCount={result.pageCount}
        />
      </div>
    </div>
  );
}
