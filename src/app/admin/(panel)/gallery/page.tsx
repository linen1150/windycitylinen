import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { GalleryManager } from "./gallery-manager";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const items = await db.galleryItem.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <PageHeader
        title="Gallery"
        description="Real event photos shown on the Gallery page. Add, edit, reorder, hide, or delete a photo."
      />
      <GalleryManager
        items={items.map((i) => ({
          id: i.id,
          imagePath: i.imagePath,
          caption: i.caption,
          published: i.published,
        }))}
      />
    </div>
  );
}
