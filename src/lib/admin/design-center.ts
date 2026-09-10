"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export type DCState = { error?: string; ok?: boolean };

const schema = z.object({
  section: z.enum(["DESIGN_CENTER", "DIGITAL_SWATCH_CARDS", "LINEN_VIDEOS"]),
  type: z.enum(["LINK", "DOCUMENT", "VIDEO"]),
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  url: z.string().trim().max(1000).optional().or(z.literal("")),
  accentHex: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Use a hex color")
    .optional()
    .or(z.literal("")),
  published: z.coerce.boolean(),
});

function parse(formData: FormData) {
  return schema.safeParse({
    section: formData.get("section"),
    type: formData.get("type"),
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    url: formData.get("url") ?? "",
    accentHex: formData.get("accentHex") ?? "",
    published: formData.get("published") === "on",
  });
}

function revalidate() {
  revalidatePath("/admin/design-center");
  revalidatePath("/design-center");
}

export async function saveDCItem(
  id: string | null,
  _prev: DCState,
  formData: FormData,
): Promise<DCState> {
  await requireAdmin();
  const parsed = parse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  }
  const d = parsed.data;
  const data = {
    section: d.section,
    type: d.type,
    title: d.title,
    description: d.description || "",
    url: d.url || "",
    accentHex: d.accentHex || null,
    published: d.published,
  };

  if (id) {
    await db.designCenterItem.update({ where: { id }, data });
  } else {
    const order = await db.designCenterItem.count({ where: { section: d.section } });
    await db.designCenterItem.create({ data: { ...data, order } });
  }
  revalidate();
  return { ok: true };
}

export async function deleteDCItem(id: string): Promise<void> {
  await requireAdmin();
  await db.designCenterItem.delete({ where: { id } });
  revalidate();
}

export async function moveDCItem(id: string, dir: "up" | "down"): Promise<void> {
  await requireAdmin();
  const item = await db.designCenterItem.findUnique({ where: { id } });
  if (!item) return;
  const neighbour = await db.designCenterItem.findFirst({
    where: {
      section: item.section,
      order: dir === "up" ? { lt: item.order } : { gt: item.order },
    },
    orderBy: { order: dir === "up" ? "desc" : "asc" },
  });
  if (!neighbour) return;
  await db.$transaction([
    db.designCenterItem.update({ where: { id: item.id }, data: { order: neighbour.order } }),
    db.designCenterItem.update({ where: { id: neighbour.id }, data: { order: item.order } }),
  ]);
  revalidate();
}
