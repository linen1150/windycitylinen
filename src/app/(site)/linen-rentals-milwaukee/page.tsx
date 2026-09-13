import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";
import { breadcrumbSchema, localBusinessSchema, locationAnchor } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Linen Rentals in Milwaukee, WI",
  description:
    "Table linen rentals for Milwaukee weddings, galas and corporate events. Over 1,200 tablecloths, napkins, runners and chair covers, with a showroom in Elm Grove.",
  alternates: { canonical: "/linen-rentals-milwaukee" },
  openGraph: {
    images: [
      {
        url: "/home/hero-1.jpg",
        width: 900,
        height: 600,
        alt: "A wedding table set with Windy City Linen",
      },
    ],
  },
};

const WISCONSIN = SITE.locations.find((l) => l.name === "Wisconsin Location")!;

const DELIVERY_CITIES = [
  "Milwaukee", "Wauwatosa", "Brookfield", "Elm Grove", "Waukesha", "Pewaukee",
  "Delafield", "Oconomowoc", "New Berlin", "Greenfield", "Franklin", "Oak Creek",
  "Mequon", "Cedarburg", "Racine", "Kenosha", "Lake Geneva",
];

const SHIP_CITIES = ["Green Bay", "Appleton", "Oshkosh", "Wausau", "Eau Claire", "La Crosse", "Door County"];

const VENUES = [
  "Ivy House", "Prairie Springs", "Boxed & Burlap", "The Valerie", "The Pfister",
  "The Landing 1840", "Fête", "The Bowery", "Farm at Dover", "Marcus Center",
  "Discovery World", "Milwaukee Art Museum", "The Pritzlaff",
];

const FAQS = [
  {
    q: "Do you have a showroom near Milwaukee?",
    a: "Yes — in Elm Grove, about fifteen minutes from downtown Milwaukee, open by appointment.",
  },
  {
    q: "How far in advance should I book?",
    a: "For local delivery, confirm your order at least 2 business days before your event. For shipped orders, lead time depends on your UPS delivery zone — tell us your event date and we'll work back from it to a ship date.",
  },
  {
    q: "Do you deliver and set up?",
    a: "Delivery is included with every order. Setup, breakdown and post-event linen pickup are available on request for an additional charge.",
  },
  {
    q: "Is there a minimum order?",
    a: "Yes — $250 for locally delivered orders and $500 for shipped orders.",
  },
  {
    q: "How much do linen rentals cost in Milwaukee?",
    a: "Pricing depends on fabric, size, quantity and delivery zone, so we quote per event rather than publishing a rate card. Send us your list and we'll come back within one business day.",
  },
];

