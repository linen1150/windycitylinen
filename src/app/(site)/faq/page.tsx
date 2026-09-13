import type { Metadata } from "next";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to common questions about ordering, sizing, delivery, and what to expect from Windy City Linen.",
  alternates: { canonical: "/faq" },
};

export default async function FaqPage() {
  const items = await db.faqItem.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
  });

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-8">
      {items.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <h1 className="font-display text-3xl">Frequently Asked Questions</h1>
      <p className="mt-3 text-ink-soft">
        Answers to the questions we hear most. Don&rsquo;t see yours? Reach out and
        we&rsquo;ll help directly.
      </p>

      {items.length > 0 && (
        <div className="mt-8 divide-y divide-line border-y border-line">
          {items.map((item) => {
            const id = slugify(item.question);
            return (
              <details key={item.id} id={id} className="group py-4 scroll-mt-24">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                  <h2 className="font-display text-lg">{item.question}</h2>
                  <span className="shrink-0 text-brass-dark transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 whitespace-pre-line text-ink-soft">{item.answer}</p>
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
}
