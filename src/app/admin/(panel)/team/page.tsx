import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { TeamManager } from "./team-manager";

export const dynamic = "force-dynamic";

export default async function AdminTeamPage() {
  const members = await db.teamMember.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <PageHeader
        title="About Us — Team"
        description="The bios shown on the About page. Add, edit, reorder, hide, or delete a team member."
      />
      <TeamManager
        members={members.map((m) => ({
          id: m.id,
          name: m.name,
          title: m.title,
          bio: m.bio,
          imagePath: m.imagePath,
          published: m.published,
        }))}
      />
    </div>
  );
}
