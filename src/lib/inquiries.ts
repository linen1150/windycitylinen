import "server-only";
import { z } from "zod";
import type { InquiryType } from "@prisma/client";
import { db } from "@/lib/db";
import { sendInquiryEmail } from "@/lib/email";
import { SITE } from "@/lib/site";

const lineSchema = z.object({
  productId: z.string().optional(),
  name: z.string().min(1),
  size: z.string().default(""),
});

export const inquirySchema = z.object({
  type: z.enum(["QUICK", "DETAILED", "QUOTE_TRAY"]),
  name: z.string().min(1, "Please enter your name").max(200),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().max(50).default(""),
  message: z.string().max(5000).default(""),
  eventDate: z.string().max(100).default(""),
  venue: z.string().max(200).default(""),
  guestCount: z.string().max(50).default(""),
  caterer: z.string().max(200).default(""),
  planner: z.string().max(200).default(""),
  items: z.array(lineSchema).max(200).default([]),
  // Honeypot — must stay empty.
  company: z.string().max(0).optional(),
});

export type InquiryInput = z.infer<typeof inquirySchema>;

const TYPE_LABEL: Record<InquiryType, string> = {
  QUICK: "Quick message",
  DETAILED: "Detailed quote request",
  QUOTE_TRAY: "Quote request (item list)",
};

export async function createInquiry(input: InquiryInput) {
  // Verify products exist; keep a denormalized name snapshot regardless.
  const items = await Promise.all(
    input.items.map(async (l) => {
      let productId: string | null = null;
      if (l.productId) {
        const p = await db.product.findUnique({ where: { id: l.productId }, select: { id: true } });
        productId = p?.id ?? null;
      }
      return { productId, productName: l.name, sizeName: l.size };
    }),
  );

  const record = await db.quoteRequest.create({
    data: {
      type: input.type,
      name: input.name,
      email: input.email,
      phone: input.phone,
      message: input.message,
      eventDate: input.eventDate,
      venue: input.venue,
      guestCount: input.guestCount,
      caterer: input.caterer,
      planner: input.planner,
      items: { create: items },
    },
    include: { items: true },
  });

  const lines: string[] = [
    `${TYPE_LABEL[record.type]} via ${SITE.url}`,
    "",
    `Name:   ${record.name}`,
    `Email:  ${record.email}`,
    record.phone && `Phone:  ${record.phone}`,
    record.eventDate && `Event date:   ${record.eventDate}`,
    record.venue && `Venue:        ${record.venue}`,
    record.guestCount && `Guest count:  ${record.guestCount}`,
    record.caterer && `Caterer:      ${record.caterer}`,
    record.planner && `Planner:      ${record.planner}`,
  ].filter(Boolean) as string[];

  if (record.message) lines.push("", "Message:", record.message);

  if (record.items.length) {
    lines.push("", "Items requested:");
    for (const it of record.items) {
      lines.push(`  • ${it.productName}${it.sizeName ? ` — ${it.sizeName}` : ""}`);
    }
  }

  lines.push("", `Admin: ${SITE.url}/admin/quotes/${record.id}`);

  const sent = await sendInquiryEmail({
    subject: `[${TYPE_LABEL[record.type]}] ${record.name}${
      record.items.length ? ` — ${record.items.length} item${record.items.length === 1 ? "" : "s"}` : ""
    }`,
    text: lines.join("\n"),
    replyTo: record.email,
  });

  if (sent) {
    await db.quoteRequest.update({ where: { id: record.id }, data: { emailedAt: new Date() } });
  }

  return { id: record.id, emailed: sent };
}
