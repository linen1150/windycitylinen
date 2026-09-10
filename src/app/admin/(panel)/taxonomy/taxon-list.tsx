"use client";

import { useState, useTransition } from "react";
import { Card, adminInput } from "@/components/admin/ui";
import {
  createTaxon,
  deleteTaxon,
  renameTaxon,
  type TaxonKind,
} from "@/lib/admin/taxonomy";

type Item = { id: string; name: string; count: number };

export function TaxonList({
  kind,
  title,
  items,
}: {
  kind: TaxonKind;
  title: string;
  items: Item[];
}) {
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const singular = title.replace(/ies$/, "y").replace(/s$/, "").toLowerCase();

  const add = () => {
    const name = newName.trim();
    if (!name) return;
    setError(null);
    const fd = new FormData();
    fd.set("name", name);
    start(async () => {
      const res = await createTaxon(kind, {}, fd);
      if (res.error) setError(res.error);
      else setNewName("");
    });
  };

  return (
    <Card className="p-4">
      <h2 className="mb-3 font-display text-lg">{title}</h2>

      <ul className="divide-y divide-line border-y border-line">
        {items.map((item) => (
          <TaxonRow key={item.id} kind={kind} item={item} onError={setError} />
        ))}
        {items.length === 0 && (
          <li className="py-3 text-sm text-ink-soft">None yet.</li>
        )}
      </ul>

      <div className="mt-3 flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder={`Add ${singular}`}
          className={adminInput}
        />
        <button
          onClick={add}
          disabled={pending}
          className="shrink-0 border border-line bg-white px-3 text-sm hover:border-ink disabled:opacity-50"
        >
          Add
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-wine">{error}</p>}
    </Card>
  );
}

function TaxonRow({
  kind,
  item,
  onError,
}: {
  kind: TaxonKind;
  item: Item;
  onError: (msg: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(item.name);
  const [pending, start] = useTransition();

  const save = () => {
    if (value.trim() === item.name) return setEditing(false);
    start(async () => {
      const res = await renameTaxon(kind, item.id, value);
      if (res.error) onError(res.error);
      else setEditing(false);
    });
  };

  const remove = () => {
    if (!confirm(`Delete "${item.name}"?`)) return;
    start(async () => {
      const res = await deleteTaxon(kind, item.id);
      if (res.error) onError(res.error);
    });
  };

  return (
    <li className={`flex items-center gap-2 py-2 text-sm ${pending ? "opacity-50" : ""}`}>
      {editing ? (
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") setEditing(false);
          }}
          onBlur={save}
          className={`${adminInput} py-1`}
        />
      ) : (
        <button onClick={() => setEditing(true)} className="flex-1 text-left hover:underline">
          {item.name}
        </button>
      )}
      <span className="text-xs text-ink-soft">{item.count}</span>
      <button
        onClick={remove}
        className="text-xs text-ink-soft hover:text-wine"
        aria-label={`Delete ${item.name}`}
      >
        Delete
      </button>
    </li>
  );
}
