// One-off: add FAQ entries from Rob's real Terms & Conditions text
// (cancellation policy, delivery hours, missing linen), which also now
// live in full at /terms. Run against local, then production.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const newEntries = [
  {
    question: "What's your cancellation policy?",
    answer:
      "To avoid a 40% restocking fee, we need a cancellation request by email at least 2 business days before your delivery date, by 12pm. Verbal cancellations or voicemails aren't accepted. See our Terms & Conditions for the full policy.",
  },
  {
    question: "What are your delivery hours?",
    answer:
      "Standard deliveries run 9am to 6pm, Monday through Friday. Rush, timed and weekend/holiday deliveries are available — call us for pricing.",
  },
  {
    question: "What happens if linen isn't returned after my event?",
    answer:
      "All linen must be returned in full. Anything not returned is considered missing and a replacement fee is charged per piece, so it's worth accounting for everything at the end of your event.",
  },
];

const maxOrder = await prisma.faqItem.aggregate({ _max: { order: true } });
let nextOrder = (maxOrder._max.order ?? -1) + 1;
let created = 0;
for (const e of newEntries) {
  const exists = await prisma.faqItem.findFirst({ where: { question: e.question } });
  if (exists) continue;
  await prisma.faqItem.create({ data: { ...e, order: nextOrder++, published: true } });
  created++;
}

console.log(`Created ${created} new FAQ entries.`);
await prisma.$disconnect();
