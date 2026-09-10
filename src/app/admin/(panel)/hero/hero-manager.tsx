"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { Card, adminInput, adminLabel, SubmitButton } from "@/components/admin/ui";
import { ImageUpload } from "@/components/admin/image-upload";
import {
  saveHeroSlide,
  addHeroSlide,
  deleteHeroSlide,
  moveHeroSlide,
  type HeroState,
} from "@/lib/admin/hero";

type Slide = { id: string; imagePath: string; alt: string; published: boolean };

export function HeroManager({ slides }: { slides: Slide[] }) {
  const [pending, start] = useTransition();

  return (
    <div className="space-y-4">
      {slides.length === 0 && (
        <Card className="p-6 text-sm text-ink-soft">No slides yet.</Card>
      )}

      {slides.map((slide, i) => (
        <SlideRow
          key={slide.id}
          slide={slide}
          first={i === 0}
          last={i === slides.length - 1}
        />
      ))}

      {slides.length < 8 && (
        <button
          type="button"
          disabled={pending}
          onClick={() => start(() => addHeroSlide())}
          className="border border-line bg-white px-4 py-2 text-sm font-medium hover:border-ink disabled:opacity-50"
        >
          Add slide
        </button>
      )}
    </div>
  );
}

const initial: HeroState = {};

function SlideRow({
  slide,
  first,
  last,
}: {
  slide: Slide;
  first: boolean;
  last: boolean;
}) {
  const [state, formAction, saving] = useActionState(
    saveHeroSlide.bind(null, slide.id),
    initial,
  );
  const [imagePath, setImagePath] = useState(slide.imagePath);
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
            className="aspect-[4/3] w-full rounded-sm border border-line bg-ivory bg-cover bg-center"
            style={imagePath ? { backgroundImage: `url(${imagePath})` } : undefined}
          />
          <div className="mt-2">
            <ImageUpload onUploaded={setImagePath} label="Upload image" />
          </div>
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className={adminLabel}>Image path</span>
            <input
              name="imagePath"
              value={imagePath}
              onChange={(e) => setImagePath(e.target.value)}
              className={adminInput}
              placeholder="/home/hero-1.jpg or a full URL"
            />
          </label>
          <label className="block">
            <span className={adminLabel}>Caption / alt text</span>
            <input name="alt" defaultValue={slide.alt} className={adminInput} />
          </label>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="published" defaultChecked={slide.published} />{" "}
              Show on the home page
            </label>

            <div className="ml-auto flex items-center gap-1 text-xs text-ink-soft">
              <button
                type="button"
                disabled={first || pending}
                onClick={() => start(() => moveHeroSlide(slide.id, "up"))}
                className="px-1.5 disabled:opacity-30"
                aria-label="Move up"
              >
                ↑
              </button>
              <button
                type="button"
                disabled={last || pending}
                onClick={() => start(() => moveHeroSlide(slide.id, "down"))}
                className="px-1.5 disabled:opacity-30"
                aria-label="Move down"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm("Delete this slide?")) start(() => deleteHeroSlide(slide.id));
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
              {saving ? "Saving…" : "Save slide"}
            </SubmitButton>
            {savedFlash && <span className="text-xs text-sage">Saved</span>}
          </div>
        </div>
      </form>
    </Card>
  );
}
