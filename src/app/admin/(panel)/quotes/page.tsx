import Link from "next/link";
import { db } from "@/lib/db";
import type { InquiryStatus, Prisma } from "@prisma/client";
import { PageHeader, Card } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  NEW: "New",
  IN_PROGRESS: "In progress",
  QUOTED: "Quoted",
  CLOSED: "Closed",
};
const FILTERS = ["ALL", "NEW", "IN_PROGRESS", "QUOTED", "CLOSED"];

export default async function AdminQuotesPage({ searchParams }: PageProps<"/admin/quotes">) {
  const sp = await searchParams;
  const status = (Array.isArray(sp.status) ? sp.status[0] : sp.status) ?? "ALL";
  const where: Prisma.QuoteRequestWhereInput =
    status !== "ALL" && FILTERS.includes(status)
      ? { status: status as InquiryStatus }
      : {};

  const rows = await db.quoteRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { _count: { select: { items: true } } },
  });

  return (
    <div>
      <PageHeader title="Quote requests" description="Submissions from the site — My Inspirations lists and contact-form messages." />

      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === "ALL" ? "/admin/quotes" : `/admin/quotes?status=${f}`}
            className={`border px-3 py-1 ${
              status === f ? "border-ink bg-ink text-white" : "border-line hover:border-ink"
            }`}
          >
            {f === "ALL" ? "All" : STATUS_LABEL[f]}
          </Link>
        ))}
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-soft">
            <tr>
              <th className="px-4 py-2.5 font-medium">Name</th>
              <th className="px-4 py-2.5 font-medium">Type</th>
              <th className="px-4 py-2.5 font-medium">Items</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium">Received</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((q) => (
              <tr key={q.id} className="border-b border-line last:border-0 hover:bg-ivory/40">
                <td className="px-4 py-2.5">
                  <Link href={`/admin/quotes/${q.id}`} className="font-medium hover:underline">
                    {q.name}
                  </Link>
                  <div className="text-xs text-ink-soft">{q.email}</div>
                </td>
                <td className="px-4 py-2.5 text-ink-soft">
                  {q.type === "QUOTE_TRAY" ? "Inspirations list" : "Contact form"}
                </td>
                <td className="px-4 py-2.5 text-ink-soft">{q._count.items || "—"}</td>
                <td className="px-4 py-2.5">{STATUS_LABEL[q.status] ?? q.status}</td>
                <td className="px-4 py-2.5 text-ink-soft">
                  {q.createdAt.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-ink-soft">
                  Nothing here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
