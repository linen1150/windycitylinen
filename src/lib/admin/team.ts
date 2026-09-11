"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export type TeamState = { error?: string; ok?: boolean };

function revalidate() {
  revalidatePath("/admin/team");
  revalidatePath("/about");
}

const saveSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  title: z.string().trim().max(120).optional().or(z.literal("")),
  bio: z.string().trim().max(3000).optional().or(z.literal("")),
  imagePath: z.string().trim().max(600).optional().or(z.literal("")),
  published: z.coerce.boolean(),
});

export async function saveTeamMember(
  id: string,
  _prev: TeamState,
  formData: FormData,
): Promise<TeamState> {
  await requireAdmin();
  const parsed = saveSchema.safeParse({
    name: formData.get("name"),
    title: formData.get("title") ?? "",
    bio: formData.get("bio") ?? "",
    imagePath: formData.get("imagePath") ?? "",
    published: formData.get("published") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the fields and try again." };

  await db.teamMember.update({
    where: { id },
    data: {
      name: parsed.data.name,
      title: parsed.data.title ?? "",
      bio: parsed.data.bio ?? "",
      imagePath: (parsed.data.imagePath ?? "").trim(),
      published: parsed.data.published,
    },
  });
  revalidate();
  return { ok: true };
}

export async function addTeamMember(): Promise<void> {
  await requireAdmin();
  const count = await db.teamMember.count();
  await db.teamMember.create({
    data: { order: count, name: "New team member", bio: "", published: false },
  });
  revalidate();
}

export async function deleteTeamMember(id: string): Promise<void> {
  await requireAdmin();
  await db.teamMember.delete({ where: { id } });
  const rest = await db.teamMember.findMany({ orderBy: { order: "asc" } });
  await db.$transaction(
    rest.map((m, i) => db.teamMember.update({ where: { id: m.id }, data: { order: i } })),
  );
  revalidate();
}

export async function moveTeamMember(id: string, dir: "up" | "down"): Promise<void> {
  await requireAdmin();
  const member = await db.teamMember.findUnique({ where: { id } });
  if (!member) return;
  const neighbour = await db.teamMember.findFirst({
    where: { order: dir === "up" ? { lt: member.order } : { gt: member.order } },
    orderBy: { order: dir === "up" ? "desc" : "asc" },
  });
  if (!neighbour) return;
  await db.$transaction([
    db.teamMember.update({ where: { id: member.id }, data: { order: neighbour.order } }),
    db.teamMember.update({ where: { id: neighbour.id }, data: { order: member.order } }),
  ]);
  revalidate();
}
