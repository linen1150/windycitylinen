// One-off: update FAQ answers with confirmed delivery/shipping facts from
// the SEO implementation doc (windycitylinen-seo-implementation.md §8), fix
// a leftover "Bridgette" reference from the chatbot rename, and add three
// new shipping Q&As. Run against local, then production.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const updates = [
  {
    question: "How do I know what size linen I need?",
    answer:
      "Chat with Virtual Marcela (the assistant on every page) with your table shape and size and she'll recommend a linen size using our real sizing chart. You're also welcome to call or email our team directly.",
  },
  {
    question: "Do you deliver and set up?",
    answer:
      "Yes — delivery is priced by zone across northern Illinois and southeastern Wisconsin. Setup, breakdown and post-event linen pickup are available on request for an additional charge. Let us know your event date and venue and we'll confirm the details.",
  },
  {
    question: "Can I see a fabric sample before booking?",
    answer:
      "Yes — check the digital swatch cards in our Design Center for true-to-color previews, or request a physical fabric swatch from our team. Swatches are free.",
  },
  {
    question: "Do you have a minimum order?",
    answer: "Yes — $250 for locally delivered orders and $500 for shipped orders.",
  },
  {
    question: "What areas do you serve?",
    answer:
      "We deliver throughout northern Illinois and southeastern Wisconsin on our own trucks, from our warehouse in Wheeling, IL and our showroom in Elm Grove, WI — everything from intimate dinners to galas of two thousand guests.\n\nBeyond that, we ship. Linen goes out by UPS to Iowa, northern Wisconsin, southern and western Illinois, and Indiana — so an event outside our truck routes is still workable by UPS, or by delivery on request.",
  },
];

const newEntries = [
  {
    question: "Do you ship linens, or is it delivery only?",
    answer:
      "Both. Our trucks cover northern Illinois and southeastern Wisconsin. Anywhere further — Iowa, northern Wisconsin, southern and western Illinois, and Indiana — we ship by UPS or arrange delivery on request. Same collection, same linens, pressed and packed for transit.",
  },
  {
    question: "How does shipping work?",
    answer:
      "Once your order is confirmed, we press and pack everything and ship it by UPS, timed to your UPS delivery zone so it arrives ahead of your event. A prepaid return label is included, so sending everything back after your event is straightforward. Shipping cost is quoted per order — reach out with your zip code and we'll give you a number.",
  },
  {
    question: "How far in advance should I order?",
    answer:
      "For local delivery, confirm your order at least 2 business days before your event. For shipped orders, lead time depends on your UPS delivery zone — tell us your event date and we'll work back from it to a ship date.",
  },
];

let updated = 0;
for (const u of updates) {
  const item = await prisma.faqItem.findFirst({ where: { question: u.question } });
  if (!item) {
    console.log("NOT FOUND:", u.question);
    continue;
  }
  await prisma.faqItem.update({ where: { id: item.id }, data: { answer: u.answer } });
  updated++;
}

const maxOrder = await prisma.faqItem.aggregate({ _max: { order: true } });
let nextOrder = (maxOrder._max.order ?? -1) + 1;
let created = 0;
for (const e of newEntries) {
  const exists = await prisma.faqItem.findFirst({ where: { question: e.question } });
  if (exists) continue;
  await prisma.faqItem.create({ data: { ...e, order: nextOrder++, published: true } });
  created++;
}

console.log(`Updated ${updated} FAQ answers, created ${created} new entries.`);
await prisma.$disconnect();
