// /app/api/admin/upload/route.ts (server only)
export const runtime = "nodejs"; // 👈 ensure Node runtime (not Edge)

import { NextResponse } from "next/server";
import { getStorage } from "firebase-admin/storage";
import { randomUUID } from "crypto";
import "@/lib/firebase-admin"; // initializes Admin app

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const productId = String(form.get("productId") || "");

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
    if (!["detox-60", "growth-100"].includes(productId)) {
      return NextResponse.json({ error: "Invalid productId" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const bucket = getStorage().bucket();
    const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
    const path = `products/${productId}/${Date.now()}-${safeName}`;
    const token = randomUUID();

    const blob = bucket.file(path);
    await blob.save(buffer, {
      contentType: file.type || "application/octet-stream",
      metadata: { metadata: { firebaseStorageDownloadTokens: token }, cacheControl: "public, max-age=31536000" },
      resumable: false,
    });

    const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
    return NextResponse.json({ ok: true, url, path });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
