import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export const PAGE_SIZE = 24;

// The 15 filter color families, with an anchor hex for the swatch dot.
export const COLOR_GROUPS: { name: string; hex: string }[] = [
  { name: "Black", hex: "#20232A" },
  { name: "White", hex: "#FAFAFA" },
  { name: "Ivory", hex: "#F1EEE3" },
  { name: "Blue", hex: "#3E6FA6" },
  { name: "Brown/Beige/Cafe/Tan", hex: "#B6A08A" },
  { name: "Copper", hex: "#B98A3E" },
  { name: "Gold", hex: "#C9A227" },
  { name: "Green", hex: "#3E8E4F" },
  { name: "Gray", hex: "#8B9299" },
  { name: "Multicolor", hex: "#B87BB0" },
  { name: "Orange", hex: "#E8752E" },
  { name: "Pink/Blush", hex: "#D9AFAE" },
  { name: "Purple/Burgundy", hex: "#6C4A9C" },
  { name: "Red", hex: "#B12A2A" },
  { name: "Yellow", hex: "#EFCB3B" },
];

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  fabric: string;
  colorName: string;
  colorHex: string | null;
  limited: boolean;
  reverseSide: boolean;
  imageUrl: string | null;
};

export type ProductDetailData = ProductCardData & {
  keywords: string;
  sizes: string[];
  collections: string[];
};

/** Singular, human noun for a category (for titles and copy). */
export function categoryNoun(category: string): string {
  const map: Record<string, string> = {
    "Tablecloths and Overlays": "tablecloth",
    Napkins: "napkin",
    "Table Runners": "table runner",
    Cuffs: "linen cuff",
    Spandex: "spandex cover",
    "Chair Covers": "chair cover",
  };
  return map[category] ?? category.replace(/s$/, "").toLowerCase();
}

/** Public URL for a product photo, or null if none is on file yet. */
export function imageUrl(category: string, filename: string | null): string | null {
  if (!filename) return null;
  // Admins can enter a bare filename (resolved against the category folder),
  // an absolute site path, or a full URL.
  if (/^(https?:)?\/\//.test(filename) || filename.startsWith("/")) return filename;
  return `/images/${category}/${filename}`;
}

// The Spandex rows in the legacy export use form-factor labels ("Banquets",
// "High Boys", "Rounds") in the fabric column; keep them as data but hide them
// from the fabric filter until the taxonomy is cleaned up in the admin panel.
const HIDDEN_FABRIC_SLUGS = new Set(["banquets", "high-boys", "rounds"]);

export const getFacets = cache(async () => {
  const [categories, fabrics, sizes, collections] = await Promise.all([
    db.category.findMany({ orderBy: { order: "asc" } }),
    db.fabric.findMany({ orderBy: { name: "asc" } }),
    db.size.findMany({ orderBy: { order: "asc" } }),
    db.collection.findMany({ orderBy: { order: "asc" } }),
  ]);
  return {
    categories,
    fabrics: fabrics.filter((f) => !HIDDEN_FABRIC_SLUGS.has(f.slug)),
    sizes,
    collections,
    colorGroups: COLOR_GROUPS,
  };
});

export type CatalogQuery = {
  q?: string;
  category?: string[]; // slugs
  fabric?: string[]; // slugs
  color?: string[]; // color group names
  size?: string[]; // slugs
  collection?: string[]; // slugs
  page?: number;
};

function toCard(p: Prisma.ProductGetPayload<{ include: { category: true; fabric: true } }>): ProductCardData {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category.name,
    categorySlug: p.category.slug,
    fabric: p.fabric.name,
    colorName: p.colorName,
    colorHex: p.colorHex,
    limited: p.limited,
    reverseSide: p.reverseSide,
    imageUrl: imageUrl(p.category.name, p.imageFilename),
  };
}

/** Faceted catalog search. Returns a page of products plus the total match count. */
export async function searchCatalog(query: CatalogQuery) {
  const page = Math.max(1, query.page ?? 1);
  const and: Prisma.ProductWhereInput[] = [{ published: true }];

  if (query.q?.trim()) {
    const terms = query.q.trim().split(/\s+/).slice(0, 6);
    for (const term of terms) {
      and.push({
        OR: [
          { name: { contains: term, mode: "insensitive" } },
          { colorName: { contains: term, mode: "insensitive" } },
          { keywords: { contains: term, mode: "insensitive" } },
          { category: { name: { contains: term, mode: "insensitive" } } },
          { fabric: { name: { contains: term, mode: "insensitive" } } },
          { sizes: { some: { size: { name: { contains: term, mode: "insensitive" } } } } },
          { collections: { some: { collection: { name: { contains: term, mode: "insensitive" } } } } },
        ],
      });
    }
  }
  if (query.category?.length) and.push({ category: { slug: { in: query.category } } });
  if (query.fabric?.length) and.push({ fabric: { slug: { in: query.fabric } } });
  if (query.color?.length) and.push({ colorGroup: { in: query.color } });
  if (query.size?.length)
    and.push({ sizes: { some: { size: { slug: { in: query.size } } } } });
  if (query.collection?.length)
    and.push({ collections: { some: { collection: { slug: { in: query.collection } } } } });

  const where: Prisma.ProductWhereInput = { AND: and };

  const [total, rows] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      include: { category: true, fabric: true },
      orderBy: [{ category: { order: "asc" } }, { fabric: { name: "asc" } }, { name: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  return {
    products: rows.map(toCard),
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export const getProductBySlug = cache(async (slug: string): Promise<ProductDetailData | null> => {
  const p = await db.product.findUnique({
    where: { slug },
    include: {
      category: true,
      fabric: true,
      sizes: { include: { size: true } },
      collections: { include: { collection: true } },
    },
  });
  if (!p || !p.published) return null;
  return {
    ...toCard(p),
    keywords: p.keywords,
    sizes: p.sizes.sort((a, b) => a.size.order - b.size.order).map((s) => s.size.name),
    collections: p.collections.map((c) => c.collection.name),
  };
});

export const getCategoryBySlug = cache(async (slug: string) => {
  return db.category.findUnique({ where: { slug } });
});

/** One representative photographed product per category, for the home grid. */
export const getFeaturedByCategory = cache(async (): Promise<ProductCardData[]> => {
  const categories = await db.category.findMany({ orderBy: { order: "asc" } });
  const picks = await Promise.all(
    categories.map((c) =>
      db.product.findFirst({
        where: { categoryId: c.id, published: true, imageFilename: { not: null } },
        include: { category: true, fabric: true },
        orderBy: { name: "asc" },
      }),
    ),
  );
  return picks.filter(Boolean).map((p) => toCard(p!));
});

/** Same fabric first, then same category, excluding the product itself. */
export async function getRelatedProducts(product: ProductDetailData, take = 4) {
  const rows = await db.product.findMany({
    where: {
      published: true,
      slug: { not: product.slug },
      OR: [{ fabric: { name: product.fabric } }, { category: { name: product.category } }],
    },
    include: { category: true, fabric: true },
    take: take * 3,
  });
  const sameFabric = rows.filter((r) => r.fabric.name === product.fabric);
  const rest = rows.filter((r) => r.fabric.name !== product.fabric);
  return [...sameFabric, ...rest].slice(0, take).map(toCard);
}

export const countProducts = cache(async () => db.product.count({ where: { published: true } }));
