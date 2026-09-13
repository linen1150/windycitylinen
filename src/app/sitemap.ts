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
  // (also Disallow'd in robots.txt — listing it here would contradict that).
  const staticRoutes = ["", "/products", "/gallery", "/design-center", "/about", "/contact", "/faq", "/terms"];

  return [
    ...staticRoutes.map((path) => ({
      url: `${SITE.url}${path}`,
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : 0.7,
    })),
    {
      url: `${SITE.url}/linen-rentals-milwaukee`,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    },
    ...categories.map((c) => ({
      url: `${SITE.url}/products/${c.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...products.map((p) => ({
      url: `${SITE.url}/product/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
