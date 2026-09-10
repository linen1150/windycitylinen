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
const DESIGN_CENTER: Array<{
  section: DesignCenterSection;
  type: DesignCenterType;
  title: string;
  description?: string;
  accentHex?: string;
}> = [
  { section: "DESIGN_CENTER", type: "LINK", title: "Autumn 2026", description: "Seasonal lookbook." },
  { section: "DESIGN_CENTER", type: "LINK", title: "Holiday Look Book", description: "Seasonal lookbook." },
  { section: "DESIGN_CENTER", type: "DOCUMENT", title: "New Additions 2026", description: "What's new this year." },
  { section: "DESIGN_CENTER", type: "DOCUMENT", title: "Universal Sizing Guide", description: "Linen sizes for every table." },
  { section: "DESIGN_CENTER", type: "LINK", title: "Socials & Soirees", description: "Lookbook." },
  { section: "DESIGN_CENTER", type: "LINK", title: "Serenity Look Book", description: "The Serenity fabric, styled." },
  { section: "DESIGN_CENTER", type: "LINK", title: "Jute Look Book", description: "The Jute collection, styled." },
  { section: "DESIGN_CENTER", type: "LINK", title: "Echo Look Book", description: "The Echo collection, styled." },
  { section: "DIGITAL_SWATCH_CARDS", type: "DOCUMENT", title: "Classic Solid", accentHex: "#DACBAA" },
  { section: "DIGITAL_SWATCH_CARDS", type: "DOCUMENT", title: "Jute", accentHex: "#B39A63" },
  { section: "DIGITAL_SWATCH_CARDS", type: "DOCUMENT", title: "Matte Lamour", accentHex: "#DCD6C4" },
  { section: "DIGITAL_SWATCH_CARDS", type: "DOCUMENT", title: "Mirage", accentHex: "#B9C6CC" },
  { section: "DIGITAL_SWATCH_CARDS", type: "DOCUMENT", title: "Picnic Check", accentHex: "#C8D0B9" },
  { section: "DIGITAL_SWATCH_CARDS", type: "DOCUMENT", title: "Serenity", accentHex: "#D3BFC7" },
  { section: "DIGITAL_SWATCH_CARDS", type: "DOCUMENT", title: "Shantung", accentHex: "#E5DFCC" },
  { section: "DIGITAL_SWATCH_CARDS", type: "DOCUMENT", title: "Soiree", accentHex: "#D6B7B0" },
  { section: "DIGITAL_SWATCH_CARDS", type: "DOCUMENT", title: "Specialty", accentHex: "#CFC7B3" },
  { section: "DIGITAL_SWATCH_CARDS", type: "DOCUMENT", title: "Velvet", accentHex: "#3E323A" },
  {
    section: "LINEN_VIDEOS",
    type: "VIDEO",
    title: "WCL Specialty Ties",
    description: "Ashley showcases different linen tying styles.",
  },
  {
    section: "LINEN_VIDEOS",
    type: "VIDEO",
    title: "Windy City Linen | Design Center | Customization",
    description: "Marcela walks through how to customize a linen.",
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
