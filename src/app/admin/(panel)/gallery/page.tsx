import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { GalleryManager } from "./gallery-manager";
import { GallerySearch } from "./gallery-search";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

export default async function AdminGalleryPage({ searchParams }: PageProps<"/admin/gallery">) {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim() ?? "";
  const page = Math.max(1, Number.parseInt((Array.isArray(sp.page) ? sp.page[0] : sp.page) ?? "1", 10) || 1);

  const where: Prisma.GalleryItemWhereInput = q
    ? { caption: { contains: q, mode: "insensitive" } }
    : {};

  const [total, items] = await Promise.all([
    db.galleryItem.count({ where }),
    db.galleryItem.findMany({
      where,
      orderBy: { order: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <PageHeader
        title="Gallery"
        description={`${total} photo${total === 1 ? "" : "s"} shown on the Gallery page. Add, edit, reorder, hide, or delete a photo.`}
      />

      <div className="mb-4 max-w-sm">
        <GallerySearch initial={q} />
      </div>

      <GalleryManager
        items={items.map((i) => ({
          id: i.id,
          imagePath: i.imagePath,
          caption: i.caption,
          published: i.published,
        }))}
      />

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
    <Link href={`/admin/gallery?${params.toString()}`} className="border border-line px-3 py-1.5 hover:border-ink">
      {children}
    </Link>
  );
}
