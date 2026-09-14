/**
 * Seeds the database from data/catalog.json (produced by scripts/build-catalog.mjs)
 * plus the confirmed taxonomy and the real Design Center content.
 *
 * Idempotent: safe to run repeatedly. Run with `npm run db:seed`.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import bcrypt from "bcryptjs";
import { PrismaClient, DesignCenterSection, DesignCenterType } from "@prisma/client";

const prisma = new PrismaClient();

type CatalogFile = {
  categories: string[];
  fabrics: string[];
  sizes: string[];
  collections: string[];
  products: Array<{
    externalId: number;
    name: string;
    slug: string;
    category: string;
    fabric: string;
    colorName: string;
    colorHex: string | null;
    colorGroup: string | null;
    limited: boolean;
    reverseSide: boolean;
    imageFilename: string | null;
    keywords: string;
    sizes: string[];
    collections: string[];
  }>;
};

const slugify = (s: string) =>
  s.toLowerCase().replace(/["']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// Real Design Center content, mirrored from the current site (see build brief).
// `url` lives here (not just in scripts/fill-design-center-urls.mjs) because
// this array is deleted-and-recreated wholesale on every seed — a `url` that
// only existed as a later one-off patch got silently wiped by the next
// reseed, the same class of bug that hit the Mirage fabric split.
const DESIGN_CENTER: Array<{
  section: DesignCenterSection;
  type: DesignCenterType;
  title: string;
  description?: string;
  accentHex?: string;
  url?: string;
}> = [
  {
    section: "DESIGN_CENTER",
    type: "LINK",
    title: "Autumn 2026",
    description: "Seasonal lookbook.",
    url: "https://www.flipsnack.com/79B77D88B7A/autumn-2026-color-palettes-wcl",
  },
  {
    section: "DESIGN_CENTER",
    type: "LINK",
    title: "Holiday Look Book",
    description: "Seasonal lookbook.",
    url: "https://www.flipsnack.com/79B77D88B7A/2025-windy-city-linen-holiday-lookbook-zcmg988cjl",
  },
  {
    section: "DESIGN_CENTER",
    type: "DOCUMENT",
    title: "New Additions 2026",
    description: "What's new this year.",
    url: "/documents/fall-2026-new-releases.pdf",
  },
  {
    section: "DESIGN_CENTER",
    type: "DOCUMENT",
    title: "Universal Sizing Guide",
    description: "Linen sizes for every table.",
    url: "/documents/wcl-sizing-chart-2025.pdf",
  },
  {
    section: "DESIGN_CENTER",
    type: "LINK",
    title: "Socials & Soirees",
    description: "Lookbook.",
    url: "https://www.flipsnack.com/79B77D88B7A/2026-socials-and-soirees-wcl",
  },
  // The original Flipsnack lookbooks for these three 404 now (deleted/moved on
  // Flipsnack's end, confirmed 2026-09-12) — point at the real matching
  // products instead of a dead external link.
  {
    section: "DESIGN_CENTER",
    type: "LINK",
    title: "Serenity Look Book",
    description: "The Serenity fabric, styled.",
    url: "/products?fabric=serenity",
  },
  {
    section: "DESIGN_CENTER",
    type: "LINK",
    title: "Jute Look Book",
    description: "The Jute collection, styled.",
    url: "/products?fabric=jute",
  },
  {
    section: "DESIGN_CENTER",
    type: "LINK",
    title: "Echo Look Book",
    description: "The Echo collection, styled.",
    url: "/search?q=echo",
  },
  {
    section: "DIGITAL_SWATCH_CARDS",
    type: "DOCUMENT",
    title: "Classic Solid",
    accentHex: "#DACBAA",
    url: "/documents/2025-classic-standard-digital-swatches.pdf",
  },
  {
    section: "DIGITAL_SWATCH_CARDS",
    type: "DOCUMENT",
    title: "Jute",
    accentHex: "#B39A63",
    url: "/documents/2025-jute-digital-swatchcard.pdf",
  },
  {
    section: "DIGITAL_SWATCH_CARDS",
    type: "DOCUMENT",
    title: "Matte Lamour",
    accentHex: "#DCD6C4",
    url: "/documents/2025-lamour-digital-swatchcard.pdf",
  },
  {
    section: "DIGITAL_SWATCH_CARDS",
    type: "DOCUMENT",
    title: "Mirage",
    accentHex: "#B9C6CC",
    url: "/documents/2025-mirage-digital-swatchcard.pdf",
  },
  {
    section: "DIGITAL_SWATCH_CARDS",
    type: "DOCUMENT",
    title: "Picnic Check",
    accentHex: "#C8D0B9",
    url: "/documents/2025-picnic-check-digital-swatchcard.pdf",
  },
  {
    section: "DIGITAL_SWATCH_CARDS",
    type: "DOCUMENT",
    title: "Serenity",
    accentHex: "#D3BFC7",
    url: "/documents/2025-serenity-digital-swatchcard.pdf",
  },
  {
    section: "DIGITAL_SWATCH_CARDS",
    type: "DOCUMENT",
    title: "Shantung",
    accentHex: "#E5DFCC",
    url: "/documents/2025-shantung-digital-swatchcard.pdf",
  },
  {
    section: "DIGITAL_SWATCH_CARDS",
    type: "DOCUMENT",
    title: "Soiree",
    accentHex: "#D6B7B0",
    url: "/documents/2025-soiree-digital-swatchcard.pdf",
  },
  {
    section: "DIGITAL_SWATCH_CARDS",
    type: "DOCUMENT",
    title: "Specialty",
    accentHex: "#CFC7B3",
    url: "/documents/2025-specialty-digital-swatchcard.pdf",
  },
  {
    section: "DIGITAL_SWATCH_CARDS",
    type: "DOCUMENT",
    title: "Velvet",
    accentHex: "#3E323A",
    url: "/documents/2025-velvet-digital-swatchcard.pdf",
  },
  {
    section: "LINEN_VIDEOS",
    type: "VIDEO",
    title: "WCL Specialty Ties",
    description: "Ashley showcases different linen tying styles.",
    url: "https://www.youtube.com/watch?v=cfCjzyO9oFE",
  },
  {
    section: "LINEN_VIDEOS",
    type: "VIDEO",
    title: "Windy City Linen | Design Center | Customization",
    description: "Marcela walks through how to customize a linen.",
    url: "https://www.youtube.com/watch?v=YtgsKERS9u4",
  },
];

async function main() {
  const catalog: CatalogFile = JSON.parse(
    readFileSync(join(process.cwd(), "data/catalog.json"), "utf8").replace(/^﻿/, ""),
  );

  console.log("Seeding taxonomy…");
  await Promise.all(
    catalog.categories.map((name, i) =>
      prisma.category.upsert({
        where: { name },
        update: { order: i },
        create: { name, slug: slugify(name), order: i },
      }),
    ),
  );
  await Promise.all(
    catalog.fabrics.map((name) =>
      prisma.fabric.upsert({
        where: { name },
        update: {},
        create: { name, slug: slugify(name) },
      }),
    ),
  );
  await Promise.all(
    catalog.sizes.map((name, i) =>
      prisma.size.upsert({
        where: { name },
        update: { order: i },
        create: { name, slug: slugify(name), order: i },
      }),
    ),
  );
  await Promise.all(
    catalog.collections.map((name, i) =>
      prisma.collection.upsert({
        where: { name },
        update: { order: i },
        create: { name, slug: slugify(name), order: i },
      }),
    ),
  );

  const categories = new Map((await prisma.category.findMany()).map((c) => [c.name, c.id]));
  const fabrics = new Map((await prisma.fabric.findMany()).map((f) => [f.name, f.id]));
  const sizes = new Map((await prisma.size.findMany()).map((s) => [s.name, s.id]));
  const collections = new Map((await prisma.collection.findMany()).map((c) => [c.name, c.id]));

  console.log(`Seeding ${catalog.products.length} products…`);
  let n = 0;
  for (const p of catalog.products) {
    const categoryId = categories.get(p.category)!;
    const fabricId = fabrics.get(p.fabric)!;

    const product = await prisma.product.upsert({
      where: { externalId: p.externalId },
      update: {
        name: p.name,
        slug: p.slug,
        categoryId,
        fabricId,
        colorName: p.colorName,
        colorHex: p.colorHex,
        colorGroup: p.colorGroup,
        limited: p.limited,
        reverseSide: p.reverseSide,
        imageFilename: p.imageFilename,
      },
      create: {
        externalId: p.externalId,
        name: p.name,
        slug: p.slug,
        categoryId,
        fabricId,
        colorName: p.colorName,
        colorHex: p.colorHex,
        colorGroup: p.colorGroup,
        limited: p.limited,
        reverseSide: p.reverseSide,
        imageFilename: p.imageFilename,
        keywords: p.keywords ?? "",
      },
    });

    await prisma.productSize.deleteMany({ where: { productId: product.id } });
    const sizeLinks = p.sizes.map((s) => sizes.get(s)).filter(Boolean) as string[];
    if (sizeLinks.length) {
      await prisma.productSize.createMany({
        data: sizeLinks.map((sizeId) => ({ productId: product.id, sizeId })),
        skipDuplicates: true,
      });
    }

    await prisma.productCollection.deleteMany({ where: { productId: product.id } });
    const collLinks = p.collections.map((c) => collections.get(c)).filter(Boolean) as string[];
    if (collLinks.length) {
      await prisma.productCollection.createMany({
        data: collLinks.map((collectionId) => ({ productId: product.id, collectionId })),
        skipDuplicates: true,
      });
    }

    if (++n % 200 === 0) console.log(`  …${n}`);
  }

  console.log("Seeding Design Center…");
  // Replace the Design Center set wholesale so re-runs stay in sync with this file.
  await prisma.designCenterItem.deleteMany({});
  await prisma.designCenterItem.createMany({
    data: DESIGN_CENTER.map((d, i) => ({
      section: d.section,
      type: d.type,
      title: d.title,
      description: d.description ?? "",
      accentHex: d.accentHex ?? null,
      url: d.url ?? "",
      order: i,
    })),
  });

  console.log("Ensuring home hero slides exist…");
  if ((await prisma.heroSlide.count()) === 0) {
    await prisma.heroSlide.createMany({
      data: [
        { order: 0, imagePath: "/home/hero-1.jpg", alt: "An outdoor wedding table set with Windy City Linen" },
        { order: 1, imagePath: "/home/hero-2.jpg", alt: "An overhead view of a spring table with a pale runner" },
        { order: 2, imagePath: "/home/hero-3.jpg", alt: "A gala table with a watercolor floral runner" },
        { order: 3, imagePath: "/home/hero-4.jpg", alt: "A close-up of navy lace linen with a folded napkin" },
      ],
    });
    console.log("  created 4 hero slides");
  } else {
    console.log("  hero slides already exist");
  }

  console.log("Ensuring team members exist…");
  if ((await prisma.teamMember.count()) === 0) {
    await prisma.teamMember.createMany({
      data: [
        {
          order: 0,
          name: "Robert Spiro",
          title: "",
          imagePath: "/team/robert-spiro.jpg",
          bio: [
            "Rob graduated from the University of Iowa with a BBA in accounting. He then spent ten years in public accounting, specializing in small business and tax planning.",
            "From there, he branched out and opened a dry cleaning business, where Rob oversaw the day-to-day operations. Taking advantage of an under-served market, Rob and his brother were able to grow the company to one of the largest dry cleaners on the North Shore.",
            "During his time there, Rob and his partners opened up Windy City Linen, started to provide a great service to another under-served market. By combining their production and retail experience, Rob and his partners were able to grow Windy City Linen into one of the premier providers of event linen in the Chicagoland area.",
          ].join("\n\n"),
        },
        {
          order: 1,
          name: "Henry O'Young",
          title: "",
          imagePath: "/team/henry-oyoung.jpg",
          bio: [
            "Henry, one of the founders of Windy City Linen, is the organization's Director of Operations, working directly with department managers to achieve the company's goals.",
            "Henry prides himself on providing the best products and service to our clients. Prior to Windy City Linen, Henry came from a 3rd generation family of food manufacturing. Henry brings a wealth of management experience to the company.",
          ].join("\n\n"),
        },
        {
          order: 2,
          name: "Marcela Aduna",
          title: "Managing Partner",
          imagePath: "/team/marcela-aduna.jpg",
          bio: [
            "With over 20 years of management experience, Marcela has proven her reliability and determination leading our daily operations and Sales teams, optimizing client experiences, and driving business development.",
            "Marcela joined the Windy City Linen team in 2009, growing from an ambitious Customer Service Representative to General Manager. Marcela's vast knowledge and experience in the linen industry has proven invaluable to the success of Windy City Linen.",
            "A member of the Catering Executive's Club and an active member in the special events industry, Marcela brings her passion for building and maintaining customer relationships to the forefront of her role. A Chicago native, Marcela enjoys traveling and spending quality time with family and friends.",
          ].join("\n\n"),
        },
        {
          order: 3,
          name: "Debra Westfall",
          title: "Sales Representative",
          imagePath: "/team/debra-westfall.jpg",
          bio: [
            "For years, Debra has been a shining star in our industry — her exuberant personality, client care and unwavering commitment have earned her numerous accolades. A true professional, she's built an impeccable reputation that is second-to-none.",
            "Debra is our team cheerleader, encouraging all to be the best personally and professionally, with her “Go Get 'em” motto. Debra's many affiliations include working as a Breast Cancer Mentor for Imerman's Angels and an active member of The Catering Executive's Club.",
            "Debra and her 3 French Bulldog children call the City of Chicago home, enjoying all its cultural and culinary experiences.",
          ].join("\n\n"),
        },
        {
          order: 4,
          name: "Tera Stamm",
          title: "Sales Representative",
          imagePath: "/team/tera-stamm.jpg",
          bio: [
            "A native of Wisconsin, Tera has achieved a lot in her 20 years in the special events industry. She is a role model for the entire Windy City brand.",
            "During her long and distinguished career in the hospitality field through various positions in the Milwaukee area, she never wavered in the values that have made her special to her team and customers alike: a positive outlook, incredible energy, strong leadership, and an ever-present smile.",
            "When not in the role of @terathelinenlady, she spends the nights as a “mom” uber, transporting kids to various sporting events or traveling with family.",
          ].join("\n\n"),
        },
        {
          order: 5,
          name: "Brooke Marino",
          title: "Sales Representative",
          imagePath: "/team/brooke-marino.jpg",
          bio: [
            "Our newest team member, Brooke is an outside sales specialist with over 20 years of sales experience. A native of the Chicago area her entire life, Brooke graduated from Southern Illinois University with a BS in Interior Architectural Design.",
            "In 2021, Brooke brought her experience in sales and the special event industry to Windy City Linen. “My combined passion for design and past professional background of Country Club Management and Event Planning makes event decor sales the perfect career for me! I love that my work takes me to the most beautiful spaces, gifted the opportunity to work with creative people and no two projects are ever the same.”",
            "She continues to live in the greater Chicago area, where she enjoys networking with organizations associated with professional and personal interests. Brooke aspires to establish and sustain strong relationships among the Windy City team and clients. In her free time, Brooke enjoys time with her friends, family including her Bernedoodle George Michael, and traveling.",
          ].join("\n\n"),
        },
      ],
    });
    console.log("  created 6 team members");
  } else {
    console.log("  team members already exist");
  }

  console.log("Ensuring FAQ items exist…");
  if ((await prisma.faqItem.count()) === 0) {
    await prisma.faqItem.createMany({
      data: [
        {
          order: 0,
          question: "How do I place an order?",
          answer:
            "Browse the catalog, pick a fabric, color and size, and add it to My Inspirations — no account or checkout needed. Once your list is ready, send it to our team from the My Inspirations page and we'll follow up with pricing and availability, usually within one business day.",
        },
        {
          order: 1,
          question: "How do I know what size linen I need?",
          answer:
            "Chat with Bridgette (the assistant on every page) with your table shape and size and she'll recommend a linen size using our real sizing chart. You're also welcome to call or email our team directly.",
        },
        {
          order: 2,
          question: "Do you deliver and set up?",
          answer:
            "We serve the Chicagoland and Milwaukee areas, with showrooms in Wheeling, IL and Elm Grove, WI. Delivery, setup and pickup details are confirmed with our team once we know your event date and venue.",
        },
        {
          order: 3,
          question: "Are your linens cleaned and pressed before each event?",
          answer:
            "Yes — every linen is professionally cleaned and pressed before it goes out to an event.",
        },
        {
          order: 4,
          question: "Can I see a fabric sample before booking?",
          answer:
            "Yes. Check the digital swatch cards in our Design Center for true-to-color previews, or contact our team to request a physical sample.",
        },
        {
          order: 5,
          question: "Do you have a minimum order?",
          answer:
            "It depends on your event — reach out to our team with your date and details and they'll walk you through it.",
        },
        {
          order: 6,
          question: "What if something isn't right with my order?",
          answer:
            "Let our team know right away — call or email us and we'll work with you to make it right.",
        },
        {
          order: 7,
          question: "What areas do you serve?",
          answer:
            "We serve events throughout Chicagoland and Milwaukee, from intimate dinners to galas of two thousand guests, with showrooms in Wheeling, IL and Elm Grove, WI.",
        },
      ],
    });
    console.log("  created 8 FAQ items");
  } else {
    console.log("  FAQ items already exist");
  }

  console.log("Ensuring an admin user exists…");
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    const existing = await prisma.adminUser.findUnique({ where: { email } });
    if (!existing) {
      await prisma.adminUser.create({
        data: { email, passwordHash: await bcrypt.hash(password, 12), name: "Windy City Linen" },
      });
      console.log(`  created admin: ${email}`);
    } else {
      console.log(`  admin already exists: ${email}`);
    }
  } else {
    console.log("  ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping");
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
