// lib/product-types.ts  (or src/lib/product-types.ts if you use /src)

export const ALLOWED_PRODUCT_IDS = ["detox-60", "growth-100"] as const;
/** Union type from the tuple above ("detox-60" | "growth-100") */
export type ProductID = (typeof ALLOWED_PRODUCT_IDS)[number];

/** Simple guard you can use anywhere */
export const isProductId = (v: string): v is ProductID =>
  (ALLOWED_PRODUCT_IDS as readonly string[]).includes(v);

/** Firestore document shape */
export type ProductDoc = {
  id: ProductID;
  name: string;
  size: string;
  inStock: boolean;
  price: number;
  blurb: string;
  howToUse: string[];
  benefits: string[];
  gallery: string[];   // image URLs
  rating: number;      // 0..5
  reviews: number;     // int >= 0
  updatedAt: number;   // epoch ms
};
