import Link from "next/link";
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { imageUrl } from "@/lib/catalog";
import { PageHeader, Card, LinkButton } from "@/components/admin/ui";
import { ProductSearch } from "./product-search";
import { PublishToggle } from "./publish-toggle";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 30;

export default async function AdminProductsPage({ searchParams }: PageProps<"/admin/products">) {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim() ?? "";
  const page = Math.max(1, Number.parseInt((Array.isArray(sp.page) ? sp.page[0] : sp.page) ?? "1", 10) || 1);

  const where: Prisma.ProductWhereInput = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { colorName: { contains: q, mode: "insensitive" } },
          { keywords: { contains: q, mode: "insensitive" } },
          { category: { name: { contains: q, mode: "insensitive" } } },
          { fabric: { name: { contains: q, mode: "insensitive" } } },
        ],
      }
    : {};

  const [total, rows] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      include: {
        category: true,
        fabric: true,
        _count: { select: { sizes: true, collections: true } },
      },
      orderBy: [{ updatedAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <PageHeader
        title="Products"
        description={`${total} product${total === 1 ? "" : "s"}`}
        action={
          <LinkButton href="/admin/products/new" variant="primary">
            Add product
          </LinkButton>
        }
      />

      <div className="mb-4 max-w-sm">
        <ProductSearch initial={q} />
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-soft">
            <tr>
              <th className="w-12 px-4 py-2.5" />
              <th className="px-4 py-2.5 font-medium">Name</th>
              <th className="px-4 py-2.5 font-medium">Category</th>
              <th className="px-4 py-2.5 font-medium">Fabric</th>
              <th className="px-4 py-2.5 font-medium">Sizes</th>
              <th className="px-4 py-2.5 font-medium">Published</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const src = imageUrl(p.category.name, p.imageFilename);
              return (
                <tr key={p.id} className="border-b border-line last:border-0 hover:bg-ivory/40">
                  <td className="px-4 py-2">
                    <span
                      className="block size-8 rounded-sm border border-line bg-cover bg-center"
                      style={
                        src
                          ? { backgroundImage: `url(${src})` }
                          : { background: p.colorHex ?? "#DACBAA" }
                      }
                    />
                  </td>
                  <td className="px-4 py-2">
                    <Link href={`/admin/products/${p.id}`} className="font-medium hover:underline">
                      {p.name}
                    </Link>
                    {p.limited && <span className="ml-2 text-[11px] text-brass-dark">limited</span>}
                  </td>
                  <td className="px-4 py-2 text-ink-soft">{p.category.name}</td>
                  <td className="px-4 py-2 text-ink-soft">{p.fabric.name}</td>
                  <td className="px-4 py-2 text-ink-soft">{p._count.sizes}</td>
                  <td className="px-4 py-2">
                    <PublishToggle id={p.id} published={p.published} />
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Link href={`/admin/products/${p.id}`} className="text-xs text-wine hover:underline">
                      Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-ink-soft">
                  No products match &ldquo;{q}&rdquo;.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {pageCount > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3 text-sm">
          <PageLink q={q} page={page - 1} disabled={page <= 1}>
            Previous
          </PageLink>
          <span className="text-ink-soft">
            Page {page} of {pageCount}
          </span>
          <PageLink q={q} page={page + 1} disabled={page >= pageCount}>
            Next
          </PageLink>
        </div>
      )}
    </div>
  );
}

function PageLink({
  q,
  page,
  disabled,
  children,
}: {
  q: string;
  page: number;
  disabled: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return <span className="border border-line px-3 py-1.5 opacity-40">{children}</span>;
  }
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (page > 1) params.set("page", String(page));
  return (
    <Link href={`/admin/products?${params.toString()}`} className="border border-line px-3 py-1.5 hover:border-ink">
      {children}
    </Link>
  );
}
