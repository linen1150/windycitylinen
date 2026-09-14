import { NextResponse, type NextRequest } from "next/server";
import { suggestProducts } from "@/lib/catalog";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  if (q.trim().length < 2) return NextResponse.json({ products: [] });
  const products = await suggestProducts(q, 6);
  return NextResponse.json({ products });
}
