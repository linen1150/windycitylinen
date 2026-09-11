import { NextResponse } from "next/server";
import { z } from "zod";
import { askClaudeWithTools } from "@/lib/ai/claude";
import { rateLimit } from "@/lib/rate-limit";
import {
  searchProductsTool,
  runProductSearch,
  type ProductSearchResult,
} from "@/lib/ai/product-search-tool";

const lineSchema = z.object({
  productId: z.string(),
  slug: z.string(),
  name: z.string(),
  category: z.string(),
  fabric: z.string(),
  size: z.string(),
  imageUrl: z.string().nullable(),
  colorHex: z.string().nullable(),
});

const bodySchema = z.object({
  items: z.array(lineSchema).min(1).max(40),
});

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`design-center:${ip}`, { max: 10, windowMs: 10 * 60 * 1000 })) {
    return NextResponse.json(
      { error: "You've sent a lot of requests — give it a few minutes." },
      { status: 429 },
    );
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { items } = parsed.data;
  const summary = items.map((i) => `${i.name} (${i.fabric} fabric, ${i.category})`).join("; ");

  const system = `Your name is Bridgette, the linen assistant for Windy City Linen. A visitor has saved these linens to "My Inspirations": ${summary}.

Use the search_products tool at least once to find 2-4 real products from the live catalog that would round out this look — favor categories different from what's already saved (e.g. if they saved tablecloths, look for napkins, runners, or chair accessories) in a coordinating color or fabric family. Never invent products or describe anything you haven't found via the tool.

Then write exactly one short, warm sentence (under 30 words) introducing the suggestions to the visitor. No pricing, no quantities, no availability promises. The suggested items are shown to the visitor as photo cards below your sentence, so don't list them by name.`;

  try {
    const { reply, toolData } = await askClaudeWithTools({
      system,
      messages: [{ role: "user", content: "Suggest pieces to round out my saved list." }],
      tools: [searchProductsTool],
      runTool: async (name, input) => {
        if (name === "search_products") {
          return runProductSearch(input as { color?: string; query?: string });
        }
        return { resultText: "Unknown tool." };
      },
    });

    const savedSlugs = new Set(items.map((i) => i.slug));
    const seen = new Set<string>();
    const suggestions: ProductSearchResult[] = [];
    for (const batch of toolData as ProductSearchResult[][]) {
      for (const p of batch) {
        if (savedSlugs.has(p.slug) || seen.has(p.slug)) continue;
        seen.add(p.slug);
        suggestions.push(p);
        if (suggestions.length >= 4) break;
      }
      if (suggestions.length >= 4) break;
    }

    return NextResponse.json({ note: reply, suggestions });
  } catch (err) {
    console.error("Design center route failed:", err);
    return NextResponse.json(
      { error: "Something went wrong on our end — please try again." },
      { status: 500 },
    );
  }
}
