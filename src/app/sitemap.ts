import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { SITE } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([
    db.category.findMany({ select: { slug: true } }),
    db.product.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
  ]);

  const staticRoutes = [
    "",
    "/products",
    "/search",
    "/gallery",
    "/design-center",
    "/about",
    "/contact",
    "/my-inspirations",
    "/faq",
  ];

  return [
    ...staticRoutes.map((path) => ({
      url: `${SITE.url}${path}`,
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : 0.7,
    })),
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
