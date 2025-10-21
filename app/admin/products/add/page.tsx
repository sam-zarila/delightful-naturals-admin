'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertTriangle, ArrowLeft, Image as ImageIcon, Loader2, Minus, Plus, Save, Trash, RefreshCw
} from "lucide-react";

import type { ProductDoc, ProductID } from "@/lib/product-types";
import { ALLOWED_PRODUCT_IDS } from "@/lib/product-types";
import { firestore } from "@/lib/firebase-client";
import { getDoc, doc, setDoc, deleteDoc } from "firebase/firestore";

const IDS: ProductID[] = [...ALLOWED_PRODUCT_IDS];

const SEEDS: Record<ProductID, Partial<ProductDoc>> = {
  "detox-60": {
    name: "Scalp Detox Oil",
    size: "60ml",
    inStock: true,
    price: 260,
    blurb:
      "A purifying scalp treatment that removes buildup, balances oil production, and optimises the environment for healthy hair growth.",
    howToUse: [
      "Part hair and apply a few drops directly to the scalp.",
      "Massage for 2–3 minutes to stimulate circulation.",
      "Leave on 20–30 minutes (or overnight) before wash day.",
      "Use 2–3x per week for best results.",
    ],
    benefits: ["Clarifies", "Balances Oil", "Soothes Scalp", "Boosts Growth"],
    gallery: ["/placeholder.png", "/placeholder.png", "/placeholder.png"],
    rating: 4.9,
    reviews: 320,
  },
  "growth-100": {
    name: "Mega Potent Hair Growth Oil",
    size: "100ml",
    inStock: true,
    price: 300,
    blurb:
      "An indulgent Ayurvedic blend designed to strengthen strands, nourish the scalp, and encourage thicker, healthier growth.",
    howToUse: [
      "Warm a small amount between palms and apply to scalp and lengths.",
      "Massage gently for 2–3 minutes.",
      "Leave in as a sealing oil or pre-poo treatment before shampoo.",
      "Use 3–4x per week focusing on fragile areas.",
    ],
    benefits: ["Strengthens", "Seals Moisture", "Nourishes Roots", "Improves Shine"],
    gallery: ["/placeholder.png", "/placeholder.png", "/placeholder.png"],
    rating: 5.0,
    reviews: 510,
  },
};

