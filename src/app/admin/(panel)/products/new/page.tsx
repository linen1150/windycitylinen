import { PageHeader } from "@/components/admin/ui";
import { ProductForm } from "../product-form";
import { loadProductFormOptions } from "../form-data";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const opts = await loadProductFormOptions();
  return (
    <div>
      <PageHeader title="Add product" />
      <ProductForm product={null} {...opts} />
    </div>
  );
}
