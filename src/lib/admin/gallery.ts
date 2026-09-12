"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export type GalleryState = { error?: string; ok?: boolean };

function revalidate() {
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}

const saveSchema = z.object({
  imagePath: z.string().trim().max(600).optional().or(z.literal("")),
  caption: z.string().trim().max(300).optional().or(z.literal("")),
  published: z.coerce.boolean(),
});

export async function saveGalleryItem(
  id: string,
  _prev: GalleryState,
  formData: FormData,
): Promise<GalleryState> {
  await requireAdmin();
  const parsed = saveSchema.safeParse({
    imagePath: formData.get("imagePath") ?? "",
    caption: formData.get("caption") ?? "",
    published: formData.get("published") === "on",
  });
  if (!parsed.success) return { error: "Check the fields and try again." };

  await db.galleryItem.update({
    where: { id },
    data: {
      imagePath: (parsed.data.imagePath ?? "").trim(),
      caption: parsed.data.caption ?? "",
      published: parsed.data.published,
    },
  });
  revalidate();
  return { ok: true };
}

export async function addGalleryItem(): Promise<void> {
  await requireAdmin();
  const count = await db.galleryItem.count();
  await db.galleryItem.create({ data: { order: count, published: false } });
  revalidate();
}

export async function deleteGalleryItem(id: string): Promise<void> {
  await requireAdmin();
  await db.galleryItem.delete({ where: { id } });
  const rest = await db.galleryItem.findMany({ orderBy: { order: "asc" } });
  await db.$transaction(
    rest.map((g, i) => db.galleryItem.update({ where: { id: g.id }, data: { order: i } })),
  );
  revalidate();
}

export async function moveGalleryItem(id: string, dir: "up" | "down"): Promise<void> {
  await requireAdmin();
  const item = await db.galleryItem.findUnique({ where: { id } });
  if (!item) return;
  const neighbour = await db.galleryItem.findFirst({
    where: { order: dir === "up" ? { lt: item.order } : { gt: item.order } },
    orderBy: { order: dir === "up" ? "desc" : "asc" },
  });
  if (!neighbour) return;
  await db.$transaction([
    db.galleryItem.update({ where: { id: item.id }, data: { order: neighbour.order } }),
    db.galleryItem.update({ where: { id: neighbour.id }, data: { order: item.order } }),
  ]);
  revalidate();
}
