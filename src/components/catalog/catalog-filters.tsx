"use client";

import { useCallback, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Facet = { name: string; slug: string };
type ColorGroup = { name: string; hex: string };

export type CatalogFacets = {
  categories: Facet[];
  fabrics: Facet[];
  sizes: Facet[];
  collections: Facet[];
  colorGroups: ColorGroup[];
};

const PARAM_KEYS = ["category", "fabric", "color", "size", "collection"] as const;

export function CatalogFilters({
  facets,
  hideCategory = false,
}: {
  facets: CatalogFacets;
  hideCategory?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const selected = useCallback(
    (key: string) => new Set(searchParams.getAll(key)),
    [searchParams],
  );

  const activeCount = PARAM_KEYS.reduce(
    (n, k) => n + searchParams.getAll(k).length,
    0,
  );

  const toggle = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    const current = params.getAll(key);
    params.delete(key);
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    next.forEach((v) => params.append(key, v));
    params.delete("page");
    startTransition(() => router.replace(`${pathname}?${params.toString()}`, { scroll: false }));
  };

  const clearAll = () => {
    const params = new URLSearchParams(searchParams);
    PARAM_KEYS.forEach((k) => params.delete(k));
    params.delete("page");
    startTransition(() => router.replace(`${pathname}?${params.toString()}`, { scroll: false }));
  };

  const groups: { key: string; title: string; render: () => React.ReactNode }[] = [];

  if (!hideCategory) {
    groups.push({
      key: "category",
      title: "Category",
      render: () => (
        <CheckList
          options={facets.categories}
          selected={selected("category")}
          onToggle={(slug) => toggle("category", slug)}
        />
      ),
    });
  }
  groups.push({
    key: "color",
    title: "Color",
    render: () => (
      <ul className="space-y-1.5">
        {facets.colorGroups.map((c) => {
          const isOn = selected("color").has(c.name);
          return (
            <li key={c.name}>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isOn}
                  onChange={() => toggle("color", c.name)}
                  className="accent-brass-dark"
                />
                <span
                  className="inline-block size-3.5 rounded-full border border-line"
                  style={{ background: c.hex }}
                />
                {c.name}
              </label>
            </li>
          );
        })}
      </ul>
    ),
  });
  groups.push({
    key: "fabric",
    title: "Fabric",
    render: () => (
      <CheckList
        options={facets.fabrics}
        selected={selected("fabric")}
        onToggle={(slug) => toggle("fabric", slug)}
      />
    ),
  });
  groups.push({
    key: "size",
    title: "Size",
    render: () => (
      <CheckList
        options={facets.sizes}
        selected={selected("size")}
        onToggle={(slug) => toggle("size", slug)}
      />
    ),
  });
  groups.push({
    key: "collection",
    title: "Collection",
    render: () => (
      <CheckList
        options={facets.collections}
        selected={selected("collection")}
        onToggle={(slug) => toggle("collection", slug)}
      />
    ),
  });

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mb-4 w-full border border-line px-4 py-2.5 text-sm font-medium lg:hidden"
        aria-expanded={open}
      >
        {open ? "Hide filters" : "Show filters"}
        {activeCount > 0 ? ` (${activeCount})` : ""}
      </button>

      <div
        className={`${open ? "block" : "hidden"} lg:block ${isPending ? "opacity-60" : ""}`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg">Filter</h2>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-wine underline underline-offset-2"
            >
              Clear all ({activeCount})
            </button>
          )}
        </div>
        <div className="space-y-6">
          {groups.map((g) => (
            <fieldset key={g.key}>
              <legend className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                {g.title}
              </legend>
              {g.render()}
            </fieldset>
          ))}
        </div>
      </div>
    </>
  );
}

function CheckList({
  options,
  selected,
  onToggle,
}: {
  options: Facet[];
  selected: Set<string>;
  onToggle: (slug: string) => void;
}) {
  return (
    <ul className="space-y-1.5">
      {options.map((o) => (
        <li key={o.slug}>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={selected.has(o.slug)}
              onChange={() => onToggle(o.slug)}
              className="accent-brass-dark"
            />
            {o.name}
          </label>
        </li>
      ))}
    </ul>
  );
}
