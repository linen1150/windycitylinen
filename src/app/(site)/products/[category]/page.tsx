import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCategoryBySlug, getFacets, searchCatalog } from "@/lib/catalog";
import { parseCatalogQuery } from "@/lib/catalog-query";
import { CatalogBrowser } from "@/components/catalog/catalog-browser";
import { breadcrumbSchema } from "@/lib/structured-data";
import { CATEGORY_CONTENT } from "@/lib/category-content";

export async function generateStaticParams() {
  const categories = await db.category.findMany({ select: { slug: true } });
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps<"/products/[category]">): Promise<Metadata> {
  const { category } = await params;
  const cat = await getCategoryBySlug(category);
  if (!cat) return {};

  const query = parseCatalogQuery(await searchParams);
  const otherFiltersActive = Boolean(
    query.fabric?.length || query.color?.length || query.size?.length || query.collection?.length,
  );
  const canonical =
    !otherFiltersActive && (query.page ?? 1) > 1
      ? `/products/${cat.slug}?page=${query.page}`
      : `/products/${cat.slug}`;

  const content = CATEGORY_CONTENT[cat.slug];

  return {
    title: content?.title ?? `${cat.name} Rentals`,
    description:
      content?.description ??
      `${cat.name} for weddings, galas and corporate events across Chicago and Milwaukee. Filter by color, fabric and size, then send your shortlist to Windy City Linen.`,
    alternates: { canonical },
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

  const content = CATEGORY_CONTENT[cat.slug];

  const breadcrumbs = breadcrumbSchema([
    { name: "Products", path: "/products" },
    { name: cat.name, path: `/products/${cat.slug}` },
  ]);
  const faqSchema = content
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: content.faqs.map(({ q, a }) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
      }
    : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <nav className="mb-4 text-xs text-ink-soft">
        <Link href="/products" className="hover:underline">Products</Link> / {cat.name}
      </nav>
      <h1 className="font-display text-3xl">{cat.name}</h1>

      {content?.intro.map((p, i) => (
        <p key={i} className="mt-3 max-w-2xl text-ink-soft">
          {p}
        </p>
      ))}

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

      {content && content.faqs.length > 0 && (
        <section className="mt-14 max-w-2xl">
          <h2 className="font-display text-2xl">{cat.name} questions</h2>
          <div className="mt-4 divide-y divide-line border-y border-line">
            {content.faqs.map((item) => (
              <details key={item.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg">
                  {item.q}
                  <span className="shrink-0 text-brass-dark transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-ink-soft">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
