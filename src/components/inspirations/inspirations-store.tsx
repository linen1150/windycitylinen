"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "wcl.inspirations.v1";

export type Inspiration = {
  slug: string;
  name: string;
  fabric: string;
  imageUrl: string | null;
  colorHex: string | null;
};

function read(): Inspiration[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

/** Lightweight per-browser favorites list. No account required. */
export function useInspirations() {
  const [items, setItems] = useState<Inspiration[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(read());
    setHydrated(true);
    const sync = () => setItems(read());
    window.addEventListener("storage", sync);
    window.addEventListener("wcl:inspirations", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("wcl:inspirations", sync);
    };
  }, []);

  const persist = (next: Inspiration[]) => {
    setItems(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event("wcl:inspirations"));
  };

  const has = useCallback((slug: string) => items.some((i) => i.slug === slug), [items]);

  const toggle = useCallback(
    (item: Inspiration) => {
      const current = read();
      const next = current.some((i) => i.slug === item.slug)
        ? current.filter((i) => i.slug !== item.slug)
        : [...current, item];
      persist(next);
    },
    [],
  );

  const remove = useCallback((slug: string) => {
    persist(read().filter((i) => i.slug !== slug));
  }, []);

  return { items, hydrated, has, toggle, remove };
}
