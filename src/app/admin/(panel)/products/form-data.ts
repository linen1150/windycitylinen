import { db } from "@/lib/db";
import { COLOR_GROUPS } from "@/lib/catalog";

export async function loadProductFormOptions() {
  const [categories, fabrics, sizes, collections] = await Promise.all([
    db.category.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } }),
    db.fabric.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } }),
    db.size.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } }),
    db.collection.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } }),
  ]);
  return { categories, fabrics, sizes, collections, colorGroups: COLOR_GROUPS.map((c) => c.name) };
}
