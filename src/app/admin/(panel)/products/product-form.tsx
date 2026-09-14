"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  type ProductFormState,
} from "@/lib/admin/products";
import { adminInput, adminLabel, Card, Field, SubmitButton } from "@/components/admin/ui";
import { ImageUpload } from "@/components/admin/image-upload";

type Opt = { id: string; name: string };

export type ProductFormData = {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  fabricId: string;
  colorName: string;
  colorHex: string;
  colorGroups: string[];
  keywords: string;
  imageFilename: string;
  limited: boolean;
  reverseSide: boolean;
  published: boolean;
  sizeIds: string[];
  collectionIds: string[];
};

const initial: ProductFormState = {};

export function ProductForm({
  product,
  categories,
  fabrics,
  sizes,
  collections,
  colorGroups,
  justCreated = false,
}: {
  product: ProductFormData | null;
  categories: Opt[];
  fabrics: Opt[];
  sizes: Opt[];
  collections: Opt[];
  colorGroups: string[];
  justCreated?: boolean;
}) {
  const isNew = !product;
  const action = isNew
    ? createProduct
    : updateProduct.bind(null, product.id);
  const [state, formAction, pending] = useActionState(action, initial);
  const [image, setImage] = useState(product?.imageFilename ?? "");

  const err = (k: string) => state.fieldErrors?.[k];
  const v = product;

  return (
    <form action={formAction} className="max-w-3xl space-y-5">
      {justCreated && (
        <p className="border-l-2 border-sage bg-sage/10 px-3 py-2 text-sm text-sage">
          Product created.
        </p>
      )}
      {!isNew && !state.fieldErrors && !state.error && pending === false && (
        <span className="sr-only">saved</span>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Product name" error={err("name")}>
          <input name="name" defaultValue={v?.name} className={adminInput} required />
        </Field>
        <Field label="URL slug" hint="Leave blank to generate from the name." error={err("slug")}>
          <input name="slug" defaultValue={v?.slug} className={adminInput} placeholder="auto" />
        </Field>

        <Field label="Category" error={err("categoryId")}>
          <select name="categoryId" defaultValue={v?.categoryId ?? ""} className={adminInput} required>
            <option value="" disabled>
              Choose…
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Fabric" error={err("fabricId")}>
          <select name="fabricId" defaultValue={v?.fabricId ?? ""} className={adminInput} required>
            <option value="" disabled>
              Choose…
            </option>
            {fabrics.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Color name" error={err("colorName")}>
          <input name="colorName" defaultValue={v?.colorName} className={adminInput} required />
        </Field>
        <Field label="Swatch color" error={err("colorHex")}>
          <div className="flex items-center gap-2">
            <input
              type="color"
              defaultValue={v?.colorHex || "#B6A899"}
              onChange={(e) => {
                const hex = e.currentTarget.value;
                const text = e.currentTarget.parentElement?.querySelector<HTMLInputElement>(
                  'input[name="colorHex"]',
                );
                if (text) text.value = hex;
              }}
              className="h-9 w-10 shrink-0 border border-line p-0"
              aria-label="Pick swatch color"
            />
            <input
              name="colorHex"
              defaultValue={v?.colorHex}
              placeholder="#A6803A"
              className={adminInput}
            />
          </div>
        </Field>

        <Field
          label="Image"
          hint="Filename in public/images/<category>/, a /images/... path, or a full URL."
        >
          <div className="flex items-center gap-2">
            <input
              name="imageFilename"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className={adminInput}
            />
            <ImageUpload onUploaded={setImage} label="Upload" />
          </div>
        </Field>
      </div>

      <Field
        label="Keywords"
        hint="Comma-separated search tags, e.g. rustic, farmhouse, barn wedding."
      >
        <input name="keywords" defaultValue={v?.keywords} className={adminInput} />
      </Field>

      <div>
        <span className={adminLabel}>Color family</span>
        <p className="mb-1.5 text-xs text-ink-soft">
          Used by the catalog color filter. Pick more than one for a multi-color fabric (a
          two-tone print, say) so it's findable under any of its colors.
        </p>
        <div className="flex flex-wrap gap-2">
          {colorGroups.map((g) => (
            <label
              key={g}
              className="flex cursor-pointer items-center gap-1.5 border border-line px-2.5 py-1 text-[13px] has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-white"
            >
              <input
                type="checkbox"
                name="colorGroups"
                value={g}
                defaultChecked={v?.colorGroups.includes(g)}
                className="sr-only"
              />
              {g}
            </label>
          ))}
        </div>
      </div>

      <div>
        <span className={adminLabel}>Sizes</span>
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => (
            <label
              key={s.id}
              className="flex cursor-pointer items-center gap-1.5 border border-line px-2.5 py-1 text-[13px] has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-white"
            >
              <input
                type="checkbox"
                name="sizeIds"
                value={s.id}
                defaultChecked={v?.sizeIds.includes(s.id)}
                className="sr-only"
              />
              {s.name}
            </label>
          ))}
        </div>
      </div>

      <div>
        <span className={adminLabel}>Collections</span>
        <div className="flex flex-wrap gap-2">
          {collections.map((c) => (
            <label
              key={c.id}
              className="flex cursor-pointer items-center gap-1.5 border border-line px-2.5 py-1 text-[13px] has-[:checked]:border-brass-dark has-[:checked]:bg-brass-dark has-[:checked]:text-white"
            >
              <input
                type="checkbox"
                name="collectionIds"
                value={c.id}
                defaultChecked={v?.collectionIds.includes(c.id)}
                className="sr-only"
              />
              {c.name}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-5 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="limited" defaultChecked={v?.limited} /> Limited availability
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="reverseSide" defaultChecked={v?.reverseSide} /> Reversible
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="published" defaultChecked={v ? v.published : true} /> Published
        </label>
      </div>

      {state.error && (
        <p className="border-l-2 border-wine bg-ivory px-3 py-2 text-sm text-wine">{state.error}</p>
      )}

      <div className="flex items-center gap-3">
        <SubmitButton type="submit" disabled={pending}>
          {pending ? "Saving…" : isNew ? "Create product" : "Save changes"}
        </SubmitButton>
        <Link href="/admin/products" className="text-sm text-ink-soft hover:underline">
          Back to products
        </Link>
        {!isNew && (
          <button
            type="button"
            onClick={() => {
              if (confirm(`Delete "${v!.name}"? This can't be undone.`)) deleteProduct(v!.id);
            }}
            className="ml-auto text-sm text-wine hover:underline"
          >
            Delete
          </button>
        )}
      </div>

      {!isNew && (
        <Card className="p-3 text-xs text-ink-soft">
          Live page:{" "}
          <a
            href={`/product/${v!.slug}`}
            target="_blank"
            rel="noreferrer"
            className="text-wine underline"
          >
            /product/{v!.slug}
          </a>
        </Card>
      )}
    </form>
  );
}
