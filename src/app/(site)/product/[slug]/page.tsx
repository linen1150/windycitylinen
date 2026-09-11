import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categoryNoun, getMatchingNapkin, getProductBySlug, getRelatedProducts } from "@/lib/catalog";
import { ProductImage } from "@/components/catalog/product-image";
import { ProductCard } from "@/components/catalog/product-card";
import { AddToInspirations } from "@/components/inspirations/add-to-inspirations";

export async function generateMetadata({
  params,
}: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  const noun = categoryNoun(product.category);
  return {
    title: `${product.name} ${noun}`,
    description: `${product.fabric} ${product.colorName} ${noun} rental from Windy City Linen. Available in ${
      product.sizes.length ? product.sizes.join(", ") : "multiple sizes"
    }. Add to My Inspirations and send your list — no pricing shown; our team follows up directly.`,
  };
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [related, matchingNapkin] = await Promise.all([
    getRelatedProducts(product),
    product.category === "Tablecloths and Overlays" ? getMatchingNapkin(product) : Promise.resolve(null),
  ]);
  const noun = categoryNoun(product.category);

  const details = (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-brass-dark">
        {product.fabric}
        {product.collections.length ? ` · ${product.collections.join(", ")}` : ""}
      </div>
      <h1 className="mt-2 font-display text-3xl">{product.name}</h1>
      <div className="mt-2 flex gap-2 text-xs">
        {product.limited && (
          <span className="bg-ink px-2 py-0.5 uppercase tracking-wide text-[#EDE7D8]">
            Limited availability
          </span>
        )}
        {product.reverseSide && (
          <span className="border border-line px-2 py-0.5 uppercase tracking-wide text-ink-soft">
            Reversible
          </span>
        )}
      </div>
      <p className="mt-4 max-w-md text-ink-soft">
        {product.colorName} in our {product.fabric} fabric — a {noun} that works
        across weddings, galas and corporate events in Chicago and Milwaukee.
      </p>

      <AddToInspirations product={product} />
    </div>
  );

  const mainImage = (
    <ProductImage
      src={product.imageUrl}
      alt={`${product.fabric} ${product.colorName} ${noun}`}
      colorHex={product.colorHex}
      className="aspect-square w-full"
      sizes="(max-width: 768px) 100vw, 420px"
    />
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
      <nav className="mb-6 text-xs text-ink-soft">
        <Link href="/products" className="hover:underline">Products</Link>
        {" / "}
        <Link href={`/products/${product.categorySlug}`} className="hover:underline">
          {product.category}
        </Link>
        {" / "}
        {product.name}
      </nav>

      <div
        className={
          matchingNapkin
            ? "grid gap-6 md:grid-cols-[1.4fr_1fr_1fr]"
            : "grid gap-10 md:grid-cols-2"
        }
      >
        {matchingNapkin ? (
          <>
            <div className="md:order-2">{mainImage}</div>
            <div className="md:order-3">
              <ProductImage
                src={matchingNapkin.imageUrl}
                alt={`${matchingNapkin.fabric} ${matchingNapkin.colorName} napkin`}
                colorHex={matchingNapkin.colorHex}
                className="aspect-square w-full"
                sizes="(max-width: 768px) 100vw, 420px"
              />
              <p className="mt-2 text-xs text-ink-soft">Matching napkin</p>
            </div>
            <div className="md:order-1">{details}</div>
          </>
        ) : (
          <>
            {mainImage}
            {details}
          </>
        )}
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-xl">You might also like</h2>
          <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
