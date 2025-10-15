export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

// DELETE /api/admin/journal/:id
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const ref = db.collection("journal").doc(id);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await ref.delete();
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    console.error("DELETE journal failed", e);
    return NextResponse.json({ error: e?.message || "Failed to delete" }, { status: 500 });
  }
}
