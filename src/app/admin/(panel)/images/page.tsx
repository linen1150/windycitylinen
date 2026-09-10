import Link from "next/link";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { db } from "@/lib/db";
import { PageHeader, Card } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

async function listUploads(): Promise<string[]> {
  try {
    const files = await readdir(join(process.cwd(), "public", "images", "uploads"));
    return files.filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f)).sort().reverse();
  } catch {
    return [];
  }
}

export default async function AdminImagesPage() {
  const [total, withImage, missing, uploads, byCategory] = await Promise.all([
    db.product.count(),
    db.product.count({ where: { NOT: { imageFilename: null } } }),
    db.product.findMany({
      where: { imageFilename: null },
      include: { category: true },
      orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
      take: 200,
    }),
    listUploads(),
    db.category.findMany({
      orderBy: { order: "asc" },
      select: {
        name: true,
        _count: { select: { products: true } },
      },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Images"
        description={`${withImage} of ${total} products have an image on file.`}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-3 font-display text-lg">By category</h2>
          <ul className="divide-y divide-line border-y border-line text-sm">
            {byCategory.map((c) => (
              <li key={c.name} className="flex justify-between py-2">
                <span>{c.name}</span>
                <span className="text-ink-soft">{c._count.products} products</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-ink-soft">
            The 1,200 seeded photos live in <code>public/images/&lt;category&gt;/</code>. New
            uploads land in <code>public/images/uploads/</code>. For production, move these to
            object storage (e.g. Supabase Storage) and store the full URL on the product.
          </p>
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 font-display text-lg">Recent uploads ({uploads.length})</h2>
          {uploads.length === 0 ? (
            <p className="text-sm text-ink-soft">
              None yet. Upload images from a product&rsquo;s edit screen.
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {uploads.slice(0, 20).map((f) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={f}
                  src={`/images/uploads/${f}`}
                  alt={f}
                  className="aspect-square w-full rounded-sm border border-line object-cover"
                />
              ))}
            </div>
          )}
        </Card>
      </div>

      {missing.length > 0 && (
        <Card className="mt-5 p-5">
          <h2 className="mb-3 font-display text-lg">
            Products without an image ({missing.length}
            {missing.length === 200 ? "+" : ""})
          </h2>
          <div className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2 lg:grid-cols-3">
            {missing.map((p) => (
              <Link
                key={p.id}
                href={`/admin/products/${p.id}`}
                className="truncate text-wine hover:underline"
              >
                {p.name}
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
