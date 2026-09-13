import type { Metadata } from "next";
import { VisualizerStage } from "./visualizer-stage";

export const metadata: Metadata = {
  title: "Color Visualizer",
  robots: { index: false, follow: false },
};

export default function VisualizerPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-8">
      <h1 className="font-display text-3xl">Color Visualizer (prototype)</h1>
      <p className="mt-2 max-w-xl text-ink-soft">
        Pick a color to see it draped on a real photographed table. Add a
        base + shading + mask trio for each additional table shape (see
        scripts/gen-visualizer-real-pair.mjs) to expand past the 60&quot; round.
      </p>
      <div className="mt-8">
        <VisualizerStage />
      </div>
    </div>
  );
}
