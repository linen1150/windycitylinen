"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type InspirationLine = {
  productId: string;
  slug: string;
  name: string;
  category: string;
  fabric: string;
  size: string;
  quantity: number;
  imageUrl: string | null;
  colorHex: string | null;
};

type InspirationsContextValue = {
  lines: InspirationLine[];
  count: number;
  totalQuantity: number;
  add: (line: InspirationLine) => void;
  remove: (index: number) => void;
  removeBySlug: (slug: string) => void;
  setQuantity: (index: number, quantity: number) => void;
  setSize: (index: number, size: string) => void;
  clear: () => void;
  has: (slug: string) => boolean;
  hydrated: boolean;
};

const InspirationsContext = createContext<InspirationsContextValue | null>(null);
const STORAGE_KEY = "wcl.inspirations.v2";

export function InspirationsProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<InspirationLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      /* storage unavailable */
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

  const add = useCallback((line: InspirationLine) => {
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
  }, []);

  const remove = useCallback(
    (index: number) => setLines((prev) => prev.filter((_, i) => i !== index)),
    [],
  );

  const removeBySlug = useCallback(
    (slug: string) => setLines((prev) => prev.filter((l) => l.slug !== slug)),
    [],
  );

  const setQuantity = useCallback(
    (index: number, quantity: number) =>
      setLines((prev) =>
        prev.map((l, i) => (i === index ? { ...l, quantity: Math.max(1, quantity) } : l)),
      ),
    [],
  );

  const setSize = useCallback(
    (index: number, size: string) =>
      setLines((prev) => prev.map((l, i) => (i === index ? { ...l, size } : l))),
    [],
  );

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<InspirationsContextValue>(
    () => ({
      lines,
      count: lines.length,
      totalQuantity: lines.reduce((n, l) => n + l.quantity, 0),
      add,
      remove,
      removeBySlug,
      setQuantity,
      setSize,
      clear,
      has: (slug: string) => lines.some((l) => l.slug === slug),
      hydrated,
    }),
    [lines, hydrated, add, remove, removeBySlug, setQuantity, setSize, clear],
  );

  return (
    <InspirationsContext.Provider value={value}>{children}</InspirationsContext.Provider>
  );
}

export function useInspirations() {
  const ctx = useContext(InspirationsContext);
  if (!ctx) throw new Error("useInspirations must be used within <InspirationsProvider>");
  return ctx;
}
