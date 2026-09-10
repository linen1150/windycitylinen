import Link from "next/link";
import type { ProductCardData } from "@/lib/catalog";
import { ProductImage } from "./product-image";

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative overflow-hidden bg-ivory">
        <ProductImage
          src={product.imageUrl}
          alt={`${product.fabric} ${product.colorName} ${product.category.replace(/s$/, "").toLowerCase()}`}
          colorHex={product.colorHex}
          className="aspect-square w-full transition-transform duration-300 group-hover:scale-[1.03]"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
        />
        {product.limited && (
          <span className="absolute left-2 top-2 bg-ink px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-[#EDE7D8]">
            Limited
          </span>
        )}
      </div>
      <div className="mt-3">
        <div className="text-sm font-medium text-ink">{product.name}</div>
        <div className="text-xs text-ink-soft">
          {product.fabric}
          {product.reverseSide ? " · reversible" : ""}
        </div>
      </div>
    </Link>
  );
}
