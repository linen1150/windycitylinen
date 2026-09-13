import type { Metadata } from "next";
import { countProducts } from "@/lib/catalog";
import { HeroCarousel } from "@/components/site/hero-carousel";
import { db } from "@/lib/db";
import { SITE } from "@/lib/site";
import { localBusinessSchema, organizationSchema } from "@/lib/structured-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [total, heroSlides] = await Promise.all([
    countProducts(),
    db.heroSlide.findMany({
      where: { published: true, NOT: { imagePath: "" } },
      orderBy: { order: "asc" },
    }),
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
            Linen that makes every table the centerpiece.
          </h1>
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
            {[
              [`${new Date().getFullYear() - SITE.since}+`, "years serving Chicagoland"],
              [`${total}+`, "linens in the collection"],
              ["2", `showrooms — ${SITE.showrooms.join(" & ")}`],
            ].map(([n, label]) => (
              <div key={label}>
                <dt className="font-display text-2xl text-brass-dark">{n}</dt>
                <dd className="mt-0.5 text-[13px] text-ink-soft">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
        {slides.length > 0 && <HeroCarousel slides={slides} />}
      </section>
    </>
  );
}
