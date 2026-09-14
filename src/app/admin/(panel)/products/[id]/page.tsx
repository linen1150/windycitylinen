import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { ProductForm } from "../product-form";
import { loadProductFormOptions } from "../form-data";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
  searchParams,
}: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  const created = "created" in (await searchParams);

  const [product, opts] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: { sizes: true, collections: true },
    }),
    loadProductFormOptions(),
  ]);
  if (!product) notFound();

  return (
    <div>
      <PageHeader title={product.name} description="Edit product" />
      <ProductForm
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          categoryId: product.categoryId,
          fabricId: product.fabricId,
          colorName: product.colorName,
          colorHex: product.colorHex ?? "",
          colorGroups: product.colorGroups,
          keywords: product.keywords,
          imageFilename: product.imageFilename ?? "",
          limited: product.limited,
          reverseSide: product.reverseSide,
          published: product.published,
          sizeIds: product.sizes.map((s) => s.sizeId),
          collectionIds: product.collections.map((c) => c.collectionId),
        }}
        justCreated={created}
        {...opts}
      />
    </div>
  );
}
