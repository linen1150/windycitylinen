import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { SITE } from "@/lib/site";

// TODO(launch): set ANTHROPIC_API_KEY in the production environment. Until
// it's set, every call below returns a clearly-marked mock so the chatbot
// and My Inspirations AI features can be built and tested end to end.
const apiKey = process.env.ANTHROPIC_API_KEY;
const anthropic = apiKey ? new Anthropic({ apiKey }) : null;

const MODEL = "claude-sonnet-5";

export type ChatMessage = { role: "user" | "assistant"; content: string };

type AskArgs = {
  system: string;
  messages: ChatMessage[];
  maxTokens?: number;
};

/**
 * Multi-turn text completion (chatbot). Returns mock text when
 * ANTHROPIC_API_KEY is unset so the widget UI is testable without a live key.
 */
export async function askClaude({ system, messages, maxTokens = 1024 }: AskArgs): Promise<string> {
  if (!anthropic) {
    const last = messages[messages.length - 1]?.content ?? "";
    console.info(`\n──────── Claude call (dev, mocked) ────────\nsystem: ${system.slice(0, 80)}...\nuser: ${last}\n────────────────────────────────────────────\n`);
    return `Thanks for the question — I'm not fully wired up yet in dev (no API key set). In the meantime, call us at ${SITE.phone} or send us your list and we'll follow up directly.`;
  }

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages,
    });
    const block = response.content.find((b) => b.type === "text");
    return block && block.type === "text" ? block.text : "";
  } catch (err) {
    console.error("Claude call failed:", err);
    throw err;
  }
}

type AskJSONArgs<T> = {
  system: string;
  prompt: string;
  maxTokens?: number;
  /** Returned as-is when ANTHROPIC_API_KEY is unset, so callers control their own mock shape. */
  mock: T;
};

/**
 * Single-turn structured completion (e.g. the My Inspirations mood board).
 * The system prompt must instruct Claude to reply with JSON only.
 */
export async function askClaudeJSON<T>({ system, prompt, maxTokens = 1024, mock }: AskJSONArgs<T>): Promise<T> {
  if (!anthropic) {
    console.info(`\n──────── Claude JSON call (dev, mocked) ────────\nsystem: ${system.slice(0, 80)}...\nprompt: ${prompt.slice(0, 200)}\n─────────────────────────────────────────────────\n`);
    return mock;
  }

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: prompt }],
    });
    const block = response.content.find((b) => b.type === "text");
    const text = block && block.type === "text" ? block.text : "";
    const jsonText = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
    return JSON.parse(jsonText) as T;
  } catch (err) {
    console.error("Claude JSON call failed:", err);
    throw err;
  }
}

export const isClaudeConfigured = Boolean(apiKey);
