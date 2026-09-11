// One-off: fill in the real destination URLs for the placeholder Design Center
// items seeded in prisma/seed.ts. Run once with `node scripts/fill-design-center-urls.mjs`.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const UPDATES = [
  { title: "Autumn 2026", url: "https://www.flipsnack.com/79B77D88B7A/autumn-2026-color-palettes-wcl" },
  {
    title: "Holiday Look Book",
    url: "https://www.flipsnack.com/79B77D88B7A/2025-windy-city-linen-holiday-lookbook-zcmg988cjl",
  },
  { title: "New Additions 2026", url: "/documents/fall-2026-new-releases.pdf" },
  { title: "Universal Sizing Guide", url: "/documents/wcl-sizing-chart-2025.pdf" },
  { title: "Socials & Soirees", url: "https://www.flipsnack.com/79B77D88B7A/2026-socials-and-soirees-wcl" },
  {
    title: "Serenity Look Book",
    url: "https://www.flipsnack.com/79B77D88B7A/look-book-serenity-flip-7-27-dkao80ihp8/full-view.html",
  },
  {
    title: "Jute Look Book",
    url: "https://www.flipsnack.com/79B77D88B7A/new-jute-look-book-7-27/full-view.html",
  },
  { title: "Echo Look Book", url: "https://www.flipsnack.com/79B77D88B7A/look-book-echo-edit.html" },
  { title: "Classic Solid", section: "DIGITAL_SWATCH_CARDS", url: "/documents/2025-classic-standard-digital-swatches.pdf" },
  { title: "Picnic Check", section: "DIGITAL_SWATCH_CARDS", url: "/documents/2025-picnic-check-digital-swatchcard.pdf" },
  { title: "Matte Lamour", section: "DIGITAL_SWATCH_CARDS", url: "/documents/2025-lamour-digital-swatchcard.pdf" },
  { title: "Jute", section: "DIGITAL_SWATCH_CARDS", url: "/documents/2025-jute-digital-swatchcard.pdf" },
  { title: "Serenity", section: "DIGITAL_SWATCH_CARDS", url: "/documents/2025-serenity-digital-swatchcard.pdf" },
  { title: "Shantung", section: "DIGITAL_SWATCH_CARDS", url: "/documents/2025-shantung-digital-swatchcard.pdf" },
  { title: "Soiree", section: "DIGITAL_SWATCH_CARDS", url: "/documents/2025-soiree-digital-swatchcard.pdf" },
  { title: "WCL Specialty Ties", section: "LINEN_VIDEOS", url: "https://www.youtube.com/watch?v=cfCjzyO9oFE" },
  {
    title: "Windy City Linen | Design Center | Customization",
    section: "LINEN_VIDEOS",
    url: "https://www.youtube.com/watch?v=YtgsKERS9u4",
  },
  { title: "Velvet", section: "DIGITAL_SWATCH_CARDS", url: "/documents/2025-velvet-digital-swatchcard.pdf" },
  { title: "Specialty", section: "DIGITAL_SWATCH_CARDS", url: "/documents/2025-specialty-digital-swatchcard.pdf" },
];

for (const { title, section, url } of UPDATES) {
  const where = section ? { title, section } : { title };
  const res = await prisma.designCenterItem.updateMany({ where, data: { url } });
  console.log(`${res.count ? "✓" : "✗ not found:"} ${title} -> ${url}`);
}

await prisma.$disconnect();
