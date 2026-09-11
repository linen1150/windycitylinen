import { NextResponse } from "next/server";
import { z } from "zod";
import { askClaude } from "@/lib/ai/claude";
import { buildChatSystemPrompt } from "@/lib/ai/chat-prompt";
import { rateLimit } from "@/lib/rate-limit";

const MAX_MESSAGES = 20;
const MAX_MESSAGE_LEN = 2000;

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(MAX_MESSAGE_LEN),
      }),
    )
    .min(1)
    .max(MAX_MESSAGES),
});

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`chat:${ip}`, { max: 20, windowMs: 10 * 60 * 1000 })) {
    return NextResponse.json(
      { error: "You've sent a lot of messages — give it a few minutes, or call/email us directly." },
      { status: 429 },
    );
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const system = await buildChatSystemPrompt();
    const reply = await askClaude({ system, messages: parsed.data.messages });
    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Chat route failed:", err);
    return NextResponse.json(
      { error: "Something went wrong on our end — please try again or reach out directly." },
      { status: 500 },
    );
  }
}
