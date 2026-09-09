import { CatalogFilters, type CatalogFacets } from "./catalog-filters";
import { CatalogPagination } from "./catalog-pagination";
import { ProductCard } from "./product-card";
import type { ProductCardData } from "@/lib/catalog";

export function CatalogBrowser({
  facets,
  products,
  total,
  page,
  pageCount,
  hideCategoryFilter = false,
  emptyMessage = "No items match those filters yet.",
}: {
  facets: CatalogFacets;
  products: ProductCardData[];
  total: number;
  page: number;
  pageCount: number;
  hideCategoryFilter?: boolean;
  emptyMessage?: string;
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
      <aside className="lg:border-r lg:border-line lg:pr-6">
        <CatalogFilters facets={facets} hideCategory={hideCategoryFilter} />
      </aside>
      <div>
        <p className="mb-5 text-sm text-ink-soft">
          {total} {total === 1 ? "item" : "items"}
        </p>
        {products.length === 0 ? (
          <p className="py-16 text-center text-ink-soft">{emptyMessage}</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
        <CatalogPagination page={page} pageCount={pageCount} />
      </div>
    </div>
  );
}
