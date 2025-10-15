// app/api/admin/testimonials/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

// Firestore shape (what we store)
type TestimonialDoc = {
  id: string;
  author: string;     // stored as "author" (UI can send "name" & we’ll map)
  location: string;
  rating: number;     // 1..5
  text: string;       // stored as "text" (UI can send "message" & we’ll map)
  avatarUrl: string;
  published: boolean;
  createdAt: number;  // epoch ms
  updatedAt: number;  // epoch ms
};

const rid = () => Math.random().toString(36).slice(2, 10);

// ───────── GET (admin list – latest first, no published filter)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.max(1, Math.min(100, Number(searchParams.get("limit") ?? 50)));

    const snap = await db
      .collection("testimonials")
      .orderBy("updatedAt", "desc")
      .limit(limit)
      .get();

    const items = snap.docs.map((d) => d.data() as TestimonialDoc);
    return NextResponse.json(items);
  } catch (e: any) {
    console.error("GET /api/admin/testimonials failed:", e);
    return NextResponse.json({ error: e?.message || "Failed to load testimonials" }, { status: 500 });
  }
}

// ───────── POST (create/update)
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<TestimonialDoc> & {
      // allow alt field names from UI
      name?: string;
      message?: string;
    };

    const id = String(body.id || rid());
    const ref = db.collection("testimonials").doc(id);
    const before = await ref.get();

    const now = Date.now();

    // Map flexible input -> canonical fields we store
    const author = String(body.author ?? body.name ?? "");
    const text = String(body.text ?? body.message ?? "");
    const location = String(body.location ?? "");
    const avatarUrl = String(body.avatarUrl ?? "");
    const ratingRaw = Number(body.rating);
    const rating = Number.isFinite(ratingRaw) ? Math.max(1, Math.min(5, ratingRaw)) : 5;

    // Preserve createdAt if updating, normalize Timestamp -> number if needed
    let createdAt = before.exists ? (before.data()?.createdAt as any) : now;
    if (createdAt && typeof (createdAt as any)?.toMillis === "function") {
      createdAt = (createdAt as any).toMillis();
    }
    if (typeof createdAt !== "number") createdAt = now;

    const doc: TestimonialDoc = {
      id,
      author,
      location,
      rating,
      text,
      avatarUrl,
      published: body.published !== false, // default true
      createdAt,
      updatedAt: now,
    };

    await ref.set(doc, { merge: true });
    return NextResponse.json({ ok: true, testimonial: doc });
  } catch (e: any) {
    console.error("POST /api/admin/testimonials failed:", e);
    return NextResponse.json({ error: e?.message || "Failed to save testimonial" }, { status: 500 });
  }
}
