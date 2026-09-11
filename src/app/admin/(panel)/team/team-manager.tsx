"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { Card, adminInput, adminLabel, SubmitButton } from "@/components/admin/ui";
import { ImageUpload } from "@/components/admin/image-upload";
import {
  saveTeamMember,
  addTeamMember,
  deleteTeamMember,
  moveTeamMember,
  type TeamState,
} from "@/lib/admin/team";

type Member = {
  id: string;
  name: string;
  title: string;
  bio: string;
  imagePath: string;
  published: boolean;
};

export function TeamManager({ members }: { members: Member[] }) {
  const [pending, start] = useTransition();

  return (
    <div className="space-y-4">
      {members.length === 0 && (
        <Card className="p-6 text-sm text-ink-soft">No team members yet.</Card>
      )}

      {members.map((member, i) => (
        <MemberRow
          key={member.id}
          member={member}
          first={i === 0}
          last={i === members.length - 1}
        />
      ))}

      <button
        type="button"
        disabled={pending}
        onClick={() => start(() => addTeamMember())}
        className="border border-line bg-white px-4 py-2 text-sm font-medium hover:border-ink disabled:opacity-50"
      >
        Add team member
      </button>
    </div>
  );
}

const initial: TeamState = {};

function MemberRow({ member, first, last }: { member: Member; first: boolean; last: boolean }) {
  const [state, formAction, saving] = useActionState(saveTeamMember.bind(null, member.id), initial);
  const [imagePath, setImagePath] = useState(member.imagePath);
  const [savedFlash, setSavedFlash] = useState(false);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (state.ok) {
      setSavedFlash(true);
      const t = setTimeout(() => setSavedFlash(false), 2000);
      return () => clearTimeout(t);
    }
  }, [state.ok, state]);

  return (
    <Card className={`p-4 ${pending ? "opacity-60" : ""}`}>
      <form action={formAction} className="grid gap-4 sm:grid-cols-[140px_1fr]">
        <div>
          <div
            className="aspect-square w-full rounded-sm border border-line bg-ivory bg-cover bg-center"
            style={imagePath ? { backgroundImage: `url(${imagePath})` } : undefined}
          />
          <div className="mt-2">
            <ImageUpload onUploaded={setImagePath} label="Upload photo" />
          </div>
        </div>

        <div className="space-y-3">
          <input type="hidden" name="imagePath" value={imagePath} />
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className={adminLabel}>Name</span>
              <input name="name" defaultValue={member.name} required className={adminInput} />
            </label>
            <label className="block">
              <span className={adminLabel}>Title (optional)</span>
              <input name="title" defaultValue={member.title} className={adminInput} placeholder="e.g. Managing Partner" />
            </label>
          </div>
          <label className="block">
            <span className={adminLabel}>Bio</span>
            <textarea name="bio" defaultValue={member.bio} rows={4} className={adminInput} />
          </label>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="published" defaultChecked={member.published} /> Show on the About page
            </label>

            <div className="ml-auto flex items-center gap-1 text-xs text-ink-soft">
              <button
                type="button"
                disabled={first || pending}
                onClick={() => start(() => moveTeamMember(member.id, "up"))}
                className="px-1.5 disabled:opacity-30"
                aria-label="Move up"
              >
                ↑
              </button>
              <button
                type="button"
                disabled={last || pending}
                onClick={() => start(() => moveTeamMember(member.id, "down"))}
                className="px-1.5 disabled:opacity-30"
                aria-label="Move down"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Delete "${member.name}"?`)) start(() => deleteTeamMember(member.id));
                }}
                className="px-1.5 hover:text-wine"
              >
                Delete
              </button>
            </div>
          </div>

          {state.error && <p className="text-sm text-wine">{state.error}</p>}

          <div className="flex items-center gap-3">
            <SubmitButton type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </SubmitButton>
            {savedFlash && <span className="text-xs text-sage">Saved</span>}
          </div>
        </div>
      </form>
    </Card>
  );
}
