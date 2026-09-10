import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { HeroManager } from "./hero-manager";

export const dynamic = "force-dynamic";

export default async function AdminHeroPage() {
  const slides = await db.heroSlide.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <PageHeader
        title="Home hero"
        description="The rotating photos at the top of the home page. Upload a replacement image, edit the caption (used as alt text), reorder, or hide a slide."
      />
      <HeroManager
        slides={slides.map((s) => ({
          id: s.id,
          imagePath: s.imagePath,
          alt: s.alt,
          published: s.published,
        }))}
      />
    </div>
  );
}
