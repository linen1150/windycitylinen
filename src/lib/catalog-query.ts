import type { CatalogQuery } from "@/lib/catalog";

type RawSearchParams = Record<string, string | string[] | undefined>;

const asArray = (v: string | string[] | undefined): string[] =>
  v === undefined ? [] : Array.isArray(v) ? v : [v];

/** Parse Next.js `searchParams` into a typed CatalogQuery. */
export function parseCatalogQuery(sp: RawSearchParams): CatalogQuery {
  const pageRaw = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const page = Math.max(1, Number.parseInt(pageRaw ?? "1", 10) || 1);
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim() || undefined;
  return {
    q,
    category: asArray(sp.category),
    fabric: asArray(sp.fabric),
    color: asArray(sp.color),
    size: asArray(sp.size),
    collection: asArray(sp.collection),
    page,
  };
}

/** True when any facet filter (not counting free-text `q`) is active. */
export function hasActiveFilters(query: CatalogQuery): boolean {
  return Boolean(
    query.category?.length ||
      query.fabric?.length ||
      query.color?.length ||
      query.size?.length ||
      query.collection?.length,
  );
}
