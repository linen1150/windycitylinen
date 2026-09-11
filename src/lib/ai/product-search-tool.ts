import "server-only";
import { searchCatalog, COLOR_GROUPS, type ProductCardData } from "@/lib/catalog";
import type { ToolDef } from "@/lib/ai/claude";

export const searchProductsTool: ToolDef = {
  name: "search_products",
  description:
    "Search the live product catalog by color family and/or a free-text keyword (fabric name, category like napkins/runners, pattern name, or style word). Use this whenever a visitor asks what's available in a color, fabric, or style — never guess or list products from memory, always search.",
  input_schema: {
    type: "object",
    properties: {
      color: {
        type: "string",
        enum: COLOR_GROUPS.map((c) => c.name),
        description: "Filter by color family.",
      },
      query: {
        type: "string",
        description: "Free-text keyword — a fabric name, category, pattern name, or style word.",
      },
    },
  },
};

export type ProductSearchResult = {
  slug: string;
  name: string;
  category: string;
  fabric: string;
  colorName: string;
  imageUrl: string | null;
};

function toResult(p: ProductCardData): ProductSearchResult {
  return {
    slug: p.slug,
    name: p.name,
    category: p.category,
    fabric: p.fabric,
    colorName: p.colorName,
    imageUrl: p.imageUrl,
  };
}

export async function runProductSearch(input: {
  color?: string;
  query?: string;
}): Promise<{ resultText: string; sideData: ProductSearchResult[] }> {
  const color = input.color && COLOR_GROUPS.some((c) => c.name === input.color) ? [input.color] : undefined;
  const { products, total } = await searchCatalog({ q: input.query, color, page: 1 });
  const top = products.slice(0, 6);

  const resultText =
    top.length === 0
      ? "No matching products found in the catalog. Tell the visitor nothing matched and suggest they broaden their ask or contact the team."
      : `Found ${total} matching product${total === 1 ? "" : "s"} in the catalog, showing ${top.length}: ${top
          .map((p) => `${p.name} (${p.fabric} fabric, ${p.category})`)
          .join("; ")}. These are now displayed to the visitor as photo cards below your reply — don't re-describe each one in detail, just briefly introduce them.`;

  return { resultText, sideData: top.map(toResult) };
}
