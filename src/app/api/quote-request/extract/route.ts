import { NextResponse } from "next/server";
import { extractFromDocument } from "@/lib/ai/claude";
import { searchProductsTool, runProductSearch } from "@/lib/ai/product-search-tool";
import { searchBackendItemsTool, runBackendItemSearch } from "@/lib/ai/backend-item-search-tool";
import { rateLimit } from "@/lib/rate-limit";

const ALLOWED = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 15 * 1024 * 1024;

export type ExtractedItem = {
  description: string;
  quantity: number | null;
  size: string | null;
  matchedProductSlug: string | null;
  matchedProductName: string | null;
  matchedBackendItemNumber: string | null;
  note: string | null;
};

export type ExtractedOrder = {
  summary: string;
  eventDate: string;
  venue: string;
  guestCount: string;
  items: ExtractedItem[];
};

const SYSTEM = `You read a document a client uploaded to Windy City Linen (an event linen rental company) and turn it into a structured order so our team can process it.

The document might be an event order from another vendor, a linen wish-list, a spec sheet, or a photo of a handwritten list. Identify every distinct linen or rental item requested (tablecloths, napkins, runners, chair covers, cuffs, spandex, etc.) — not decor, food, or anything we don't rent.

For EACH item:
- Write a short plain-English description (fabric/pattern, color, category) as you understand it from the document.
- Read off its quantity if the document states one (default to 1 if genuinely unclear — never guess a large number).
- Note its size if given (a table size, e.g. 120" Round, 90"x156" Banquet).
- Call search_products to find a matching item in our live catalog (for the client to see a photo/link) — only set matchedProductSlug/matchedProductName if you're genuinely confident it's the same item, otherwise leave both null.
- Call search_backend_items to find the real backend item code for it — only set matchedBackendItemNumber if confident, otherwise null. Never invent a code.
- Use "note" for anything ambiguous, illegible, or that needs a human's judgment call.

Also pull out, if stated anywhere in the document: an event date, a venue name, and a guest count — leave any as an empty string if not present. Format eventDate strictly as YYYY-MM-DD (assume the current year if none is given); if you can't confidently resolve it to that format, leave it as an empty string instead of guessing.

Never include any price, cost, or dollar amount from the document anywhere in your output, even if the source document has pricing on it — this site never shows pricing to visitors.

Reply with JSON only, no markdown fences, exactly this shape:
{"summary": string (one or two sentences on what you read), "eventDate": string, "venue": string, "guestCount": string, "items": [{"description": string, "quantity": number|null, "size": string|null, "matchedProductSlug": string|null, "matchedProductName": string|null, "matchedBackendItemNumber": string|null, "note": string|null}]}`;

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`quote-extract:${ip}`, { max: 8, windowMs: 15 * 60 * 1000 })) {
    return NextResponse.json(
      { error: "You've uploaded a lot of documents — give it a few minutes, or call/email us directly." },
      { status: 429 },
    );
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const note = form?.get("note");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Use a PDF, JPG, PNG, or WebP file" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File must be under 15 MB" }, { status: 400 });
  }

  try {
    const data = Buffer.from(await file.arrayBuffer()).toString("base64");
    const result = await extractFromDocument<ExtractedOrder>({
      system: SYSTEM,
      document: { mediaType: file.type, data },
      note: typeof note === "string" ? note : undefined,
      tools: [searchProductsTool, searchBackendItemsTool],
      runTool: async (name, input) => {
        if (name === "search_products") {
          return runProductSearch(input as { color?: string; query?: string });
        }
        if (name === "search_backend_items") {
          return runBackendItemSearch(input as { query?: string; color?: string; category?: string });
        }
        return { resultText: "Unknown tool." };
      },
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error("Quote document extraction failed:", err);
    return NextResponse.json(
      { error: "We couldn't read that document — please try a clearer file, or send us your list directly." },
      { status: 500 },
    );
  }
}
