"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type QuoteLine = {
  productId: string;
  slug: string;
  name: string;
  category: string;
  size: string;
  quantity: number;
  imageUrl: string | null;
  colorHex: string | null;
};

type QuoteContextValue = {
  lines: QuoteLine[];
  count: number;
  add: (line: QuoteLine) => void;
  remove: (index: number) => void;
  setQuantity: (index: number, quantity: number) => void;
  clear: () => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const QuoteContext = createContext<QuoteContextValue | null>(null);
const STORAGE_KEY = "wcl.quote.v1";

export function QuoteProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<QuoteLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      /* ignore unavailable storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* ignore */
    }
  }, [lines, hydrated]);

  const add = useCallback((line: QuoteLine) => {
    setLines((prev) => {
      const i = prev.findIndex(
        (l) => l.productId === line.productId && l.size === line.size,
      );
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], quantity: next[i].quantity + line.quantity };
        return next;
      }
      return [...prev, line];
    });
    setIsOpen(true);
  }, []);

  const remove = useCallback(
    (index: number) => setLines((prev) => prev.filter((_, i) => i !== index)),
    [],
  );

  const setQuantity = useCallback(
    (index: number, quantity: number) =>
      setLines((prev) =>
        prev.map((l, i) => (i === index ? { ...l, quantity: Math.max(1, quantity) } : l)),
      ),
    [],
  );

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<QuoteContextValue>(
    () => ({
      lines,
      count: lines.reduce((n, l) => n + l.quantity, 0),
      add,
      remove,
      setQuantity,
      clear,
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    }),
    [lines, isOpen, add, remove, setQuantity, clear],
  );

  return <QuoteContext.Provider value={value}>{children}</QuoteContext.Provider>;
}

export function useQuote() {
  const ctx = useContext(QuoteContext);
  if (!ctx) throw new Error("useQuote must be used within <QuoteProvider>");
  return ctx;
}
