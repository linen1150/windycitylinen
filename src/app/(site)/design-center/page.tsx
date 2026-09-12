import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import type { DesignCenterSection } from "@prisma/client";

export const metadata: Metadata = {
  title: "Design Center",
  description:
    "Seasonal lookbooks, digital swatch cards and styling videos from Windy City Linen to help you plan your table before you get in touch.",
  alternates: { canonical: "/design-center" },
};

const SECTION_META: Record<
  DesignCenterSection,
  { title: string; blurb: string }
> = {
  DESIGN_CENTER: {
    title: "Lookbooks & guides",
    blurb: "Seasonal lookbooks and planning documents.",
  },
  DIGITAL_SWATCH_CARDS: {
    title: "Digital swatch cards",
    blurb: "Browse true-to-color digital swatches by fabric before requesting physical samples.",
  },
  LINEN_VIDEOS: {
    title: "Linen videos",
    blurb: "Short styling and customization walk-throughs from our team.",
  },
};

const SECTION_ORDER: DesignCenterSection[] = [
  "DESIGN_CENTER",
  "DIGITAL_SWATCH_CARDS",
  "LINEN_VIDEOS",
];

export const revalidate = 300;

export default async function DesignCenterPage() {
  const items = await db.designCenterItem.findMany({
    where: { published: true },
    orderBy: [{ section: "asc" }, { order: "asc" }],
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
      <h1 className="font-display text-3xl">Design Center</h1>
      <p className="mt-2 max-w-xl text-ink-soft">
        Seasonal lookbooks, digital swatch cards and styling videos to plan your
        table before you get in touch.
      </p>

      {SECTION_ORDER.map((section) => {
        const group = items.filter((i) => i.section === section);
        if (!group.length) return null;
        const meta = SECTION_META[section];
        return (
          <section key={section} className="mt-12">
            <h2 className="font-display text-xl">{meta.title}</h2>
            <p className="mt-1 max-w-lg text-sm text-ink-soft">{meta.blurb}</p>
            <div className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {group.map((item) => {
                const hasUrl = Boolean(item.url);
                const external = /^https?:\/\//.test(item.url);
                const href = hasUrl
                  ? item.url
                  : `/contact?about=${encodeURIComponent(item.title)}`;
                const label =
                  !hasUrl
                    ? "Ask us for this →"
                    : item.type === "VIDEO"
                      ? "Watch video →"
                      : item.type === "DOCUMENT"
                        ? "Open document →"
                        : "View lookbook →";
                const inner = (
                  <div className="p-4">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-brass-dark">
                      {item.type === "VIDEO" && <span aria-hidden>▶</span>}
                      {item.type.toLowerCase()}
                    </div>
                    <h3 className="mt-1.5 font-display text-base">{item.title}</h3>
                    {item.description && (
                      <p className="mt-1.5 text-xs text-ink-soft">{item.description}</p>
                    )}
                    <div className="mt-3 text-[13px] text-wine">{label}</div>
                  </div>
                );
                const cls = "group block border border-line hover:border-ink";
                return external ? (
                  <a key={item.id} href={href} target="_blank" rel="noopener noreferrer" className={cls}>
                    {inner}
                  </a>
                ) : (
                  <Link key={item.id} href={href} className={cls}>
                    {inner}
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
