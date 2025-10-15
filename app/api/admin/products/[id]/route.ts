// app/api/admin/products/[id]/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { ALLOWED_PRODUCT_IDS, type ProductID } from "@/lib/product-types";

type Params = { id: string };

// GET /api/admin/products/:id
export async function GET(_req: Request, ctx: { params: Promise<Params> }) {
  const { id } = await ctx.params;        // ✅ await params
  const pid = id as ProductID;
  if (!ALLOWED_PRODUCT_IDS.includes(pid)) {
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
  }
  const snap = await db.collection("products").doc(pid).get();
  if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(snap.data(), { headers: { "Cache-Control": "no-store" } });
}

// DELETE /api/admin/products/:id
export async function DELETE(_req: Request, ctx: { params: Promise<Params> }) {
  const { id } = await ctx.params;        // ✅ await params
  const pid = id as ProductID;
  if (!ALLOWED_PRODUCT_IDS.includes(pid)) {
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
  }

  const ref = db.collection("products").doc(pid);
  const imgs = await ref.collection("images").listDocuments();
  await Promise.all(imgs.map((d) => d.delete()));
  await ref.delete();

  return NextResponse.json({ ok: true });
}
