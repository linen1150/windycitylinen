"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { SITE } from "@/lib/site";

type Message = { role: "user" | "assistant"; content: string };

const GREETING: Message = {
  role: "assistant",
  content:
    "Hi! I can help you figure out sizing, fabrics and what we carry. What are you dressing tables for?",
};

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, loading]);

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
      setMessages([...next, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 flex h-[520px] w-[340px] flex-col overflow-hidden rounded-lg border border-line bg-ivory shadow-xl sm:w-[380px]">
          <div className="flex items-center justify-between bg-ink px-4 py-3 text-white">
            <span className="font-display text-lg">Ask about linens</span>
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
              <div
                key={i}
                className={`max-w-[85%] rounded-lg px-3 py-2 text-[13px] leading-relaxed ${
                  m.role === "user" ? "ml-auto bg-brass text-white" : "bg-white text-ink"
                }`}
              >
                {m.content}
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
        aria-label={open ? "Close chat" : "Open chat"}
        className="ml-auto flex size-14 items-center justify-center rounded-full bg-brass text-white shadow-lg transition-colors hover:bg-brass-dark"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}
