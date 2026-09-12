import type { Metadata } from "next";
import { getFacets, searchCatalog } from "@/lib/catalog";
import { parseCatalogQuery } from "@/lib/catalog-query";
import { CatalogBrowser } from "@/components/catalog/catalog-browser";
import { SearchBox } from "@/components/catalog/search-box";

export const metadata: Metadata = {
  title: "Search the Catalog",
  description:
    "Search all 1,200+ Windy City Linen rentals by color, fabric, size, collection or descriptive keyword, then send us your shortlist.",
  robots: { index: false, follow: true },
};

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const query = parseCatalogQuery(await searchParams);
  const [facets, result] = await Promise.all([getFacets(), searchCatalog(query)]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
      <h1 className="font-display text-3xl">Search the catalog</h1>
      <p className="mt-2 max-w-xl text-ink-soft">
        Free-text search across product names, colors, fabrics, sizes and descriptive
        tags — combine it with the filters below.
      </p>
      <div className="mt-6">
        <SearchBox />
      </div>
      <div className="mt-8">
        <CatalogBrowser
          facets={facets}
          products={result.products}
          total={result.total}
          page={result.page}
          pageCount={result.pageCount}
          emptyMessage={
            query.q
              ? `No results for “${query.q}”. Try fewer or different words.`
              : "No items match those filters yet."
          }
        />
      </div>
    </div>
  );
}
