import type { Metadata } from "next";
import { getFacets, searchCatalog } from "@/lib/catalog";
import { hasActiveFilters, parseCatalogQuery } from "@/lib/catalog-query";
import { CatalogBrowser } from "@/components/catalog/catalog-browser";

export async function generateMetadata({
  searchParams,
}: PageProps<"/products">): Promise<Metadata> {
  const query = parseCatalogQuery(await searchParams);
  // Filtered views collapse to the base catalog page (avoids a canonical per
  // filter combo); an unfiltered page 2+ is self-canonical so crawlers don't
  // get told to ignore every product beyond page 1.
  const canonical =
    !hasActiveFilters(query) && (query.page ?? 1) > 1 ? `/products?page=${query.page}` : "/products";
  return {
    title: "All Linen Rentals",
    description:
      "Browse tablecloths, napkins, runners, cuffs, spandex and chair covers. Filter by color, fabric or size, then send Windy City Linen your shortlist.",
    alternates: { canonical },
  };
}

export default async function ProductsPage({ searchParams }: PageProps<"/products">) {
  const query = parseCatalogQuery(await searchParams);
  const [facets, result] = await Promise.all([getFacets(), searchCatalog(query)]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
      <h1 className="font-display text-3xl">All products</h1>
      <p className="mt-2 max-w-xl text-ink-soft">
        Every linen in the collection. Use the filters to narrow by color, fabric,
        size or collection — pricing comes directly from our team.
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
