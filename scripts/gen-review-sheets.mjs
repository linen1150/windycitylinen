import sharp from "sharp";
import { readFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const rows = JSON.parse(readFileSync("scripts/_gallery-caption-matches-medlow.json", "utf8"));
const OUT_DIR = "scripts/_review-sheets";
mkdirSync(OUT_DIR, { recursive: true });

const COLS = 4;
const ROWS = 4;
const PER_SHEET = COLS * ROWS;
const CELL_W = 260;
const CELL_H = 260;
const LABEL_H = 70;
const PAD = 8;

function escapeXml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function wrapText(text, maxChars) {
  const words = text.split(" ");
  const lines = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > maxChars) {
      if (cur) lines.push(cur.trim());
      cur = w;
    } else {
      cur = (cur + " " + w).trim();
    }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 3);
}

async function makeCell(row, index) {
  const thumb = await sharp(path.join("public/gallery", row.Photo))
    .resize(CELL_W, CELL_H, { fit: "cover" })
    .jpeg()
    .toBuffer();

  const lines = [
    `#${row["#"]} [${row.Confidence}]`,
    ...wrapText(row["Best Match"], 26),
  ];
  const svg = `
    <svg width="${CELL_W}" height="${LABEL_H}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="white"/>
      ${lines
        .map(
          (line, i) =>
            `<text x="6" y="${16 + i * 16}" font-family="Arial" font-size="13" fill="black">${escapeXml(line)}</text>`,
        )
        .join("")}
    </svg>`;
  const label = await sharp(Buffer.from(svg)).png().toBuffer();

  const cell = await sharp({
    create: { width: CELL_W, height: CELL_H + LABEL_H, channels: 3, background: "#ffffff" },
  })
    .composite([
      { input: thumb, top: 0, left: 0 },
      { input: label, top: CELL_H, left: 0 },
    ])
    .jpeg()
    .toBuffer();

  return cell;
}

const sheetCount = Math.ceil(rows.length / PER_SHEET);
for (let s = 0; s < sheetCount; s++) {
  const chunk = rows.slice(s * PER_SHEET, (s + 1) * PER_SHEET);
  const cells = await Promise.all(chunk.map((r, i) => makeCell(r, i)));

  const sheetW = COLS * (CELL_W + PAD) + PAD;
  const sheetH = ROWS * (CELL_H + LABEL_H + PAD) + PAD;
  const composites = cells.map((buf, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    return { input: buf, left: PAD + col * (CELL_W + PAD), top: PAD + row * (CELL_H + LABEL_H + PAD) };
  });

  await sharp({ create: { width: sheetW, height: sheetH, channels: 3, background: "#dddddd" } })
    .composite(composites)
    .jpeg({ quality: 80 })
    .toFile(path.join(OUT_DIR, `sheet-${String(s + 1).padStart(2, "0")}.jpg`));

  console.log(`Wrote sheet-${String(s + 1).padStart(2, "0")}.jpg (${chunk.length} items, rows ${s * PER_SHEET + 1}-${s * PER_SHEET + chunk.length})`);
}
