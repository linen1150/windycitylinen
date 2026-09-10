import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { TaxonList } from "./taxon-list";

export const dynamic = "force-dynamic";

export default async function TaxonomyPage() {
  const [categories, fabrics, sizes, collections] = await Promise.all([
    db.category.findMany({ orderBy: { order: "asc" }, include: { _count: { select: { products: true } } } }),
    db.fabric.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { products: true } } } }),
    db.size.findMany({ orderBy: { order: "asc" }, include: { _count: { select: { products: true } } } }),
    db.collection.findMany({ orderBy: { order: "asc" }, include: { _count: { select: { products: true } } } }),
  ]);

  const toItems = (
    rows: { id: string; name: string; _count: { products: number } }[],
  ) => rows.map((r) => ({ id: r.id, name: r.name, count: r._count.products }));

  return (
    <div>
      <PageHeader
        title="Categories, fabrics, sizes & collections"
        description="The lists that power the catalog filters. A category or fabric can only be deleted once no products use it."
      />
      <div className="grid gap-5 lg:grid-cols-2">
        <TaxonList kind="category" title="Categories" items={toItems(categories)} />
        <TaxonList kind="fabric" title="Fabrics" items={toItems(fabrics)} />
        <TaxonList kind="size" title="Sizes" items={toItems(sizes)} />
        <TaxonList kind="collection" title="Collections" items={toItems(collections)} />
      </div>
    </div>
  );
}
