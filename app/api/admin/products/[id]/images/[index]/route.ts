export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { ALLOWED_PRODUCT_IDS, type ProductID } from "@/lib/product-types";

type Params = { id: string; index: string };

// helper: make anything we stored (Buffer/Blob/array) into Uint8Array
function toBytes(val: any): Uint8Array {
  if (!val) throw new Error("Empty image data");
  // Node Buffer -> Uint8Array
  if (typeof Buffer !== "undefined" && Buffer.isBuffer(val)) return new Uint8Array(val);
  // Firestore Blob (rare in admin) -> Uint8Array
  if (typeof val.toUint8Array === "function") return val.toUint8Array();
  // Already bytes
  if (val instanceof Uint8Array) return val;
  // Fallback from number[]
  if (Array.isArray(val)) return new Uint8Array(val);
  throw new Error("Unsupported image data type");
}

export async function GET(_req: Request, ctx: { params: Promise<Params> }) {
  try {
    const { id, index } = await ctx.params;
    const pid = id as ProductID;
    const i = Number(index);

    if (!ALLOWED_PRODUCT_IDS.includes(pid) || !Number.isFinite(i) || i < 0 || i > 20) {
      return new NextResponse("Bad Request", { status: 400 });
    }

    const snap = await db
      .collection("products")
      .doc(pid)
      .collection("images")
      .doc(String(i))
      .get();

    if (!snap.exists) return new NextResponse("Not Found", { status: 404 });

    const data = snap.data() as any;
    const bytes = toBytes(data.data);
    const mime: string = data.mime || "image/webp";
    const updatedAt = data.updatedAt || Date.now();

    // Return bytes (Buffer is a valid BodyInit in Node.js)
    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": mime,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": String(bytes.byteLength),
        "Last-Modified": new Date(updatedAt).toUTCString(),
      },
    });
  } catch (e) {
    console.error(e);
    return new NextResponse("Server Error", { status: 500 });
  }
}
