import Link from "next/link";
import { db } from "@/lib/db";
import { Card, PageHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  NEW: "New",
  IN_PROGRESS: "In progress",
  QUOTED: "Quoted",
  CLOSED: "Closed",
};

export default async function AdminDashboard() {
  const [products, published, categories, fabrics, dcItems, newQuotes, recent] = await Promise.all([
    db.product.count(),
    db.product.count({ where: { published: true } }),
    db.category.count(),
    db.fabric.count(),
    db.designCenterItem.count(),
    db.quoteRequest.count({ where: { status: "NEW" } }),
    db.quoteRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { _count: { select: { items: true } } },
    }),
  ]);

  const stats = [
    { label: "Products", value: `${published} / ${products}`, sub: "published / total", href: "/admin/products" },
    { label: "Categories", value: categories, href: "/admin/taxonomy" },
    { label: "Fabrics", value: fabrics, href: "/admin/taxonomy" },
    { label: "Design Center items", value: dcItems, href: "/admin/design-center" },
    { label: "New quote requests", value: newQuotes, href: "/admin/quotes" },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of the catalog and recent activity." />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="h-full p-4 hover:border-ink">
              <div className="text-xs uppercase tracking-wide text-ink-soft">{s.label}</div>
              <div className="mt-1.5 font-display text-2xl">{s.value}</div>
              {s.sub && <div className="text-[11px] text-ink-soft">{s.sub}</div>}
            </Card>
          </Link>
        ))}
      </div>

      <h2 className="mb-3 mt-8 font-display text-lg">Recent quote requests</h2>
      <Card>
        {recent.length === 0 ? (
          <p className="p-6 text-sm text-ink-soft">No quote requests yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="px-4 py-2.5 font-medium">Name</th>
                <th className="px-4 py-2.5 font-medium">Items</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Received</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((q) => (
                <tr key={q.id} className="border-b border-line last:border-0 hover:bg-ivory/40">
                  <td className="px-4 py-2.5">
                    <Link href={`/admin/quotes/${q.id}`} className="font-medium hover:underline">
                      {q.name}
                    </Link>
                    <div className="text-xs text-ink-soft">{q.email}</div>
                  </td>
                  <td className="px-4 py-2.5 text-ink-soft">{q._count.items || "—"}</td>
                  <td className="px-4 py-2.5">{STATUS_LABEL[q.status] ?? q.status}</td>
                  <td className="px-4 py-2.5 text-ink-soft">
                    {q.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
