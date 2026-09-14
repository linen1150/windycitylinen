// One-off: fills in the rest of the Photo Shot List's "missing" items.
// Each entry is either a genuinely new photo (Picnic Check Raspberry runner)
// or a real photo borrowed from a sibling piece in the exact same color —
// the same color, just a different item type — as a stand-in until a
// dedicated shot exists. Every stand-in is noted as such in the shot list.
//
// Run against local dev DB by default; pass DATABASE_URL=<production> to
// run against production instead.
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function uniqueSlug(base) {
  let slug = base;
  let n = 1;
  while (await db.product.findFirst({ where: { slug } })) {
    slug = `${base}-${++n}`;
  }
  return slug;
}

async function categoryId(name) {
  const c = await db.category.findFirst({ where: { name } });
  if (!c) throw new Error(`Missing category ${name}`);
  return c.id;
}
async function fabricId(name) {
  const f = await db.fabric.findFirst({ where: { name } });
  if (!f) throw new Error(`Missing fabric ${name}`);
  return f.id;
}
async function sizeIds(names) {
  const rows = await db.size.findMany({ where: { name: { in: names } } });
  if (rows.length !== names.length) throw new Error(`Missing sizes among ${names.join(", ")}`);
  return rows.map((r) => r.id);
}

async function main() {
  const napkinsCat = await categoryId("Napkins");
  const runnersCat = await categoryId("Table Runners");
  const cuffsCat = await categoryId("Cuffs");
  const clothsCat = await categoryId("Tablecloths and Overlays");

  const napkinSize = await sizeIds(["Napkins"]);
  const runnerSize = await sizeIds(["Runners"]);
  const cuffSize = await sizeIds(["Cuffs"]);
  const clothSizes = await sizeIds([
    "54\" Square", "90\" Square", "90\" Round", "96\" Round", "108\" Round",
    "120\" Square", "120\" Round", "132\" Square", "132\" Round",
    "72\"x120\" Banquet", "90\"x132\" Banquet", "90\"x156\" Banquet",
    "108\"x156\" Banquet", "114\"x180\" Banquet",
  ]);

  const entries = [
    {
      name: "Classic Solid Forest Green", colorName: "Forest Green", colorGroup: "Green",
      keywords: "green, hunter", categoryId: napkinsCat, fabricId: await fabricId("Classic Solid"),
      colorHex: "#2E5339", imageFilename: "/images/Tablecloths and Overlays/forest.jpg",
      sizeIds: napkinSize, slugBase: "classic-solid-forest-green-napkin",
    },
    {
      name: "Classic Solid Coral", colorName: "Coral", colorGroup: "Orange",
      keywords: "Peach", categoryId: napkinsCat, fabricId: await fabricId("Classic Solid"),
      colorHex: "#E8836B", imageFilename: "/images/Tablecloths and Overlays/coralv3.jpg",
      sizeIds: napkinSize, slugBase: "classic-solid-coral-napkin",
    },
    {
      name: "Classic Solid Dusty Rose", colorName: "Dusty Rose", colorGroup: "Pink/Blush",
      keywords: "Pink", categoryId: napkinsCat, fabricId: await fabricId("Classic Solid"),
      colorHex: "#C98A93", imageFilename: "/images/Tablecloths and Overlays/dustyrose.jpg",
      sizeIds: napkinSize, slugBase: "classic-solid-dusty-rose-napkin",
    },
    {
      name: "Raspberry", colorName: "Raspberry", colorGroup: "Multicolor",
      keywords: "", categoryId: runnersCat, fabricId: await fabricId("Picnic Check"),
      colorHex: "#9C2B4E", imageFilename: "/images/Table Runners/Runner-RaspberryPicnicCheck.jpg",
      sizeIds: runnerSize, slugBase: "picnic-check-raspberry-runner",
    },
    {
      name: "Picnic Check Raspberry", colorName: "Raspberry", colorGroup: "Multicolor",
      keywords: "", categoryId: clothsCat, fabricId: await fabricId("Picnic Check"),
      colorHex: "#9C2B4E", imageFilename: "/images/Table Runners/Runner-RaspberryPicnicCheck.jpg",
      sizeIds: clothSizes, slugBase: "picnic-check-raspberry",
    },
    {
      name: "Matte Lamour Teal", colorName: "Teal", colorGroup: "Blue",
      keywords: "", categoryId: runnersCat, fabricId: await fabricId("Matte Lamour"),
      colorHex: "#1B7B7A", imageFilename: "/images/Tablecloths and Overlays/mattelamourteal.jpg",
      sizeIds: runnerSize, slugBase: "matte-lamour-teal-runner",
    },
    {
      name: "Matte Lamour Raspberry", colorName: "Raspberry", colorGroup: "Pink/Blush",
      keywords: "", categoryId: clothsCat, fabricId: await fabricId("Matte Lamour"),
      colorHex: "#9C2B4E", imageFilename: "/images/Tablecloths and Overlays/MatteLamourRaspberry.jpg",
      sizeIds: clothSizes, slugBase: "matte-lamour-raspberry",
    },
    {
      name: "Mirage Cloud", colorName: "Mirage Cloud", colorGroup: "Brown/Beige/Cafe/Tan",
      keywords: "", categoryId: clothsCat, fabricId: await fabricId("Mirage"),
      colorHex: "#B6A899", imageFilename: "/images/Table Runners/Runner-MirageCloud.jpg",
      sizeIds: clothSizes, slugBase: "mirage-cloud",
    },
    {
      name: "Velvet Taupe", colorName: "Velvet Taupe", colorGroup: "Brown/Beige/Cafe/Tan",
      keywords: "Luxe,, winter,, gatsby,, fall,, autumn,, gala,, upscale,, wedding,, masculine,, brown,, tan,, greige",
      categoryId: runnersCat, fabricId: await fabricId("Specialty"),
      colorHex: "#B6A899", imageFilename: "/images/Tablecloths and Overlays/luxetaupevelvet1.jpg",
      sizeIds: runnerSize, slugBase: "velvet-taupe-runner",
    },
    {
      name: "Velvet Taupe", colorName: "Velvet Taupe", colorGroup: "Brown/Beige/Cafe/Tan",
      keywords: "Luxe,, winter,, gatsby,, fall,, autumn,, gala,, upscale,, wedding,, masculine,, brown,, tan,, greige",
      categoryId: napkinsCat, fabricId: await fabricId("Specialty"),
      colorHex: "#B6A899", imageFilename: "/images/Tablecloths and Overlays/luxetaupevelvet1.jpg",
      sizeIds: napkinSize, slugBase: "velvet-taupe-napkin",
    },
    {
      name: "Velvet Taupe", colorName: "Velvet Taupe", colorGroup: "Brown/Beige/Cafe/Tan",
      keywords: "Luxe,, winter,, gatsby,, fall,, autumn,, gala,, upscale,, wedding,, masculine,, brown,, tan,, greige",
      categoryId: cuffsCat, fabricId: await fabricId("Specialty"),
      colorHex: "#B6A899", imageFilename: "/images/Tablecloths and Overlays/luxetaupevelvet1.jpg",
      sizeIds: cuffSize, slugBase: "velvet-taupe-cuff",
    },
    {
      name: "Shantung Black Reversed", colorName: "Black", colorGroup: "Black",
      keywords: "halloween, masculine, gala, NYE, disco", categoryId: napkinsCat, fabricId: await fabricId("Shantung"),
      colorHex: "#20232A", imageFilename: "/images/Tablecloths and Overlays/shantungblack2.jpg",
      sizeIds: napkinSize, slugBase: "shantung-black-reversed-napkin", reverseSide: true,
    },
  ];

  for (const e of entries) {
    const existing = await db.product.findFirst({
      where: {
        categoryId: e.categoryId,
        colorName: e.colorName,
        fabricId: e.fabricId,
        reverseSide: !!e.reverseSide,
      },
    });
    if (existing) {
      console.log(`Skipping ${e.name} (${e.colorName}) — already exists (${existing.slug})`);
      continue;
    }
    const slug = await uniqueSlug(e.slugBase);
    const product = await db.product.create({
      data: {
        name: e.name,
        slug,
        categoryId: e.categoryId,
        fabricId: e.fabricId,
        colorName: e.colorName,
        colorHex: e.colorHex,
        colorGroup: e.colorGroup,
        keywords: e.keywords,
        imageFilename: e.imageFilename,
        limited: false,
        reverseSide: !!e.reverseSide,
        published: true,
        sizes: { create: e.sizeIds.map((sizeId) => ({ sizeId })) },
      },
    });
    console.log(`Created ${product.name} -> ${product.slug} (${product.id})`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
