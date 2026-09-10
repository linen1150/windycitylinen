import Link from "next/link";
import { getFeaturedByCategory, countProducts } from "@/lib/catalog";
import { ProductImage } from "@/components/catalog/product-image";
import { ButtonLink } from "@/components/ui/button";
import { HeroCarousel } from "@/components/site/hero-carousel";
import { db } from "@/lib/db";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, total, heroSlides] = await Promise.all([
    getFeaturedByCategory(),
    countProducts(),
    db.heroSlide.findMany({
      where: { published: true, NOT: { imagePath: "" } },
      orderBy: { order: "asc" },
    }),
  ]);
  const slides = heroSlides.map((s) => ({ src: s.imagePath, alt: s.alt }));

  return (
    <>
      {/* Hero */}
      <section
        className={`mx-auto grid max-w-[100rem] items-center gap-10 px-4 py-14 sm:px-6 ${
          slides.length ? "md:grid-cols-[0.85fr_1.15fr] lg:grid-cols-[minmax(0,34rem)_1fr]" : ""
        }`}
      >
        <div>
          <h1 className="font-display text-4xl leading-tight sm:text-5xl">
            Linen that makes every table the centerpiece.
          </h1>
          <p className="mt-4 max-w-md text-lg text-ink-soft">
            Tablecloths, napkins, runners and chair covers for weddings, galas and
            corporate events across {SITE.serviceArea}.
          </p>
        </div>
        {slides.length > 0 && <HeroCarousel slides={slides} />}
      </section>

      {/* Value proposition (punch-list 3.2) */}
      <section className="border-y border-line bg-ivory">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8">
          <div className="grid gap-8 md:grid-cols-[1.3fr_1fr]">
            <div>
              <h2 className="font-display text-2xl">
                A Chicago linen house since {SITE.since}
              </h2>
              <p className="mt-3 max-w-xl text-ink-soft">
                We work with planners, caterers and hosts to dress tables at every
                scale — from intimate dinners to two-thousand-guest galas. Choose
                your fabric, color and size online, save the linens you like to My
                Inspirations, and our team follows up with pricing and availability
                within one business day.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <ButtonLink href="/products" variant="primary">Browse linens</ButtonLink>
                <ButtonLink href="/search" variant="ghost">Search the catalog</ButtonLink>
              </div>
            </div>
            <dl className="grid grid-cols-3 gap-4 self-center text-center md:grid-cols-1 md:gap-6 md:text-left">
              {[
                [`${new Date().getFullYear() - SITE.since}+`, "years serving Chicagoland"],
                [`${total}+`, "linens in the collection"],
                ["2", `showrooms — ${SITE.showrooms.join(" & ")}`],
              ].map(([n, label]) => (
                <div key={label}>
                  <dt className="font-display text-2xl text-brass-dark">{n}</dt>
                  <dd className="mt-1 text-[13px] text-ink-soft">{label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Shop by category */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-8">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-2xl">Shop by category</h2>
          <Link href="/products" className="text-sm text-wine underline underline-offset-4">
            View full catalog
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
          {featured.map((p) => (
            <Link key={p.id} href={`/products/${p.categorySlug}`} className="group block">
              <ProductImage
                src={p.imageUrl}
                alt={p.category}
                colorHex={p.colorHex}
                className="aspect-square w-full transition-transform duration-300 group-hover:scale-[1.03]"
                sizes="(max-width: 640px) 50vw, 200px"
              />
              <div className="mt-2 text-sm font-medium">{p.category}</div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
