"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/slug";

export type TaxonKind = "category" | "fabric" | "size" | "collection";
export type TaxonState = { error?: string; ok?: boolean };

type TaxonDelegate = {
  findFirst(args: unknown): Promise<{ id: string } | null>;
  count(args?: unknown): Promise<number>;
  create(args: { data: Record<string, unknown> }): Promise<unknown>;
  update(args: { where: { id: string }; data: Record<string, unknown> }): Promise<unknown>;
  delete(args: { where: { id: string } }): Promise<unknown>;
};

function model(kind: TaxonKind): TaxonDelegate {
  const m = { category: db.category, fabric: db.fabric, size: db.size, collection: db.collection }[
    kind
  ];
  return m as unknown as TaxonDelegate;
}

const ordered = new Set<TaxonKind>(["category", "fabric", "size", "collection"]);

async function revalidate() {
  revalidatePath("/admin/taxonomy");
  revalidatePath("/", "layout");
}

export async function createTaxon(
  kind: TaxonKind,
  _prev: TaxonState,
  formData: FormData,
): Promise<TaxonState> {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Enter a name." };
  const slug = slugify(name);

  const existing = await model(kind).findFirst({ where: { OR: [{ name }, { slug }] } });
  if (existing) return { error: `"${name}" already exists.` };

  const data: Record<string, unknown> = { name, slug };
  if (ordered.has(kind)) data.order = await model(kind).count();

  await model(kind).create({ data });
  await revalidate();
  return { ok: true };
}

export async function renameTaxon(
  kind: TaxonKind,
  id: string,
  name: string,
): Promise<TaxonState> {
  await requireAdmin();
  const trimmed = name.trim();
  if (!trimmed) return { error: "Name can't be empty." };
  const slug = slugify(trimmed);
  const clash = await model(kind).findFirst({
    where: { AND: [{ id: { not: id } }, { OR: [{ name: trimmed }, { slug }] }] },
  });
  if (clash) return { error: `"${trimmed}" is already taken.` };

  await model(kind).update({ where: { id }, data: { name: trimmed, slug } });
  await revalidate();
  return { ok: true };
}

export async function deleteTaxon(kind: TaxonKind, id: string): Promise<TaxonState> {
  await requireAdmin();

  if (kind === "category" || kind === "fabric") {
    const inUse = await db.product.count({
      where: kind === "category" ? { categoryId: id } : { fabricId: id },
    });
    if (inUse > 0) {
      return {
        error: `Can't delete — ${inUse} product${inUse === 1 ? "" : "s"} still use this ${kind}. Reassign them first.`,
      };
    }
  }

  await model(kind).delete({ where: { id } });
  await revalidate();
  return { ok: true };
}
