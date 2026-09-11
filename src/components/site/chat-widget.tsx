"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, Plus, Send, X } from "lucide-react";
import { SITE } from "@/lib/site";
import { ProductImage } from "@/components/catalog/product-image";
import { useInspirations } from "@/components/inspirations/inspirations-store";
import { BridgetteAvatar } from "./bridgette-avatar";

type ProductResult = {
  id: string;
  slug: string;
  name: string;
  category: string;
  fabric: string;
  colorName: string;
  colorHex: string | null;
  imageUrl: string | null;
};

type Message = { role: "user" | "assistant"; content: string; products?: ProductResult[] };

const GREETING: Message = {
  role: "assistant",
  content:
    "Hi, I'm Bridgette! I can help you figure out sizing, fabrics and what we carry. What are you dressing tables for?",
};

export function ChatWidget() {
  const { add, removeBySlug, has } = useInspirations();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, loading]);

  function toggleInspirations(p: ProductResult) {
    if (has(p.slug)) {
      removeBySlug(p.slug);
      return;
    }
    add({
      productId: p.id,
      slug: p.slug,
      name: p.name,
      category: p.category,
      fabric: p.fabric,
      size: "",
      imageUrl: p.imageUrl,
      colorHex: p.colorHex,
    });
  }

  async function send() {
    const content = input.trim();
    if (!content || loading) return;
    const next = [...messages, { role: "user", content } as Message];
    setMessages(next);
    setInput("");
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setMessages([...next, { role: "assistant", content: data.reply, products: data.products }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 print:hidden">
      {open && (
        <div className="mb-3 flex h-[520px] w-[340px] flex-col overflow-hidden rounded-lg border border-line bg-ivory shadow-xl sm:w-[380px]">
          <div className="flex items-center justify-between bg-ink px-4 py-3 text-white">
            <span className="flex items-center gap-2 font-display text-lg">
              <BridgetteAvatar size={28} className="rounded-full" />
              Chat with Bridgette
            </span>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="text-white/80 hover:text-white">
              <X size={18} />
            </button>
          </div>

          <p className="border-b border-line bg-paper px-4 py-2 text-[12px] text-ink-soft">
            Prefer to talk? Call{" "}
            <a href={`tel:${SITE.phoneHref}`} className="underline hover:text-ink">
              {SITE.phone}
            </a>{" "}
            or email{" "}
            <a href={`mailto:${SITE.ordersEmail}`} className="underline hover:text-ink">
              {SITE.ordersEmail}
            </a>
            .
          </p>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((m, i) => (
              <div key={i}>
                <div
                  className={`max-w-[85%] whitespace-pre-line rounded-lg px-3 py-2 text-[13px] leading-relaxed ${
                    m.role === "user" ? "ml-auto bg-brass text-white" : "bg-white text-ink"
                  }`}
                >
                  {m.content}
                </div>
                {m.products && m.products.length > 0 && (
                  <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                    {m.products.map((p) => {
                      const saved = has(p.slug);
                      return (
                        <div key={p.slug} className="w-20 shrink-0">
                          <div className="relative">
                            <Link href={`/product/${p.slug}`}>
                              <ProductImage
                                src={p.imageUrl}
                                alt={`${p.fabric} ${p.colorName} ${p.category.replace(/s$/, "").toLowerCase()}`}
                                colorHex={p.colorHex}
                                className="aspect-square w-full border border-line"
                              />
                            </Link>
                            <button
                              type="button"
                              onClick={() => toggleInspirations(p)}
                              aria-label={saved ? "Remove from My Inspirations" : "Save to My Inspirations"}
                              className={`absolute right-1 top-1 flex size-6 items-center justify-center rounded-full shadow ${
                                saved ? "bg-sage text-white hover:bg-sage/80" : "bg-white/90 text-ink hover:bg-white"
                              }`}
                            >
                              {saved ? <Check size={14} /> : <Plus size={14} />}
                            </button>
                          </div>
                          <Link
                            href={`/product/${p.slug}`}
                            className="mt-1 block truncate text-center text-[11px] text-ink-soft"
                          >
                            {p.name}
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
            {loading && <div className="max-w-[85%] rounded-lg bg-white px-3 py-2 text-[13px] text-ink-soft">Thinking…</div>}
            {error && (
              <div className="rounded-lg bg-[#FBEAEA] px-3 py-2 text-[13px] text-[#8A2E2E]">{error}</div>
            )}
          </div>

          <form
            className="flex items-center gap-2 border-t border-line bg-white p-3"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about sizing, fabrics…"
              maxLength={2000}
              className="flex-1 border border-line bg-ivory px-3 py-2 text-sm outline-none focus:border-ink"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send"
              className="inline-flex size-9 items-center justify-center bg-brass text-white transition-colors hover:bg-brass-dark disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open chat with Bridgette"}
        className="ml-auto flex size-14 items-center justify-center overflow-hidden rounded-full border-2 border-brass bg-brass text-white shadow-lg transition-colors hover:border-brass-dark"
      >
        {open ? <X size={22} /> : <BridgetteAvatar size={56} />}
      </button>
    </div>
  );
}
