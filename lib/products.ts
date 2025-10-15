// /lib/products.ts  (rename to this if yours is /lib/product.ts; update imports accordingly)
import type { ProductDoc, ProductID } from "./product-types";

// Only these two IDs are valid in your shop
export const ALLOWED_IDS: readonly ProductID[] = ["detox-60", "growth-100"] as const;
export const isProductId = (v: string): v is ProductID =>
  (ALLOWED_IDS as readonly string[]).includes(v);

// -----------------------------
// Admin-facing helpers (CRUD via API routes; server does Firebase Admin)
// -----------------------------

/** Read a single product via admin API (used by the admin editor). */
export async function getProduct(id: ProductID): Promise<ProductDoc | null> {
  try {
    const res = await fetch(`/api/admin/products/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as ProductDoc;
  } catch {
    return null;
  }
}

/** Create/Update a product document. */
export async function upsertProduct(doc: ProductDoc): Promise<boolean> {
  try {
    const res = await fetch(`/api/admin/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(doc),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Delete a product document. */
export async function deleteProduct(id: ProductID): Promise<boolean> {
  try {
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    return res.ok;
  } catch {
    return false;
  }
}

// -----------------------------
// Public-facing helpers (cart / storefront)
// -----------------------------

/** Public read: get one product by id (string in, null if not found). */
export async function getProductById(id: string): Promise<ProductDoc | null> {
  try {
    // Optional guard: short-circuit invalid ids
    if (!isProductId(id)) return null;

    const res = await fetch(`/api/products/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as ProductDoc;
  } catch {
    return null;
  }
}

/** Public read: list all products. */
export async function getAllProducts(): Promise<ProductDoc[]> {
  try {
    const res = await fetch(`/api/products`, { cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()) as ProductDoc[];
  } catch {
    return [];
  }
}

export type { ProductDoc, ProductID };
