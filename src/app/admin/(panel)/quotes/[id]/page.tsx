import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PageHeader, Card } from "@/components/admin/ui";
import { QuoteControls } from "./quote-controls";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  QUICK: "Contact form",
  DETAILED: "Contact form",
  QUOTE_TRAY: "My Inspirations list",
  DOCUMENT: "Document quote request",
};

export default async function QuoteDetailPage({ params }: PageProps<"/admin/quotes/[id]">) {
  const { id } = await params;
  const q = await db.quoteRequest.findUnique({
    where: { id },
    include: { items: { include: { product: { select: { slug: true } } } } },
  });
  if (!q) notFound();

  const details: [string, string][] = [
    ["Email", q.email],
    ["Phone", q.phone],
    ["Subject", q.subject],
    ["Event date", q.eventDate],
    ["Venue", q.venue],
    ["Guest count", q.guestCount],
    ["Caterer", q.caterer],
    ["Event planner", q.planner],
    ["How they heard", q.howHeard],
  ];

  return (
    <div>
      <PageHeader
        title={q.name}
        description={`${TYPE_LABEL[q.type] ?? q.type} · ${q.createdAt.toLocaleString("en-US")}`}
        action={
          <Link href="/admin/quotes" className="text-sm text-ink-soft hover:underline">
            All quote requests
          </Link>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="mb-3 font-display text-lg">Contact</h2>
            <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              {details
                .filter(([, val]) => val)
                .map(([label, val]) => (
                  <div key={label}>
                    <dt className="text-xs uppercase tracking-wide text-ink-soft">{label}</dt>
                    <dd>
                      {label === "Email" ? (
                        <a href={`mailto:${val}`} className="text-wine underline">
                          {val}
                        </a>
                      ) : (
                        val
                      )}
                    </dd>
                  </div>
                ))}
            </dl>
            {q.sourceSummary && (
              <div className="mt-4">
                <div className="text-xs uppercase tracking-wide text-ink-soft">From the uploaded document</div>
                <p className="mt-1 whitespace-pre-wrap text-sm">{q.sourceSummary}</p>
              </div>
            )}
            {q.message && (
              <div className="mt-4">
                <div className="text-xs uppercase tracking-wide text-ink-soft">Message</div>
                <p className="mt-1 whitespace-pre-wrap text-sm">{q.message}</p>
              </div>
            )}
          </Card>

          {q.items.length > 0 && (
            <Card className="p-5">
              <h2 className="mb-3 font-display text-lg">Linens ({q.items.length})</h2>
              <ul className="divide-y divide-line border-y border-line text-sm">
                {q.items.map((it) => (
                  <li key={it.id} className="flex items-center justify-between gap-3 py-2">
                    <span>
                      {it.quantity > 1 && <span className="text-ink-soft">{it.quantity}x </span>}
                      {it.product ? (
                        <Link href={`/product/${it.product.slug}`} className="hover:underline">
                          {it.productName}
                        </Link>
                      ) : (
                        it.productName
                      )}
                    </span>
                    <span className="shrink-0 text-right text-ink-soft">
                      {it.sizeName || "size to confirm"}
                      {it.backendItemNumber && (
                        <span className="ml-2 font-mono text-xs">[{it.backendItemNumber}]</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <QuoteControls id={q.id} status={q.status} name={q.name} />
          </Card>
          <p className="text-xs text-ink-soft">
            Notification email {q.emailedAt ? "sent" : "was logged (not sent — no email key configured)"}.
          </p>
        </div>
      </div>
    </div>
  );
}
