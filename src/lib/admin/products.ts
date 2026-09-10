"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/slug";

export type ProductFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  slug: z.string().trim().max(200).optional(),
  categoryId: z.string().min(1, "Pick a category"),
  fabricId: z.string().min(1, "Pick a fabric"),
  colorName: z.string().trim().min(1, "Color name is required").max(120),
  colorHex: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Use a hex color like #A6803A")
    .optional()
    .or(z.literal("")),
  colorGroup: z.string().trim().max(60).optional().or(z.literal("")),
  keywords: z.string().trim().max(600).optional().or(z.literal("")),
  imageFilename: z.string().trim().max(400).optional().or(z.literal("")),
  limited: z.coerce.boolean(),
  reverseSide: z.coerce.boolean(),
  published: z.coerce.boolean(),
  sizeIds: z.array(z.string()),
  collectionIds: z.array(z.string()),
});

function parse(formData: FormData) {
  return schema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    categoryId: formData.get("categoryId"),
    fabricId: formData.get("fabricId"),
    colorName: formData.get("colorName"),
    colorHex: formData.get("colorHex") ?? "",
    colorGroup: formData.get("colorGroup") ?? "",
    keywords: formData.get("keywords") ?? "",
    imageFilename: formData.get("imageFilename") ?? "",
    limited: formData.get("limited") === "on",
    reverseSide: formData.get("reverseSide") === "on",
    published: formData.get("published") === "on",
    sizeIds: formData.getAll("sizeIds").map(String),
    collectionIds: formData.getAll("collectionIds").map(String),
  });
}

function toFieldErrors(err: z.ZodError) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of err.issues) {
    const k = String(issue.path[0] ?? "form");
    fieldErrors[k] ??= issue.message;
  }
  return fieldErrors;
}

async function uniqueSlug(base: string, ignoreId?: string) {
  let slug = base || "product";
  let n = 1;
  while (
    await db.product.findFirst({ where: { slug, id: ignoreId ? { not: ignoreId } : undefined } })
  ) {
    slug = `${base}-${++n}`;
  }
  return slug;
}

function revalidate() {
  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
}

export async function createProduct(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdmin();
  const parsed = parse(formData);
  if (!parsed.success) {
    return { error: "Check the highlighted fields.", fieldErrors: toFieldErrors(parsed.error) };
  }
  const d = parsed.data;
  const slug = await uniqueSlug(slugify(d.slug || d.name));

  const product = await db.product.create({
    data: {
      name: d.name,
      slug,
      categoryId: d.categoryId,
      fabricId: d.fabricId,
      colorName: d.colorName,
      colorHex: d.colorHex || null,
      colorGroup: d.colorGroup || null,
      keywords: d.keywords || "",
      imageFilename: d.imageFilename || null,
      limited: d.limited,
      reverseSide: d.reverseSide,
      published: d.published,
      sizes: { create: d.sizeIds.map((sizeId) => ({ sizeId })) },
      collections: { create: d.collectionIds.map((collectionId) => ({ collectionId })) },
    },
  });

  revalidate();
  redirect(`/admin/products/${product.id}?created=1`);
}

export async function updateProduct(
  id: string,
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdmin();
  const parsed = parse(formData);
  if (!parsed.success) {
    return { error: "Check the highlighted fields.", fieldErrors: toFieldErrors(parsed.error) };
  }
  const d = parsed.data;
  const slug = await uniqueSlug(slugify(d.slug || d.name), id);

  await db.$transaction([
    db.productSize.deleteMany({ where: { productId: id } }),
    db.productCollection.deleteMany({ where: { productId: id } }),
    db.product.update({
      where: { id },
      data: {
        name: d.name,
        slug,
        categoryId: d.categoryId,
        fabricId: d.fabricId,
        colorName: d.colorName,
        colorHex: d.colorHex || null,
        colorGroup: d.colorGroup || null,
        keywords: d.keywords || "",
        imageFilename: d.imageFilename || null,
        limited: d.limited,
        reverseSide: d.reverseSide,
        published: d.published,
        sizes: { create: d.sizeIds.map((sizeId) => ({ sizeId })) },
        collections: { create: d.collectionIds.map((collectionId) => ({ collectionId })) },
      },
    }),
  ]);

  revalidate();
  revalidatePath(`/admin/products/${id}`);
  return {};
}

export async function deleteProduct(id: string): Promise<void> {
  await requireAdmin();
  await db.product.delete({ where: { id } });
  revalidate();
  redirect("/admin/products");
}

export async function setPublished(id: string, published: boolean): Promise<void> {
  await requireAdmin();
  await db.product.update({ where: { id }, data: { published } });
  revalidate();
}
