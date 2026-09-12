"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export type FaqState = { error?: string; ok?: boolean };

function revalidate() {
  revalidatePath("/admin/faq");
  revalidatePath("/faq");
}

const saveSchema = z.object({
  question: z.string().trim().min(1, "Question is required").max(300),
  answer: z.string().trim().min(1, "Answer is required").max(2000),
  published: z.coerce.boolean(),
});

export async function saveFaqItem(
  id: string,
  _prev: FaqState,
  formData: FormData,
): Promise<FaqState> {
  await requireAdmin();
  const parsed = saveSchema.safeParse({
    question: formData.get("question"),
    answer: formData.get("answer"),
    published: formData.get("published") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the fields and try again." };

  await db.faqItem.update({
    where: { id },
    data: {
      question: parsed.data.question,
      answer: parsed.data.answer,
      published: parsed.data.published,
    },
  });
  revalidate();
  return { ok: true };
}

export async function addFaqItem(): Promise<void> {
  await requireAdmin();
  const count = await db.faqItem.count();
  await db.faqItem.create({
    data: { order: count, question: "New question", answer: "", published: false },
  });
  revalidate();
}

export async function deleteFaqItem(id: string): Promise<void> {
  await requireAdmin();
  await db.faqItem.delete({ where: { id } });
  const rest = await db.faqItem.findMany({ orderBy: { order: "asc" } });
  await db.$transaction(
    rest.map((f, i) => db.faqItem.update({ where: { id: f.id }, data: { order: i } })),
  );
  revalidate();
}

export async function moveFaqItem(id: string, dir: "up" | "down"): Promise<void> {
  await requireAdmin();
  const item = await db.faqItem.findUnique({ where: { id } });
  if (!item) return;
  const neighbour = await db.faqItem.findFirst({
    where: { order: dir === "up" ? { lt: item.order } : { gt: item.order } },
    orderBy: { order: dir === "up" ? "desc" : "asc" },
  });
  if (!neighbour) return;
  await db.$transaction([
    db.faqItem.update({ where: { id: item.id }, data: { order: neighbour.order } }),
    db.faqItem.update({ where: { id: neighbour.id }, data: { order: item.order } }),
  ]);
  revalidate();
}
