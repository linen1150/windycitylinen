import { NextResponse } from "next/server";
import { z } from "zod";
import { askClaudeJSON } from "@/lib/ai/claude";
import { rateLimit } from "@/lib/rate-limit";

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
  theme: z.string().max(300).optional(),
});

type PresentationResult = {
  title: string;
  intro: string;
  captions: Record<string, string>;
};

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`design-center-present:${ip}`, { max: 10, windowMs: 10 * 60 * 1000 })) {
    return NextResponse.json(
      { error: "You've sent a lot of requests — give it a few minutes." },
      { status: 429 },
    );
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { items, theme } = parsed.data;
  const summary = items
    .map((i) => `slug="${i.slug}": ${i.name} (${i.fabric} fabric, ${i.category}, color ${i.colorHex ?? "n/a"})`)
    .join("; ");
  const slugs = items.map((i) => i.slug);

  const system = `Your name is Bridgette, the linen assistant for Windy City Linen. A visitor wants to present these saved linens exactly as-is: ${summary}.

Their request for how to present them: "${theme?.trim() || "no particular theme — just present them nicely"}".

Write a short presentation for these EXACT items only. Never invent, substitute, or add products — only describe the items listed above. No pricing, no quantities, no availability claims.

Reply with JSON only, exactly this shape, no markdown fences:
{"title": string (a presentation title under 8 words, tying in the visitor's theme if they gave one, e.g. "A Cozy Christmas Rehearsal Dinner"), "intro": string (one warm sentence under 25 words introducing the presentation), "captions": {${slugs.map((s) => `"${s}": string`).join(", ")}} (a short styling note under 12 words for each item, tying it to the theme if given)}`;

  try {
    const result = await askClaudeJSON<PresentationResult>({
      system,
      prompt: "Generate the presentation JSON now.",
      mock: {
        title: theme?.trim() ? theme.trim() : "My Inspirations",
        intro: "Here's a look at what you've saved so far.",
        captions: Object.fromEntries(slugs.map((s) => [s, ""])),
      },
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error("Design center presentation route failed:", err);
    return NextResponse.json(
      { error: "Something went wrong on our end — please try again." },
      { status: 500 },
    );
  }
}