// ─── Image compression and base64 conversion ─────────────────────────────────
async function compressAndConvertToBase64(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress image
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Try WebP first, then fallback to JPEG
      const mimeTypes = ['image/webp', 'image/jpeg'];
      
      const tryCompress = (index: number) => {
        if (index >= mimeTypes.length) {
          reject(new Error('Could not compress image'));
          return;
        }

        try {
          const dataUrl = canvas.toDataURL(mimeTypes[index], quality);
          
          // Check if base64 string is reasonable size (under 1MB for Firestore)
          if (dataUrl.length > 1000000) { // ~1MB
            if (quality > 0.3) {
              // Reduce quality and try again
              quality -= 0.1;
              tryCompress(0);
            } else {
              reject(new Error('Image too large after compression'));
            }
            return;
          }
          
          resolve(dataUrl);
        } catch (error) {
          // If WebP fails, try JPEG
          tryCompress(index + 1);
        }
      };

      tryCompress(0);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

// Helper to check if string is base64
function isBase64(str: string): boolean {
  if (str.startsWith('data:image')) return true;
  if (str.startsWith('http')) return false;
  try {
    return btoa(atob(str)) === str;
  } catch (err) {
    return false;
  }
}

export default function AdminProductsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [all, setAll] = useState<ProductDoc[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  const [selectedId, setSelectedId] = useState<ProductID>("detox-60");
  const [loadingItem, setLoadingItem] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dirty, setDirty] = useState(false);

  const [form, setForm] = useState<{
    name: string; size: string; inStock: boolean; price: string; blurb: string;
    howToUse: string[]; benefits: string[]; gallery: string[]; rating: string; reviews: string;
  }>({ 
    name: "", size: "", inStock: true, price: "", blurb: "", 
    howToUse: [""], benefits: [""], gallery: ["","",""], rating: "5", reviews: "0" 
  });

  // Track which gallery slots have new images to upload
  const [galleryFiles, setGalleryFiles] = useState<(File | null)[]>([null, null, null]);

  const numericPrice = useMemo(() => Number(form.price || 0), [form.price]);
  const numericRating = useMemo(() => Math.max(0, Math.min(5, Number(form.rating || 0))), [form.rating]);
  const numericReviews = useMemo(() => Math.max(0, Math.floor(Number(form.reviews || 0))), [form.reviews]);

  const markDirty = () => setDirty(true);

  const loadAll = async () => {
    setLoadingList(true);
    try {
      // Fetch directly from Firestore
      const products: ProductDoc[] = [];
      for (const id of IDS) {
        try {
          const docRef = doc(firestore, 'products', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            products.push({ id, ...docSnap.data() } as ProductDoc);
          }
        } catch (error) {
          console.error(`Error loading product ${id}:`, error);
        }
      }
      setAll(products.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0)));
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Load error",
        description: "Failed to load products",
        variant: "destructive"
      });
    } finally {
      setLoadingList(false);
    }
  };

  const loadExisting = async (id: ProductID) => {
    setLoadingItem(true);
    setDirty(false);
    try {
      const docRef = doc(firestore, 'products', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const doc = docSnap.data() as ProductDoc;
        setForm({
          name: doc.name ?? "",
          size: doc.size ?? "",
          inStock: !!doc.inStock,
          price: String(doc.price ?? ""),
          blurb: doc.blurb ?? "",
          howToUse: doc.howToUse?.length ? doc.howToUse : [""],
          benefits: doc.benefits?.length ? doc.benefits : [""],
          gallery: doc.gallery?.length 
            ? [...doc.gallery, ...Array(3 - doc.gallery.length).fill("")].slice(0, 3)
            : ["", "", ""],
          rating: String(doc.rating ?? "5"),
          reviews: String(doc.reviews ?? "0"),
        });
        setGalleryFiles([null, null, null]);
        toast({ 
          title: "Loaded", 
          description: `Loaded "${id}" from Firestore.` 
        });
      } else {
        setForm({ 
          name: "", size: "", inStock: true, price: "", blurb: "", 
          howToUse: [""], benefits: [""], gallery: ["", "", ""], rating: "5", reviews: "0" 
        });
        setGalleryFiles([null, null, null]);
        toast({ 
          title: "Not found", 
          description: `No document for "${id}". Use defaults to seed.` 
        });
      }
    } catch (error: any) {
      console.error('Error loading product:', error);
      toast({
        title: "Load error",
        description: error.message || "Failed to load product",
        variant: "destructive"
      });
    } finally {
      setLoadingItem(false);
    }
  };

  useEffect(() => { 
    loadAll(); 
  }, []);

  useEffect(() => { 
    if (selectedId) {
      loadExisting(selectedId);
    }
  }, [selectedId]);

  const onPickFile = async (file: File | null, idx: number) => {
    if (!file) {
      setGalleryFiles(prev => {
        const newFiles = [...prev];
        newFiles[idx] = null;
        return newFiles;
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please pick an image file.",
        variant: "destructive"
      });
      return;
    }

    try {
      toast({
        title: "Compressing image...",
        description: "Please wait while we compress your image."
      });

      setGalleryFiles(prev => {
        const newFiles = [...prev];
        newFiles[idx] = file;
        return newFiles;
      });
      setDirty(true);
      
      toast({
        title: "Image ready",
        description: `${file.name} is ready for upload. It will be compressed when you save.`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to process image",
        variant: "destructive"
      });
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;

    setSaving(true);
    try {
      const gallery = [...form.gallery];

      // Process and convert new images to base64
      for (let i = 0; i < galleryFiles.length; i++) {
        const file = galleryFiles[i];
        if (file) {
          try {
            const base64String = await compressAndConvertToBase64(file);
            gallery[i] = base64String;
          } catch (error: any) {
            toast({
              title: "Image compression failed",
              description: `Could not process image ${i + 1}: ${error.message}`,
              variant: "destructive"
            });
            throw error; // Stop the save process if image compression fails
          }
        }
      }

      const payload: ProductDoc = {
        id: selectedId,
        name: form.name.trim(),
        size: form.size.trim(),
        inStock: !!form.inStock,
        price: numericPrice,
        blurb: form.blurb.trim(),
        howToUse: form.howToUse.map(s => s.trim()).filter(Boolean),
        benefits: form.benefits.map(s => s.trim()).filter(Boolean),
        gallery: gallery.filter(url => url.trim() !== ""),
        rating: numericRating,
        reviews: numericReviews,
        updatedAt: Date.now(),
      };

      const docRef = doc(firestore, 'products', selectedId);
      await setDoc(docRef, payload, { merge: true });

      toast({
        title: "Product saved successfully",
        description: `"${selectedId}" has been updated with base64 images.`,
      });

      // Reset form state
      await loadExisting(selectedId);
      await loadAll();
      setDirty(false);
      router.refresh();
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: "Save error",
        description: error.message || "Unexpected error occurred while saving.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id: ProductID) => {
    if (!confirm(`Are you sure you want to delete "${id}"? This action cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    try {
      const docRef = doc(firestore, 'products', id);
      await deleteDoc(docRef);
      
      toast({
        title: "Product deleted",
        description: `"${id}" has been removed from Firestore.`
      });

      // Refresh the list and reset form if deleted product was selected
      await loadAll();
      if (id === selectedId) {
        setForm({
          name: "", size: "", inStock: true, price: "", blurb: "",
          howToUse: [""], benefits: [""], gallery: ["", "", ""], rating: "5", reviews: "0"
        });
        setGalleryFiles([null, null, null]);
        setDirty(false);
      }
      
      router.refresh();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Delete error",
        description: error.message || "Failed to delete product. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
    }
  };

  const updateListItem = (list: "howToUse" | "benefits" | "gallery", index: number, value: string) => {
    const updated = [...form[list]];
    updated[index] = value;
    setForm({ ...form, [list]: updated });
    markDirty();
  };

  const addToList = (list: "howToUse" | "benefits") => {
    setForm({ ...form, [list]: [...form[list], ""] });
    markDirty();
  };

  const removeFromList = (list: "howToUse" | "benefits", index: number) => {
    const out = form[list].filter((_, i) => i !== index);
    setForm({ ...form, [list]: out.length ? out : [""] });
    markDirty();
  };

  const seedDefaults = () => {
    const seed = SEEDS[selectedId];
    setForm(prev => ({
      ...prev,
      name: seed.name ?? prev.name,
      size: seed.size ?? prev.size,
      inStock: seed.inStock ?? prev.inStock,
      price: seed.price != null ? String(seed.price) : prev.price,
      blurb: seed.blurb ?? prev.blurb,
      howToUse: seed.howToUse ?? prev.howToUse,
      benefits: seed.benefits ?? prev.benefits,
      gallery: seed.gallery 
        ? [...seed.gallery.slice(0, 3), ...Array(3 - Math.min(seed.gallery.length, 3)).fill("")]
        : prev.gallery,
      rating: seed.rating != null ? String(seed.rating) : prev.rating,
      reviews: seed.reviews != null ? String(seed.reviews) : prev.reviews,
    }));
    setGalleryFiles([null, null, null]);
    setDirty(true);
    toast({
      title: "Defaults applied",
      description: `Seeded content for "${selectedId}".`
    });
  };

  const canSave =
    !saving &&
    form.name.trim().length > 0 &&
    form.size.trim().length > 0 &&
    Number.isFinite(numericPrice) &&
    numericPrice >= 0 &&
    form.blurb.trim().length > 0;

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Banner */}
        <div className="rounded-2xl border bg-emerald-50/60 p-4 flex items-start gap-3">
          <div className="shrink-0 rounded-xl bg-emerald-600 text-white p-2">
            <ImageIcon className="h-5 w-5"/>
          </div>
          <div>
            <div className="font-semibold text-emerald-900">Products Admin</div>
            <div className="text-sm text-emerald-700 mt-1">
              Images are compressed and stored as base64 in Firestore (Spark plan compatible)
            </div>
          </div>
        </div>

        {/* Overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Current Products</CardTitle>
              <CardDescription>What's in Firestore right now</CardDescription>
            </div>
            <Button variant="outline" onClick={loadAll} disabled={loadingList}>
              {loadingList ? <Loader2 className="h-4 w-4 animate-spin"/> : <RefreshCw className="h-4 w-4 mr-2"/>}
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr>
                    <th className="py-2 pr-4">ID</th>
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Size</th>
                    <th className="py-2 pr-4">Price</th>
                    <th className="py-2 pr-4">Stock</th>
                    <th className="py-2 pr-4">Rating</th>
                    <th className="py-2 pr-4">Updated</th>
                    <th className="py-2 pr-0">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {IDS.map((id) => {
                    const row = all.find((x) => x.id === id);
                    return (
                      <tr key={id} className="border-t">
                        <td className="py-2 pr-4 font-mono">{id}</td>
                        <td className="py-2 pr-4">{row?.name ?? "—"}</td>
                        <td className="py-2 pr-4">{row?.size ?? "—"}</td>
                        <td className="py-2 pr-4">{row?.price != null ? `R${row.price}` : "—"}</td>
                        <td className="py-2 pr-4">{row ? (row.inStock ? "In stock" : "Out") : "—"}</td>
                        <td className="py-2 pr-4">{row?.rating != null ? `${row.rating.toFixed(1)} (${row.reviews ?? 0})` : "—"}</td>
                        <td className="py-2 pr-4">{row?.updatedAt ? new Date(row.updatedAt).toLocaleString() : "—"}</td>
                        <td className="py-2 pr-0 flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => { 
                              setSelectedId(id); 
                              loadExisting(id); 
                              window.scrollTo({ top: document.body.scrollHeight * 0.25, behavior: "smooth" }); 
                            }}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => onDelete(id)} 
                            disabled={deleting}
                            title="Delete this product"
                          >
                            <Trash className="h-4 w-4 mr-1"/>
                            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {!all.length && (
                <div className="text-xs text-muted-foreground mt-3">
                  No products yet. Use the editor below to create them.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Editor */}
        <Card>
          <CardHeader>
            <CardTitle>Edit / Create</CardTitle>
            <CardDescription>Manage one of the two allowed product IDs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild variant="outline" size="sm" disabled={saving || loadingList || loadingItem}>
                <Link href="/admin">
                  <ArrowLeft className="mr-2 h-4 w-4"/>Back
                </Link>
              </Button>

              <div className="space-y-1">
                <Label>Product ID</Label>
                <select 
                  className="border rounded-md px-3 py-2" 
                  value={selectedId} 
                  onChange={(e) => setSelectedId(e.target.value as ProductID)} 
                  disabled={saving || loadingItem}
                >
                  {IDS.map((id) => (
                    <option key={id} value={id}>{id}</option>
                  ))}
                </select>
              </div>

              <Button 
                variant="outline" 
                onClick={() => loadExisting(selectedId)} 
                disabled={loadingItem || saving}
              >
                {loadingItem ? <Loader2 className="h-4 w-4 animate-spin"/> : "Load current"}
              </Button>

              <Button 
                type="button" 
                onClick={seedDefaults} 
                variant="secondary" 
                disabled={saving || loadingItem}
              >
                Use defaults
              </Button>

              {dirty && (
                <div className="inline-flex items-center gap-2 rounded-md bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 text-xs">
                  <AlertTriangle className="h-4 w-4"/> Unsaved changes
                </div>
              )}
            </div>

            <form onSubmit={onSubmit} className="space-y-8">
              <div className="grid gap-8 lg:grid-cols-2">
                {/* Left: basics */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input 
                      id="name" 
                      value={form.name} 
                      onChange={(e) => { setForm({...form, name: e.target.value}); markDirty(); }} 
                      required 
                      disabled={saving} 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (R)</Label>
                      <Input 
                        id="price" 
                        type="number" 
                        step="0.01" 
                        value={form.price} 
                        onChange={(e) => { setForm({...form, price: e.target.value}); markDirty(); }} 
                        required 
                        disabled={saving} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="size">Size</Label>
                      <Input 
                        id="size" 
                        value={form.size} 
                        onChange={(e) => { setForm({...form, size: e.target.value}); markDirty(); }} 
                        placeholder="60ml / 100ml" 
                        required 
                        disabled={saving} 
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch 
                      id="inStock" 
                      checked={form.inStock} 
                      onCheckedChange={(v) => { setForm({...form, inStock: v}); markDirty(); }} 
                      disabled={saving} 
                    />
                    <Label htmlFor="inStock">In Stock</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="blurb">Blurb (short description)</Label>
                    <Textarea 
                      id="blurb" 
                      rows={4} 
                      value={form.blurb} 
                      onChange={(e) => { setForm({...form, blurb: e.target.value}); markDirty(); }} 
                      required 
                      disabled={saving} 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rating">Rating (0–5)</Label>
                      <Input 
                        id="rating" 
                        type="number" 
                        step="0.1" 
                        min="0" 
                        max="5" 
                        value={form.rating} 
                        onChange={(e) => { setForm({...form, rating: e.target.value}); markDirty(); }} 
                        disabled={saving} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reviews">Reviews (count)</Label>
                      <Input 
                        id="reviews" 
                        type="number" 
                        step="1" 
                        min="0" 
                        value={form.reviews} 
                        onChange={(e) => { setForm({...form, reviews: e.target.value}); markDirty(); }} 
                        disabled={saving} 
                      />
                    </div>
                  </div>
                </div>

                {/* Right: gallery pickers */}
                <div className="space-y-4">
                  <Label>Gallery (3 images - will be compressed and stored as base64)</Label>
                  {form.gallery.map((url, i) => (
                    <div key={i} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <Label>Image {i + 1}</Label>
                        {url && (
                          <a className="text-xs underline" target="_blank" rel="noreferrer" href={url}>
                            {isBase64(url) ? "View" : "Open"}
                          </a>
                        )}
                      </div>
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                        <div className="border rounded-lg p-2 bg-white min-h-[160px] grid place-items-center">
                          {galleryFiles[i] ? (
                            <img 
                              alt={`Preview ${i + 1}`} 
                              className="max-h-40 object-contain" 
                              src={URL.createObjectURL(galleryFiles[i]!)} 
                            />
                          ) : url ? (
                            <img 
                              alt={`Preview ${i + 1}`} 
                              className="max-h-40 object-contain" 
                              src={url} 
                            />
                          ) : (
                            <div className="text-xs text-muted-foreground">No image selected</div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => onPickFile(e.target.files?.[0] ?? null, i)}
                              disabled={saving}
                            />
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Choose an image file. It will be compressed and converted to base64 when you save.
                          </div>
                        </div>
                      </div>
                      <div className="mt-2">
                        <Input 
                          placeholder="Or paste image URL" 
                          value={form.gallery[i] || ""} 
                          onChange={(e) => updateListItem("gallery", i, e.target.value)} 
                          disabled={saving}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* How to Use */}
              <div className="space-y-3">
                <Label>How to Use</Label>
                {form.howToUse.map((s, i) => (
                  <div key={i} className="flex gap-2">
                    <Input 
                      value={s} 
                      onChange={(e) => updateListItem("howToUse", i, e.target.value)} 
                      disabled={saving} 
                      placeholder={`Step ${i + 1}`} 
                    />
                    {form.howToUse.length > 1 && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon" 
                        onClick={() => removeFromList("howToUse", i)} 
                        disabled={saving}
                      >
                        <Minus className="h-4 w-4"/>
                      </Button>
                    )}
                  </div>
                ))}
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => addToList("howToUse")} 
                  disabled={saving}
                >
                  <Plus className="mr-2 h-4 w-4"/> Add Step
                </Button>
              </div>

              {/* Benefits */}
              <div className="space-y-3">
                <Label>Benefits</Label>
                {form.benefits.map((b, i) => (
                  <div key={i} className="flex gap-2">
                    <Input 
                      value={b} 
                      onChange={(e) => updateListItem("benefits", i, e.target.value)} 
                      disabled={saving} 
                      placeholder="Benefit" 
                    />
                    {form.benefits.length > 1 && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon" 
                        onClick={() => removeFromList("benefits", i)} 
                        disabled={saving}
                      >
                        <Minus className="h-4 w-4"/>
                      </Button>
                    )}
                  </div>
                ))}
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => addToList("benefits")} 
                  disabled={saving}
                >
                  <Plus className="mr-2 h-4 w-4"/> Add Benefit
                </Button>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 justify-end">
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={() => onDelete(selectedId)} 
                  disabled={saving || deleting}
                  title="Delete current product"
                >
                  <Trash className="h-4 w-4 mr-2"/>
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
                </Button>
                <Button type="submit" disabled={!canSave} className="w-full sm:w-auto">
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin"/> Saving…
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4"/> Save Product
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {dirty && !saving && (
          <div className="fixed bottom-4 right-4 rounded-full bg-amber-500 text-white shadow-lg px-4 py-2 text-sm">
            Unsaved changes
          </div>
        )}
      </div>
    </AdminLayout>
  );
}