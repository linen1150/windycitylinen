import type { Metadata } from "next";
import { ContactForm } from "./contact-form";
import { SITE } from "@/lib/site";
import { localBusinessSchema, locationAnchor } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Windy City Linen — showrooms in Wheeling, IL and Elm Grove, WI. A real person replies within one business day.",
  alternates: { canonical: "/contact" },
};

function LocationMap({ query, name }: { query: string; name: string }) {
  return (
    <iframe
      title={`Map — ${name}`}
      src={`https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      className="h-36 w-full border border-line"
    />
  );
}

export default async function ContactPage({ searchParams }: PageProps<"/contact">) {
  const sp = await searchParams;
  const about = (Array.isArray(sp.about) ? sp.about[0] : sp.about) ?? "";

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8">
      {localBusinessSchema().map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <h1 className="text-center font-script text-4xl sm:text-5xl">Contact Us</h1>

      <div className="mt-10 grid gap-12 lg:grid-cols-2">
        {/* Form */}
        <section>
          <h2 className="font-display text-2xl">We would love to hear from you&hellip;</h2>
          <ContactForm subject={about} />
        </section>

        {/* Locations */}
        <section className="space-y-10">
          {SITE.locations.map((loc) => (
            <div key={loc.name} id={locationAnchor(loc.name)}>
              <h2 className="font-display text-2xl">{loc.name}</h2>
              <div className="mt-4">
                <LocationMap query={loc.mapQuery} name={loc.name} />
              </div>
              <div className="mt-4 space-y-1 text-sm text-ink-soft">
                <p>{loc.note}</p>
                <p>{loc.address}</p>
              </div>
            </div>
          ))}

          <div className="space-y-1 text-sm text-ink-soft">
            <p>A linen request may be made by any of the following methods:</p>
            <p>
              E-mail:{" "}
              <a href={`mailto:${SITE.ordersEmail}`} className="text-wine underline">
                {SITE.ordersEmail}
              </a>
            </p>
            <p>
              Call us:{" "}
              <a href={`tel:${SITE.phoneHref}`} className="text-wine underline">
                {SITE.phone}
              </a>{" "}
              during normal business hours.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
