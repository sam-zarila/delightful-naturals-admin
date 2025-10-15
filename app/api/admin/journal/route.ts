// app/api/admin/journal/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { db } from '@/lib/firebase-admin';
 // ← Fix: Import shared initialized db

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';  // ← Add: Prevent caching/static build issues

/** Recursively remove all `undefined` so Firestore accepts the document */
function stripUndefined<T>(obj: T): T {
  if (Array.isArray(obj)) return obj.map(stripUndefined) as unknown as T;
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj as Record<string, any>)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, stripUndefined(v)])
    ) as T;
  }
  return obj;
}

/** GET /api/admin/journal?limit=50&after=<docId>&q=<prefix> */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limitParam = Number(searchParams.get('limit') ?? '50');
    const limit = Number.isFinite(limitParam) ? Math.max(1, Math.min(100, Math.floor(limitParam))) : 50;
    const after = searchParams.get('after') ?? '';
    const q = (searchParams.get('q') ?? '').trim().toLowerCase();

    let qRef: FirebaseFirestore.Query = db.collection('journal');

    // Simple prefix search using `slug` (ensure you save slug at write-time)
    if (q) {
      qRef = qRef.orderBy('slug').startAt(q).endAt(q + '\uf8ff');
    } else {
      qRef = qRef.orderBy('createdAt', 'desc');
    }

    if (after) {
      const lastSnap = await db.collection('journal').doc(after).get();
      if (lastSnap.exists) qRef = qRef.startAfter(lastSnap);
    }

    const snap = await qRef.limit(limit).get();

    const items = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : null,
        updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : null,
      };
    });

    const nextCursor = snap.docs.length ? snap.docs[snap.docs.length - 1].id : null;

    return NextResponse.json({ ok: true, items, nextCursor });
  } catch (e: any) {
    console.error('GET journal failed', e);
    return NextResponse.json({ ok: false, error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}

/** POST /api/admin/journal  — create (example) */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body?.title) {
      return NextResponse.json({ ok: false, error: 'title is required' }, { status: 400 });
    }

    const col = db.collection('journal');
    const id = body.id || col.doc().id;

    const title = String(body.title).trim();
    const slug =
      (body.slug ||
        title
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, ''))
        .slice(0, 140);

    const doc = {
      id,
      title,
      slug,
      excerpt: body.excerpt || '',
      content: body.content || '',
      tags: Array.isArray(body.tags) ? body.tags : [],
      // If cover is optional, do NOT set it when missing (stripUndefined will omit it)
      coverUrl: body.coverUrl,
      published: body.published !== false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const ref = col.doc(id);
    await ref.set(stripUndefined(doc), { merge: false });

    // Return serializable timestamps
    return NextResponse.json(
      { ok: true, item: { ...doc, createdAt: null, updatedAt: null } },
      { status: 201 }
    );
  } catch (e: any) {
    console.error('POST journal failed', e);
    return NextResponse.json({ ok: false, error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}