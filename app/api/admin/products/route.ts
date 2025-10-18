export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import type { ProductDoc, ProductID } from "@/lib/product-types";
import { ALLOWED_PRODUCT_IDS } from "@/lib/product-types";

type InImage = { index: number; name: string; type: string; base64: string };

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<ProductDoc> & { images?: InImage[] };

    const id = body.id as ProductID;
    if (!id || !ALLOWED_PRODUCT_IDS.includes(id)) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    // coerce fields
    const name = String(body.name ?? "");
    const size = String(body.size ?? "");
    const inStock = Boolean(body.inStock);
    const price = Number(body.price ?? 0);
    const blurb = String(body.blurb ?? "");
    const howToUse = Array.isArray(body.howToUse) ? body.howToUse.map(String).filter(Boolean) : [];
    const benefits = Array.isArray(body.benefits) ? body.benefits.map(String).filter(Boolean) : [];
    const rating = Math.max(0, Math.min(5, Number(body.rating ?? 0)));
    const reviews = Math.max(0, Math.floor(Number(body.reviews ?? 0)));
    const existingGallery = Array.isArray(body.gallery) ? body.gallery.map(String).filter(Boolean) : [];

    const ref = db.collection("products").doc(id);

    // Non-fatal pre-read (in case DNS hiccups)
    let created = true;
    try {
      const before = await ref.get();
      created = !before.exists;
    } catch (e) {
      console.warn("Pre-read failed; proceeding with write:", e);
    }

    // images → base64 data URIs for gallery
    const images = Array.isArray(body.images) ? body.images : [];
    const gallery = [...existingGallery];

    for (const img of images) {
      if (typeof img?.index !== "number" || typeof img?.base64 !== "string" || typeof img?.type !== "string") continue;

      const base64 = img.base64;
      if (base64.length > 1.3 * 950 * 1024) { // Approx for base64 overhead
        return NextResponse.json(
          { error: `Image ${img.name || img.index} is too large (> 950KB encoded)` },
          { status: 413 }
        );
      }

      gallery[img.index] = `data:${img.type};base64,${base64}`;
    }

    const doc: ProductDoc = {
      id, name, size, inStock, price, blurb, howToUse, benefits,
      gallery: gallery.filter(Boolean),
      rating, reviews,
      updatedAt: Date.now(),
    };

    await ref.set(doc, { merge: true });

    return NextResponse.json({ ok: true, created, product: doc }, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message || "Failed to save" }, { status: 500 });
  }
}