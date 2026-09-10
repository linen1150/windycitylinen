import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { DesignCenterManager } from "./design-center-manager";

export const dynamic = "force-dynamic";

export default async function AdminDesignCenterPage() {
  const items = await db.designCenterItem.findMany({
    orderBy: [{ section: "asc" }, { order: "asc" }],
  });

  return (
    <div>
      <PageHeader
        title="Design Center"
        description="Lookbooks, swatch cards and videos shown on /design-center. Add a URL to make a card link to a real document or video."
      />
      <DesignCenterManager
        items={items.map((i) => ({
          id: i.id,
          section: i.section,
          type: i.type,
          title: i.title,
          description: i.description,
          url: i.url,
          accentHex: i.accentHex ?? "",
          published: i.published,
        }))}
      />
    </div>
  );
}
