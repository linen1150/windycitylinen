import type { Metadata } from "next";
import Link from "next/link";
import { categoryNoun, countProducts } from "@/lib/catalog";
import { HeroCarousel } from "@/components/site/hero-carousel";
import { db } from "@/lib/db";
import { SITE } from "@/lib/site";
import { localBusinessSchema, organizationSchema } from "@/lib/structured-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [total, heroSlides, categories] = await Promise.all([
    countProducts(),
    db.heroSlide.findMany({
      where: { published: true, NOT: { imagePath: "" } },
      orderBy: { order: "asc" },
    }),
    db.category.findMany({ orderBy: { order: "asc" }, select: { name: true, slug: true } }),
  ]);
  const slides = heroSlides.map((s) => ({ src: s.imagePath, alt: s.alt }));

  return (
    <>
      {[...organizationSchema(), ...localBusinessSchema()].map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      {/* Hero */}
      <section
        className={`mx-auto grid max-w-[100rem] items-start gap-10 px-4 py-14 sm:px-6 ${
          slides.length ? "md:grid-cols-[0.9fr_1.1fr] lg:grid-cols-[minmax(0,40rem)_1fr]" : ""
        }`}
      >
        <div>
          <h1 className="font-display text-4xl leading-tight sm:text-5xl">
            Event Linen Rentals in Chicago &amp; Milwaukee
          </h1>
          <p className="mt-3 font-display text-xl italic text-ink-soft">
            Linen that makes every table the centerpiece.
          </p>
          <p className="mt-5 max-w-xl text-ink-soft">
            Tablecloths, napkins, runners and chair covers for weddings, galas and
            corporate events across {SITE.serviceArea}. Choose your fabric, color and
            size online, save what you like to My Inspirations, and our team follows up
            with pricing and availability within one business day.
          </p>

          <hr className="mt-8 max-w-xl border-line" />

          <h2 className="mt-8 font-display text-2xl">
            A Chicago linen house since {SITE.since}
          </h2>
          <p className="mt-3 max-w-xl text-ink-soft">
            We work with planners, caterers and hosts to dress tables at every scale —
            from intimate dinners to two-thousand-guest galas.
          </p>

          <dl className="mt-9 grid max-w-xl grid-cols-3 gap-5">
            <div>
              <dt className="font-display text-2xl text-brass-dark">
                {new Date().getFullYear() - SITE.since}+
              </dt>
              <dd className="mt-0.5 text-[13px] text-ink-soft">years serving Chicagoland</dd>
            </div>
            <div>
              <dt className="font-display text-2xl text-brass-dark">{total}+</dt>
              <dd className="mt-0.5 text-[13px] text-ink-soft">linens in the collection</dd>
            </div>
            <div>
              <dt className="font-display text-2xl text-brass-dark">2</dt>
              <dd className="mt-0.5 text-[13px] text-ink-soft">
                showrooms —{" "}
                <Link href="/contact#chicago-location" className="underline hover:text-ink">
                  Wheeling, IL
                </Link>{" "}
                &{" "}
                <Link href="/linen-rentals-milwaukee" className="underline hover:text-ink">
                  Elm Grove, WI
                </Link>
              </dd>
            </div>
          </dl>
        </div>
        {slides.length > 0 && <HeroCarousel slides={slides} />}
      </section>

      {/* Below the fold */}
      <section className="mx-auto max-w-4xl px-4 pb-16 sm:px-8">
        <h2 className="font-display text-2xl">Shop by category</h2>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/products/${c.slug}`}
              className="border border-line bg-white px-4 py-3 text-sm hover:border-ink"
            >
              {categoryNoun(c.name).replace(/^./, (ch) => ch.toUpperCase())} rentals
            </Link>
          ))}
        </div>

        <h2 className="mt-12 font-display text-2xl">How it works</h2>
        <ol className="mt-4 max-w-2xl list-decimal space-y-2 pl-5 text-ink-soft">
          <li>
            <strong>Browse and save.</strong> Filter the collection by color, fabric or
            size and add what you like to My Inspirations — no account or checkout.
          </li>
          <li>
            <strong>Send us the list.</strong> Add your event date, venue and guest count.
          </li>
          <li>
            <strong>We come back with pricing.</strong> Usually within one business day,
            with availability confirmed and a delivery quote for your zone.
          </li>
          <li>
            <strong>We deliver, pressed and ready.</strong> Every linen is cleaned and
            pressed before it goes out, and setup, breakdown and pickup are available on
            request.
          </li>
        </ol>

        <h2 className="mt-12 font-display text-2xl">Who we work with</h2>
        <p className="mt-4 max-w-2xl text-ink-soft">
          Wedding planners piecing together a reception look, caterers who need the same
          ivory to match every time, venue coordinators running a full weekend of events,
          and hosts planning something once and wanting to get it right — we work with
          all of them, at every scale from an intimate dinner to a two-thousand-guest
          gala. Fabric ranges from Classic Solid, the dependable foundation, up through
          Shantung, Velvet and our Glitzy collection for a black-tie reception, with Jute
          and Picnic Check suited to a barn or a tented summer afternoon.
        </p>

        <h2 className="mt-12 font-display text-2xl">Two showrooms, by appointment</h2>
        <p className="mt-4 max-w-2xl text-ink-soft">
          Photos only go so far with fabric — seeing it in person, under real light, is
          the only honest way to judge a color against your florals. Our{" "}
          <Link href="/contact#chicago-location" className="text-wine underline">
            Wheeling, IL showroom
          </Link>{" "}
          sits alongside our full warehouse, twenty-five minutes northwest of the Loop.
          Our{" "}
          <Link href="/linen-rentals-milwaukee" className="text-wine underline">
            Elm Grove, WI showroom
          </Link>{" "}
          puts the same collection within reach of Milwaukee-area planners. Both are open
          by appointment, so someone is free to pull fabrics and talk through sizing for
          your venue when you visit.
        </p>
      </section>
    </>
  );
}
