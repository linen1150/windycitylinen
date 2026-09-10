"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import type { InquiryStatus } from "@prisma/client";

const STATUSES: InquiryStatus[] = ["NEW", "IN_PROGRESS", "QUOTED", "CLOSED"];

export async function setQuoteStatus(id: string, status: string): Promise<void> {
  await requireAdmin();
  if (!STATUSES.includes(status as InquiryStatus)) return;
  await db.quoteRequest.update({ where: { id }, data: { status: status as InquiryStatus } });
  revalidatePath("/admin/quotes");
  revalidatePath(`/admin/quotes/${id}`);
  revalidatePath("/admin");
}

export async function deleteQuote(id: string): Promise<void> {
  await requireAdmin();
  await db.quoteRequest.delete({ where: { id } });
  revalidatePath("/admin/quotes");
  revalidatePath("/admin");
  redirect("/admin/quotes");
}
