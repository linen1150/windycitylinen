"use client";

import { useTransition } from "react";
import { setPublished } from "@/lib/admin/products";

export function PublishToggle({ id, published }: { id: string; published: boolean }) {
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => setPublished(id, !published))}
      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
        published ? "bg-sage/15 text-sage" : "bg-ink/10 text-ink-soft"
      } ${pending ? "opacity-50" : ""}`}
    >
      {published ? "Live" : "Hidden"}
    </button>
  );
}
