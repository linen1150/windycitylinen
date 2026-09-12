"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { Card, adminInput, adminLabel, EmptyState, SubmitButton } from "@/components/admin/ui";
import { ImageUpload } from "@/components/admin/image-upload";
import {
  saveGalleryItem,
  addGalleryItem,
  deleteGalleryItem,
  moveGalleryItem,
  type GalleryState,
} from "@/lib/admin/gallery";

type Item = { id: string; imagePath: string; caption: string; published: boolean };

export function GalleryManager({ items }: { items: Item[] }) {
  const [pending, start] = useTransition();

  return (
    <div className="space-y-4">
      {items.length === 0 && <EmptyState>No gallery photos yet.</EmptyState>}

      {items.map((item, i) => (
        <ItemRow key={item.id} item={item} first={i === 0} last={i === items.length - 1} />
      ))}

      <button
        type="button"
        disabled={pending}
        onClick={() => start(() => addGalleryItem())}
        className="border border-line bg-white px-4 py-2 text-sm font-medium hover:border-ink disabled:opacity-50"
      >
        Add photo
      </button>
    </div>
  );
}

const initial: GalleryState = {};

function ItemRow({ item, first, last }: { item: Item; first: boolean; last: boolean }) {
  const [state, formAction, saving] = useActionState(saveGalleryItem.bind(null, item.id), initial);
  const [imagePath, setImagePath] = useState(item.imagePath);
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
      <form action={formAction} className="grid gap-4 sm:grid-cols-[160px_1fr]">
        <div>
          <div
            className="relative aspect-square w-full overflow-hidden rounded-sm border border-line bg-ivory bg-cover bg-center"
            style={imagePath ? { backgroundImage: `url(${imagePath})` } : undefined}
          >
            {item.caption && (
              <span className="absolute inset-x-0 bottom-0 bg-black/60 px-1.5 py-1 text-center text-[11px] leading-tight text-white">
                {item.caption}
              </span>
            )}
          </div>
          <div className="mt-2">
            <ImageUpload onUploaded={setImagePath} label="Upload photo" />
          </div>
        </div>

        <div className="space-y-3">
          <input type="hidden" name="imagePath" value={imagePath} />
          <label className="block">
            <span className={adminLabel}>Caption (optional)</span>
            <input name="caption" defaultValue={item.caption} className={adminInput} />
          </label>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="published" defaultChecked={item.published} /> Show on the Gallery page
            </label>

            <div className="ml-auto flex items-center gap-1 text-xs text-ink-soft">
              <button
                type="button"
                disabled={first || pending}
                onClick={() => start(() => moveGalleryItem(item.id, "up"))}
                className="px-1.5 disabled:opacity-30"
                aria-label="Move up"
              >
                ↑
              </button>
              <button
                type="button"
                disabled={last || pending}
                onClick={() => start(() => moveGalleryItem(item.id, "down"))}
                className="px-1.5 disabled:opacity-30"
                aria-label="Move down"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm("Delete this photo?")) start(() => deleteGalleryItem(item.id));
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
