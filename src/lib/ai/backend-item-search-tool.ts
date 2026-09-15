import "server-only";
import type { ToolDef } from "@/lib/ai/claude";
import backendItemsData from "../../../data/backend-items.json";

type BackendItem = {
  itemNumber: string;
  description: string;
  category: string;
  size: string;
  color: string;
};

const ITEMS = (backendItemsData as { items: BackendItem[] }).items;

export const searchBackendItemsTool: ToolDef = {
  name: "search_backend_items",
  description:
    "Search Windy City Linen's real backend inventory item codes by category, fabric/pattern keyword, size, and/or color. Use this for every linen line you extract from the document, so the result carries a real item number staff can key directly into the backend system — never invent an item number.",
  input_schema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Free-text keyword — fabric/pattern name (e.g. \"Shantung\", \"Underwood\"), or a size like '120\" Round'.",
      },
      color: {
        type: "string",
        description: "Color to filter by (e.g. \"Ivory\", \"Navy\").",
      },
      category: {
        type: "string",
        description: "Category to filter by (e.g. \"Classic Solid\", \"Specialty\", \"Chair Covers\").",
      },
    },
  },
};

function norm(s: string) {
  return s.toLowerCase();
}

export async function runBackendItemSearch(input: {
  query?: string;
  color?: string;
  category?: string;
}): Promise<{ resultText: string; sideData: BackendItem[] }> {
  const query = input.query?.trim();
  const color = input.color?.trim();
  const category = input.category?.trim();

  let results = ITEMS;
  if (category) {
    const c = norm(category);
    results = results.filter((it) => norm(it.category).includes(c));
  }
  if (color) {
    const c = norm(color);
    results = results.filter((it) => norm(it.color).includes(c));
  }
  if (query) {
    const terms = norm(query).split(/\s+/).filter(Boolean);
    results = results.filter((it) => {
      const hay = norm(`${it.description} ${it.category} ${it.size} ${it.color}`);
      return terms.every((t) => hay.includes(t));
    });
  }

  const top = results.slice(0, 10);
  const resultText =
    top.length === 0
      ? "No matching backend item codes found. Leave matchedItemNumber null for this line and describe it in plain text instead."
      : `Found ${results.length} matching backend item(s), showing ${top.length}: ${top
          .map((it) => `${it.itemNumber} = "${it.description}" (${it.category}, ${it.size}, ${it.color})`)
          .join("; ")}`;

  return { resultText, sideData: top };
}
