import sharp from "sharp";
import { mkdirSync } from "node:fs";

const SIZE = 900;
const OUT = "public/visualizer";
mkdirSync(OUT, { recursive: true });

// Background: a plain neutral "room/table" scene — placeholder until real
// table photography exists (see tablecloth-visualizer-spec.md).
const bgSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">
  <defs>
    <radialGradient id="room" cx="50%" cy="38%" r="75%">
      <stop offset="0%" stop-color="#efe9dd"/>
      <stop offset="100%" stop-color="#cfc4ac"/>
    </radialGradient>
  </defs>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#room)"/>
  <ellipse cx="450" cy="470" rx="360" ry="330" fill="#00000012"/>
  <rect x="380" y="760" width="18" height="110" rx="4" fill="#5b4a36"/>
  <rect x="502" y="760" width="18" height="110" rx="4" fill="#5b4a36"/>
</svg>`;

// Shading layer: a round tablecloth silhouette with a gentle fold pattern,
// grayscale so `mix-blend-mode: multiply` reads it as pure shading. Alpha is
// cut to the circle so multiply only affects the cloth, not the background.
const shadingSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">
  <defs>
    <radialGradient id="folds" cx="50%" cy="46%" r="52%">
      <stop offset="0%"  stop-color="#ffffff"/>
      <stop offset="18%" stop-color="#f2f2f2"/>
      <stop offset="30%" stop-color="#dcdcdc"/>
      <stop offset="42%" stop-color="#efefef"/>
      <stop offset="55%" stop-color="#cfcfcf"/>
      <stop offset="68%" stop-color="#e8e8e8"/>
      <stop offset="80%" stop-color="#bdbdbd"/>
      <stop offset="92%" stop-color="#d6d6d6"/>
      <stop offset="100%" stop-color="#a6a6a6"/>
    </radialGradient>
    <clipPath id="cloth">
      <circle cx="450" cy="450" r="330"/>
    </clipPath>
  </defs>
  <g clip-path="url(#cloth)">
    <rect width="${SIZE}" height="${SIZE}" fill="url(#folds)"/>
    ${Array.from({ length: 16 }, (_, i) => {
      const angle = (i / 16) * Math.PI * 2;
      const x2 = 450 + Math.cos(angle) * 330;
      const y2 = 450 + Math.sin(angle) * 330;
      return `<line x1="450" y1="450" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#00000014" stroke-width="3"/>`;
    }).join("\n    ")}
  </g>
</svg>`;

await sharp(Buffer.from(bgSvg)).jpeg({ quality: 88 }).toFile(`${OUT}/test-round-bg.jpg`);
await sharp(Buffer.from(shadingSvg)).png().toFile(`${OUT}/test-round-shading.png`);

console.log("Wrote placeholder visualizer assets to", OUT);
