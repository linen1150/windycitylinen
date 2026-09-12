"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { Card, adminInput, adminLabel, EmptyState, SubmitButton } from "@/components/admin/ui";
import { saveFaqItem, addFaqItem, deleteFaqItem, moveFaqItem, type FaqState } from "@/lib/admin/faq";

type Item = { id: string; question: string; answer: string; published: boolean };

export function FaqManager({ items }: { items: Item[] }) {
  const [pending, start] = useTransition();

  return (
    <div className="space-y-4">
      {items.length === 0 && <EmptyState>No FAQ items yet.</EmptyState>}

      {items.map((item, i) => (
        <ItemRow key={item.id} item={item} first={i === 0} last={i === items.length - 1} />
      ))}

      <button
        type="button"
        disabled={pending}
        onClick={() => start(() => addFaqItem())}
        className="border border-line bg-white px-4 py-2 text-sm font-medium hover:border-ink disabled:opacity-50"
      >
        Add question
      </button>
    </div>
  );
}

const initial: FaqState = {};

function ItemRow({ item, first, last }: { item: Item; first: boolean; last: boolean }) {
  const [state, formAction, saving] = useActionState(saveFaqItem.bind(null, item.id), initial);
  const [savedFlash, setSavedFlash] = useState(false);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (state.ok) {
      setSavedFlash(true);
      const t = setTimeout(() => setSavedFlash(false), 2000);
      return () => clearTimeout(t);
    }
  }, [state.ok, state]);

  return (
    <Card className={`p-4 ${pending ? "opacity-60" : ""}`}>
      <form action={formAction} className="space-y-3">
        <label className="block">
          <span className={adminLabel}>Question</span>
          <input name="question" defaultValue={item.question} required className={adminInput} />
        </label>
        <label className="block">
          <span className={adminLabel}>Answer</span>
          <textarea name="answer" defaultValue={item.answer} rows={3} required className={adminInput} />
        </label>

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="published" defaultChecked={item.published} /> Show on the FAQ page
          </label>

          <div className="ml-auto flex items-center gap-1 text-xs text-ink-soft">
            <button
              type="button"
              disabled={first || pending}
              onClick={() => start(() => moveFaqItem(item.id, "up"))}
              className="px-1.5 disabled:opacity-30"
              aria-label="Move up"
            >
              ↑
            </button>
            <button
              type="button"
              disabled={last || pending}
              onClick={() => start(() => moveFaqItem(item.id, "down"))}
              className="px-1.5 disabled:opacity-30"
              aria-label="Move down"
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm("Delete this question?")) start(() => deleteFaqItem(item.id));
              }}
              className="px-1.5 hover:text-wine"
            >
              Delete
            </button>
          </div>
        </div>

        {state.error && <p className="text-sm text-wine">{state.error}</p>}

        <div className="flex items-center gap-3">
          <SubmitButton type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </SubmitButton>
          {savedFlash && <span className="text-xs text-sage">Saved</span>}
        </div>
      </form>
    </Card>
  );
}
