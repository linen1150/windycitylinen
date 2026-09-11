import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { SITE } from "@/lib/site";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Serving the event industry since 2008, Windy City Linen provides high-quality event linens with showrooms in Wheeling, IL and Elm Grove, WI.",
};

export default async function AboutPage() {
  const team = await db.teamMember.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-8">
      <h1 className="font-display text-3xl">About Windy City Linen</h1>

      <section className="mt-6 max-w-2xl">
        <h2 className="font-display text-xl">Our Story</h2>
        <p className="mt-3 text-ink-soft">
          Serving the event industry since {SITE.since}, Windy City Linen is committed
          to providing high-quality linens you can count on with unparalleled customer
          service. Whether you need linens for an intimate gathering or a party of two
          thousand guests, we&rsquo;ve got you covered. Our warehouse is located in{" "}
          {SITE.showrooms[0]}, and the Wisconsin showroom is located in{" "}
          {SITE.showrooms[1]}. While our selection of linen styles and colors has grown
          dramatically, two things have remained constant since our humble beginnings:
          our total dedication to our customers and our drive to constantly improve.
          Windy City Linen delivers quality linens — every time.
        </p>
      </section>

      {team.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-xl">Our Team</h2>
          <div className="mt-5 grid gap-8 sm:grid-cols-2">
            {team.map((person) => (
              <div key={person.id} className="flex gap-4">
                {person.imagePath && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={person.imagePath}
                    alt={person.name}
                    className="size-20 shrink-0 rounded-full border border-line object-cover"
                  />
                )}
                <div>
                  <h3 className="font-display text-base">
                    {person.name}
                    {person.title && (
                      <span className="ml-2 text-xs font-normal uppercase tracking-wide text-brass-dark">
                        {person.title}
                      </span>
                    )}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{person.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="mt-12 flex flex-wrap gap-3 border-t border-line pt-8">
        <ButtonLink href="/products" variant="primary">Browse the collection</ButtonLink>
        <ButtonLink href="/contact" variant="secondary">Contact the team</ButtonLink>
      </div>
    </div>
  );
}
