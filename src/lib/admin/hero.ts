"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export type HeroState = { error?: string; ok?: boolean };

const MAX_SLIDES = 8;

function revalidate() {
  revalidatePath("/admin/hero");
  revalidatePath("/", "layout");
}

const saveSchema = z.object({
  alt: z.string().trim().max(300).optional().or(z.literal("")),
  imagePath: z.string().trim().max(600).optional().or(z.literal("")),
  published: z.coerce.boolean(),
});

export async function saveHeroSlide(
  id: string,
  _prev: HeroState,
  formData: FormData,
): Promise<HeroState> {
  await requireAdmin();
  const parsed = saveSchema.safeParse({
    alt: formData.get("alt") ?? "",
    imagePath: formData.get("imagePath") ?? "",
    published: formData.get("published") === "on",
  });
  if (!parsed.success) return { error: "Check the fields and try again." };

  await db.heroSlide.update({
    where: { id },
    data: {
      alt: parsed.data.alt ?? "",
      imagePath: (parsed.data.imagePath ?? "").trim(),
      published: parsed.data.published,
    },
  });
  revalidate();
  return { ok: true };
}

export async function addHeroSlide(): Promise<void> {
  await requireAdmin();
  const count = await db.heroSlide.count();
  if (count >= MAX_SLIDES) return;
  await db.heroSlide.create({ data: { order: count, published: false } });
  revalidate();
}

export async function deleteHeroSlide(id: string): Promise<void> {
  await requireAdmin();
  await db.heroSlide.delete({ where: { id } });
  // Re-pack the order values.
  const rest = await db.heroSlide.findMany({ orderBy: { order: "asc" } });
  await db.$transaction(
    rest.map((s, i) => db.heroSlide.update({ where: { id: s.id }, data: { order: i } })),
  );
  revalidate();
}

export async function moveHeroSlide(id: string, dir: "up" | "down"): Promise<void> {
  await requireAdmin();
  const slide = await db.heroSlide.findUnique({ where: { id } });
  if (!slide) return;
  const neighbour = await db.heroSlide.findFirst({
    where: { order: dir === "up" ? { lt: slide.order } : { gt: slide.order } },
    orderBy: { order: dir === "up" ? "desc" : "asc" },
  });
  if (!neighbour) return;
  await db.$transaction([
    db.heroSlide.update({ where: { id: slide.id }, data: { order: neighbour.order } }),
    db.heroSlide.update({ where: { id: neighbour.id }, data: { order: slide.order } }),
  ]);
  revalidate();
}