export default function MilwaukeeLocationPage() {
  const schemas = [
    ...localBusinessSchema().filter((s) => s["@id"].includes(locationAnchor(WISCONSIN.name))),
    breadcrumbSchema([{ name: "Milwaukee", path: "/linen-rentals-milwaukee" }]),
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-8">
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <nav className="mb-4 text-xs text-ink-soft">
        <Link href="/" className="hover:underline">Home</Link> / Milwaukee
      </nav>

      <h1 className="font-display text-3xl">Event Linen Rentals in Milwaukee</h1>

      <p className="mt-5 max-w-2xl text-ink-soft">
        Since {SITE.since}, Windy City Linen has been dressing tables across southeastern
        Wisconsin — from wedding receptions in Lake Country to fundraising galas downtown.
        Our Elm Grove showroom puts more than 1,200 linens within reach of Milwaukee
        planners, caterers and hosts: tablecloths and overlays, napkins, runners, cuffs,
        spandex and chair covers, in a dozen fabrics and colors from ivory to eggplant.
      </p>
      <p className="mt-3 max-w-2xl text-ink-soft">
        Choose what you like online, save it to My Inspirations, and our team follows up
        with pricing and availability — usually within one business day.
      </p>

      <section id={locationAnchor(WISCONSIN.name)} className="mt-12">
        <h2 className="font-display text-2xl">Visit the Elm Grove showroom</h2>
        <p className="mt-3 max-w-2xl text-ink-soft">
          Photos only go so far with fabric. Shantung reads differently under warm light
          than it does on a screen, and a Matte Lamour napkin folded on the table is the
          only honest way to judge a color against your florals.
        </p>
        <p className="mt-3 max-w-2xl text-ink-soft">
          Our Wisconsin showroom is at <strong>{WISCONSIN.address}</strong>, about fifteen
          minutes west of downtown Milwaukee. Visits are by appointment — ask for Tera, who
          runs the Elm Grove showroom — so someone is free to pull fabrics, lay out
          combinations on a real table and talk through sizing for your venue.
        </p>
        <div className="mt-4">
          <iframe
            title="Map — Elm Grove showroom"
            src={`https://www.google.com/maps?q=${encodeURIComponent(WISCONSIN.mapQuery)}&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-52 w-full border border-line"
          />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl">Wedding linen rentals for Milwaukee venues</h2>
        <p className="mt-3 max-w-2xl text-ink-soft">
          Most of what we do in Wisconsin is weddings, and most of the questions are the
          same three: what size, what fabric, and will it look like the photo.
        </p>
        <p className="mt-3 max-w-2xl text-ink-soft">
          Sizing depends on your venue&rsquo;s tables, not on a standard. A 120&Prime; round
          covers a 60&Prime; round table to the floor; a 132&Prime; round does the same for
          a 72&Prime;. Head tables and sweetheart tables usually want a banquet size — we
          stock up to 114&Prime; &times; 180&Prime;. Send us the venue&rsquo;s table list
          and we&rsquo;ll tell you exactly what you need.
        </p>
        <p className="mt-3 max-w-2xl text-ink-soft">
          Fabric is where the room&rsquo;s character comes from. Classic Solid is the
          dependable foundation. Shantung brings a soft lustre that photographs beautifully
          in candlelight. Velvet carries a winter reception. Jute and Picnic Check suit a
          barn or a tented summer afternoon.
        </p>
        <p className="mt-4 max-w-2xl text-ink-soft">
          We regularly deliver to venues including {VENUES.join(", ")}, and many more
          across the area.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link href="/products/tablecloths-and-overlays" className="text-wine underline">Browse tablecloths</Link>
          <Link href="/products/napkins" className="text-wine underline">Browse napkins</Link>
          <Link href="/products/table-runners" className="text-wine underline">Browse table runners</Link>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl">Corporate events, galas and fundraisers</h2>
        <p className="mt-3 max-w-2xl text-ink-soft">
          We work at every scale, up to two thousand guests. For a fundraiser or an awards
          dinner that means consistent color across a large floor, enough inventory that
          every table matches, and delivery timed to your venue&rsquo;s load-in window.
        </p>
        <p className="mt-3 max-w-2xl text-ink-soft">
          Caterers and venue coordinators across the Milwaukee area work with us on a
          repeat basis. If you&rsquo;re planning several events a year, talk to us about
          keeping your standard linens reserved.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link href="/products/chair-covers" className="text-wine underline">Browse chair covers</Link>
          <Link href="/products/spandex" className="text-wine underline">Browse spandex</Link>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl">Where we deliver in southeastern Wisconsin</h2>
        <p className="mt-3 max-w-2xl text-ink-soft">{DELIVERY_CITIES.join(" · ")}</p>

        <h3 className="mt-6 font-display text-lg">Further north, we ship</h3>
        <p className="mt-2 max-w-2xl text-ink-soft">
          Northern Wisconsin is outside our delivery routes, so linen goes out by UPS
          instead — pressed, packed and timed to arrive ahead of your event, with a
          prepaid return label included. {SHIP_CITIES.join(", ")} are all regular
          destinations.
        </p>
        <p className="mt-2 max-w-2xl text-ink-soft">
          Tell us your event date and we&rsquo;ll work back from it to a ship date.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl">How it works</h2>
        <ol className="mt-3 max-w-2xl list-decimal space-y-2 pl-5 text-ink-soft">
          <li><strong>Browse and save.</strong> Filter by color, fabric or size and add what you like to My Inspirations.</li>
          <li><strong>Send us the list.</strong> Add your date, venue and guest count.</li>
          <li><strong>We come back with pricing.</strong> Within one business day, availability confirmed and a delivery quote for your zone.</li>
          <li><strong>We deliver, pressed and ready.</strong> Every linen is cleaned and pressed before it goes out.</li>
        </ol>
        <Link href="/products" className="mt-4 inline-block text-sm text-wine underline">
          Start browsing the collection
        </Link>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl">Milwaukee linen rental questions</h2>
        <div className="mt-4 divide-y divide-line border-y border-line">
          {FAQS.map((item) => (
            <details key={item.q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg">
                {item.q}
                <span className="shrink-0 text-brass-dark transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-ink-soft">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-12 border border-line bg-ivory p-6 text-center">
        <h2 className="font-display text-2xl">Planning a Milwaukee event?</h2>
        <p className="mt-2 text-ink-soft">
          Call{" "}
          <a href={`tel:${SITE.phoneHref}`} className="text-wine underline">{SITE.phone}</a>,
          email{" "}
          <a href={`mailto:${SITE.ordersEmail}`} className="text-wine underline">{SITE.ordersEmail}</a>,
          or send us your Inspirations list and we&rsquo;ll take it from there.
        </p>
        <p className="mt-4 text-sm text-ink-soft">
          Planning in Illinois instead? See our <Link href="/contact" className="text-wine underline">Wheeling showroom</Link>.
        </p>
      </section>
    </div>
  );
}
