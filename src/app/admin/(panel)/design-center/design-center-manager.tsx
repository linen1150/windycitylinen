"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { Card, adminInput, adminLabel, SubmitButton } from "@/components/admin/ui";
import {
  saveDCItem,
  deleteDCItem,
  moveDCItem,
  type DCState,
} from "@/lib/admin/design-center";

type Item = {
  id: string;
  section: string;
  type: string;
  title: string;
  description: string;
  url: string;
  accentHex: string;
  published: boolean;
};

const SECTIONS = [
  { value: "DESIGN_CENTER", label: "Lookbooks & guides" },
  { value: "DIGITAL_SWATCH_CARDS", label: "Digital swatch cards" },
  { value: "LINEN_VIDEOS", label: "Linen videos" },
];
const TYPES = ["LINK", "DOCUMENT", "VIDEO"];

const initial: DCState = {};

export function DesignCenterManager({ items }: { items: Item[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-8">
      {!adding && !editingId && (
        <button
          onClick={() => setAdding(true)}
          className="border border-line bg-white px-4 py-2 text-sm font-medium hover:border-ink"
        >
          Add item
        </button>
      )}

      {adding && (
        <ItemForm
          item={null}
          onDone={() => setAdding(false)}
          onCancel={() => setAdding(false)}
        />
      )}

      {SECTIONS.map((sec) => {
        const group = items.filter((i) => i.section === sec.value);
        return (
          <div key={sec.value}>
            <h2 className="mb-2 font-display text-lg">{sec.label}</h2>
            <Card className="divide-y divide-line">
              {group.length === 0 && (
                <p className="p-4 text-sm text-ink-soft">Nothing here yet.</p>
              )}
              {group.map((item, idx) =>
                editingId === item.id ? (
                  <div key={item.id} className="p-4">
                    <ItemForm
                      item={item}
                      onDone={() => setEditingId(null)}
                      onCancel={() => setEditingId(null)}
                    />
                  </div>
                ) : (
                  <Row
                    key={item.id}
                    item={item}
                    first={idx === 0}
                    last={idx === group.length - 1}
                    onEdit={() => setEditingId(item.id)}
                  />
                ),
              )}
            </Card>
          </div>
        );
      })}
    </div>
  );
}

function Row({
  item,
  first,
  last,
  onEdit,
}: {
  item: Item;
  first: boolean;
  last: boolean;
  onEdit: () => void;
}) {
  const [pending, start] = useTransition();

  return (
    <div className={`flex items-center gap-3 p-3 text-sm ${pending ? "opacity-50" : ""}`}>
      <span
        className="size-8 shrink-0 rounded-sm border border-line"
        style={{ background: item.accentHex || "#DACBAA" }}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{item.title}</span>
          <span className="text-[11px] uppercase tracking-wide text-ink-soft">{item.type}</span>
          {!item.published && <span className="text-[11px] text-wine">hidden</span>}
        </div>
        {item.url ? (
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="truncate text-xs text-wine underline"
          >
            {item.url}
          </a>
        ) : (
          <span className="text-xs text-ink-soft">no link — shows &ldquo;Ask us for this&rdquo;</span>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1 text-xs text-ink-soft">
        <button
          disabled={first || pending}
          onClick={() => start(() => moveDCItem(item.id, "up"))}
          className="px-1 disabled:opacity-30"
          aria-label="Move up"
        >
          ↑
        </button>
        <button
          disabled={last || pending}
          onClick={() => start(() => moveDCItem(item.id, "down"))}
          className="px-1 disabled:opacity-30"
          aria-label="Move down"
        >
          ↓
        </button>
        <button onClick={onEdit} className="px-1 hover:text-ink">
          Edit
        </button>
        <button
          onClick={() => {
            if (confirm(`Delete "${item.title}"?`)) start(() => deleteDCItem(item.id));
          }}
          className="px-1 hover:text-wine"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function ItemForm({
  item,
  onDone,
  onCancel,
}: {
  item: Item | null;
  onDone: () => void;
  onCancel: () => void;
}) {
  const action = saveDCItem.bind(null, item?.id ?? null);
  const [state, formAction, pending] = useActionState(action, initial);

  useEffect(() => {
    if (state.ok) onDone();
  }, [state.ok, onDone]);

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-2">
      <label className="block">
        <span className={adminLabel}>Section</span>
        <select name="section" defaultValue={item?.section ?? "DESIGN_CENTER"} className={adminInput}>
          {SECTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className={adminLabel}>Type</span>
        <select name="type" defaultValue={item?.type ?? "LINK"} className={adminInput}>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t[0] + t.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </label>
      <label className="block sm:col-span-2">
        <span className={adminLabel}>Title</span>
        <input name="title" defaultValue={item?.title} required className={adminInput} />
      </label>
      <label className="block sm:col-span-2">
        <span className={adminLabel}>Description</span>
        <input name="description" defaultValue={item?.description} className={adminInput} />
      </label>
      <label className="block sm:col-span-2">
        <span className={adminLabel}>
          URL <span className="font-normal">(PDF, landing page or video embed — optional)</span>
        </span>
        <input name="url" defaultValue={item?.url} className={adminInput} placeholder="https://…" />
      </label>
      <label className="block">
        <span className={adminLabel}>Accent color</span>
        <input
          name="accentHex"
          defaultValue={item?.accentHex}
          className={adminInput}
          placeholder="#DACBAA"
        />
      </label>
      <label className="flex items-end gap-2 pb-2 text-sm">
        <input type="checkbox" name="published" defaultChecked={item ? item.published : true} />{" "}
        Published
      </label>

      {state.error && (
        <p className="text-sm text-wine sm:col-span-2">{state.error}</p>
      )}

      <div className="flex gap-2 sm:col-span-2">
        <SubmitButton type="submit" disabled={pending}>
          {pending ? "Saving…" : item ? "Save" : "Add item"}
        </SubmitButton>
        <button type="button" onClick={onCancel} className="text-sm text-ink-soft hover:underline">
          Cancel
        </button>
      </div>
    </form>
  );
}
