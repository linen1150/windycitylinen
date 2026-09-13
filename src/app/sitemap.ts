import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { SITE } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([
    db.category.findMany({ select: { slug: true } }),
    db.product.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
  ]);

  // /search and /my-inspirations are intentionally excluded: /search is
  // noindex (query results are duplicate content) and /my-inspirations is
  // a client-only, localStorage-based page with no content worth indexing
  // (it carries a noindex meta tag rather than a robots.txt block).
  //
  // No changeFrequency/priority on any entry — Google ignores both, so
  // they're just noise. lastModified is only set where it reflects a real
  // content-change date (products); static pages don't track that, so it's
  // omitted rather than faked.
  const staticRoutes = [
    "",
    "/products",
    "/gallery",
    "/design-center",
    "/about",
    "/contact",
    "/faq",
    "/terms",
    "/linen-rentals-milwaukee",
  ];

  return [
    ...staticRoutes.map((path) => ({ url: `${SITE.url}${path}` })),
    ...categories.map((c) => ({ url: `${SITE.url}/products/${c.slug}` })),
    ...products.map((p) => ({
      url: `${SITE.url}/product/${p.slug}`,
      lastModified: p.updatedAt,
    })),
  ];
}
