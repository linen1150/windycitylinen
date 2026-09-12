import sharp from "sharp";
import { readdirSync, statSync, mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const SRC = "C:\\Users\\rob\\WCL Sales Dropbox\\WCL Sales Team Folder\\Photography\\Event Photos";
const OUT_DIR = "public/gallery";
const MANIFEST = "scripts/_gallery-manifest.json";

// The folders the first pass (import-gallery-photos.mjs) reported as skipped —
// retried here with a recursive file walk (some have photos in a nested
// subfolder, e.g. "Santorini/Dominika Photography").
const RETRY = [
  "2026 Spring New Linens", "BROWN CHOCOLATE LAMOUR 2020 River Valley", "Cairns Runner",
  "Cairns Runners, Teal Lamour Napkins", "Denizen Milwaukee  Multiple",
  "Driftwood serentity wedgewood shant cornsilk Boulder Ridge CC",
  "Gather Shoot - Kayla Dutcher Photography (web-size)", "HELENA 2020 Fete of Wales",
  "HELENA WHITES Culinary Infusion", "IVORY LONG TABLES 2021 Florist in Bloom-Marina Wenning",
  "IVORY NAPKINS AND RUNNER ON WOOD Murray Mansion", "Ivory Velvet and Blush Soiree",
  "Ivory Verve Wedding University Club", "Koran Velvet",
  "Lavender Steel Seamist Harmony Phoebe @lottie.lillian SEE TAGS", "Light blue lmaour Flower Show Shoot",
  "Loden Honey Mirage Hampton Botanical", "Loden Ivory Lace Burlap @sazhospitalitygroup", "Loden Release",
  "Lorelei Debi Lily", "Lorelei IG @heathercookelliott  @bartolottadiscoveryworld   @BartolottaDiscoveryWorld",
  "Lorelei, Willow Check Carriage House", "Lucia", "Luica Cambric English Rose SEE TAGS", "Merlot",
  "Nantucket Coastal Serenity Santorini", "Papaya Soiree Lipstick @lottie.lillian SEE TAGS",
  "Phoebe Carriage House", "Photos Emerson Creek", "Pistacio 2018-7 Lunch in Capri Kent Drake Photography",
  "RED AND LIME POLKA DOT MIXED WITH CHEVRON directsupplychristmas-photo-download-1of1",
  "RED RUNNERS valentinesdaystyledshoot", "SANTORINI The Marvelous Metals", "Santorini", "Sequins Blush",
  "Slate Blue @reneebreannedesign", "Spandex", "Symphony of Love Chi Symphony Orchestra",
  "VARIETY 2018 - Tutti Frutti shootout", "VARIETY SHOWCASE 2022 Holiday", "VARIEY SPRINGY Evoke Milwaukee",
  "VENUE 5126 - ALL Wedding shots  Varies Colors", "Variety woodland Josephine dogwood and more August 2nd Shoot",
  "Velvet - Gracier Grey", "Velvet Charcoal", "WHITE JUTE AND RUNNER 2020-17 Covenant at Murray",
  "WHITE, LACE and Pink runners 2021 Covenant on Murray Mansion", "WOODLAND Jeff and Anthony Wedding Photos (Details)",
  "Water Lily - The Haight", "White Classic", "White Jute", "White Jute and Sand Harmony Roost Photography Denizen Venue",
  "White Jute, Coastal Napkins , Papaya Nap 11_26_23 Red Circle Inn Showcase, Molly Khanna Photography",
  "White Ornamental Lace, Light Blue Classic, Nantucket, Apricot Jute", "White Shantung w  Fern OHANA", "White Soiree",
  "White Stone Events- White Classic Blush & Black Napkins", "White Verve & STEPH KADLICKO",
  "White Verve and Black Velvet @AutumnSilvaPhotography @stjames1868 @janekellyfloral @reneebreannedesign",
  "White Verve- Ocean Samba Whitney & Matsaya Photography", "Willow Check Willow Serenity Vanilla Mirage",
  "Willow Check napkins", "Willow Lorelei Crush runners Venue 5126 WEDDING WEDNESDAY", "Willow Mini Check Napkin",
  "Windsor Santorini Glacier Velvet", "Woodland", "Woodland - Close up no tags",
  "Woodland Morton Arboretum Shamrock Gardens", "Woodland St Charles CC", "YELLOW LEMONS MKE Knot Mixer",
  "Yellow and orange banquets large convention PWE", "white banquets Corkys Pics",
];

const IMAGE_RE = /\.(jpe?g|png)$/i;
const HEIC_RE = /\.heic$/i;

function walkFiles(dir) {
  let out = [];
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out = out.concat(walkFiles(full));
    else if (e.isFile()) out.push(full);
  }
  return out;
}

function slug(name) {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50);
  const hash = crypto.createHash("md5").update(name).digest("hex").slice(0, 6);
  return `${base || "event"}-${hash}`;
}

mkdirSync(OUT_DIR, { recursive: true });
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : [];
const skipped = [];
let added = 0;

for (const folder of RETRY) {
  const dir = path.join(SRC, folder);
  const files = walkFiles(dir);
  const jpgPngFiles = files.filter((f) => IMAGE_RE.test(f));
  const heicFiles = files.filter((f) => HEIC_RE.test(f));
  const candidates = jpgPngFiles.length > 0 ? jpgPngFiles : heicFiles;

  if (candidates.length === 0) {
    skipped.push({ folder, reason: "still no image files (nested or otherwise)" });
    continue;
  }

  const withSize = candidates.map((f) => ({ path: f, size: statSync(f).size }));
  withSize.sort((a, b) => b.size - a.size);
  const chosen = withSize[0];
  const s = slug(folder);
  const outPath = path.join(OUT_DIR, `${s}.jpg`);

  try {
    await sharp(chosen.path, { failOn: "none" })
      .rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(outPath);
    manifest.push({ folder, imagePath: `/gallery/${s}.jpg`, caption: "" });
    added++;
  } catch (err) {
    skipped.push({ folder, reason: `sharp failed on ${path.basename(chosen.path)}: ${err.message.split("\n")[0]}` });
  }
}

writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
console.log(`Added ${added} more photos. Total in manifest: ${manifest.length}`);
console.log(`Still skipped ${skipped.length}:`);
for (const s of skipped) console.log(`  - ${s.folder}: ${s.reason}`);
