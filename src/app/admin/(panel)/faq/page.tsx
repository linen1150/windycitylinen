import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { FaqManager } from "./faq-manager";

export const dynamic = "force-dynamic";

export default async function AdminFaqPage() {
  const items = await db.faqItem.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <PageHeader
        title="FAQ"
        description="Questions and answers shown on the FAQ page. Add, edit, reorder, hide, or delete a question."
      />
      <FaqManager
        items={items.map((i) => ({
          id: i.id,
          question: i.question,
          answer: i.answer,
          published: i.published,
        }))}
      />
    </div>
  );
}
