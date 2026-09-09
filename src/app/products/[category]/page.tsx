import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCategoryBySlug, getFacets, searchCatalog } from "@/lib/catalog";
import { parseCatalogQuery } from "@/lib/catalog-query";
import { CatalogBrowser } from "@/components/catalog/catalog-browser";

export async function generateStaticParams() {
  const categories = await db.category.findMany({ select: { slug: true } });
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/products/[category]">): Promise<Metadata> {
  const { category } = await params;
  const cat = await getCategoryBySlug(category);
  if (!cat) return {};
  return {
    title: `${cat.name} Rentals`,
    description: `${cat.name} for weddings, galas and corporate events across Chicago and Milwaukee. Filter by color, fabric and size, then request a quote from Windy City Linen.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps<"/products/[category]">) {
  const { category } = await params;
  const cat = await getCategoryBySlug(category);
  if (!cat) notFound();

  const base = parseCatalogQuery(await searchParams);
  const query = { ...base, category: [cat.slug] };
  const [facets, result] = await Promise.all([getFacets(), searchCatalog(query)]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
      <nav className="mb-4 text-xs text-ink-soft">
        <a href="/products" className="hover:underline">Products</a> / {cat.name}
      </nav>
      <h1 className="font-display text-3xl">{cat.name}</h1>
      <div className="mt-8">
        <CatalogBrowser
          facets={facets}
          products={result.products}
          total={result.total}
          page={result.page}
          pageCount={result.pageCount}
          hideCategoryFilter
        />
      </div>
    </div>
  );
}
