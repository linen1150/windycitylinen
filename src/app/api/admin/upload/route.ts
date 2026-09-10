import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { getAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slug";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(request: Request) {
  if (!(await getAdmin())) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Use a JPG, PNG or WebP image" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be under 8 MB" }, { status: 400 });
  }

  const ext = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" }[
    file.type
  ]!;
  const base = slugify(file.name.replace(/\.[^.]+$/, "")) || "upload";
  const filename = `${Date.now()}-${base}.${ext}`;

  try {
    const dir = join(process.cwd(), "public", "images", "uploads");
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, filename), Buffer.from(await file.arrayBuffer()));
  } catch {
    return NextResponse.json(
      {
        error:
          "Upload storage is not writable in this environment. Configure object storage (e.g. Supabase Storage) for production uploads.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ path: `/images/uploads/${filename}` });
}
