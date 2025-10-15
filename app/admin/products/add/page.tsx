"use client";

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

// ─── image helpers ───────────────────────────────────────────────────────────
async function fileToCompressedBase64(
  file: File,
  maxW = 1200,
  maxH = 1200,
  targetMaxBytes = 950 * 1024
): Promise<{ base64: string; mime: string; blob: Blob }> {
  const bitmap = await createImageBitmap(file);
  const { w, h } = (() => {
    const r = bitmap.width / bitmap.height;
    let W = Math.min(maxW, bitmap.width);
    let H = Math.round(W / r);
    if (H > maxH) { H = maxH; W = Math.round(H * r); }
    return { w: W, h: H };
  })();

  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, w, h);

  // try webp, then jpeg; adjust quality if still too big
  for (const mime of ["image/webp", "image/jpeg"]) {
    let q = 0.9;
    for (let tries = 0; tries < 6; tries++) {
      const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, mime, q));
      if (!blob) continue;
      if (blob.size <= targetMaxBytes || q <= 0.5) {
        const ab = await blob.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(ab)));
        return { base64, mime, blob };
      }
      q -= 0.1;
    }
  }
  throw new Error("Could not compress image under 950KB");
}

export default function AdminProductsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [all, setAll] = useState<ProductDoc[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  const [selectedId, setSelectedId] = useState<ProductID>("detox-60");
  const [loadingItem, setLoadingItem] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const [form, setForm] = useState<{
    name: string; size: string; inStock: boolean; price: string; blurb: string;
    howToUse: string[]; benefits: string[]; gallery: string[]; rating: string; reviews: string;
  }>({ name: "", size: "", inStock: true, price: "", blurb: "", howToUse: [""], benefits: [""], gallery: ["","",""], rating: "5", reviews: "0" });

  // keep original filenames for nicer server metadata
  const [galleryFiles, setGalleryFiles] = useState<(File | null)[]>([null, null, null]);
  // compressed images ready to send
  const [imagesB64, setImagesB64] = useState<({ base64: string; mime: string; name: string } | null)[]>([null,null,null]);

  const numericPrice = useMemo(() => Number(form.price || 0), [form.price]);
  const numericRating = useMemo(() => Math.max(0, Math.min(5, Number(form.rating || 0))), [form.rating]);
  const numericReviews = useMemo(() => Math.max(0, Math.floor(Number(form.reviews || 0))), [form.reviews]);

  const markDirty = () => setDirty(true);

  const loadAll = async () => {
    setLoadingList(true);
    try {
      const res = await fetch("/api/products", { cache: "no-store" });
      setAll(res.ok ? ((await res.json()) as ProductDoc[]).sort((a,b)=> (b.updatedAt??0)-(a.updatedAt??0)) : []);
    } catch { setAll([]); } finally { setLoadingList(false); }
  };

  const loadExisting = async (id: ProductID) => {
    setLoadingItem(true); setDirty(false);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { cache: "no-store" });
      if (res.ok) {
        const doc = (await res.json()) as ProductDoc;
        setForm({
          name: doc.name ?? "", size: doc.size ?? "", inStock: !!doc.inStock,
          price: String(doc.price ?? ""), blurb: doc.blurb ?? "",
          howToUse: doc.howToUse?.length ? doc.howToUse : [""],
          benefits: doc.benefits?.length ? doc.benefits : [""],
          gallery: doc.gallery?.length ? [...doc.gallery, "", "", ""].slice(0, 3) : ["","",""],
          rating: String(doc.rating ?? "5"), reviews: String(doc.reviews ?? "0"),
        });
        setGalleryFiles([null,null,null]);
        setImagesB64([null,null,null]);
        toast({ title: "Loaded", description: `Loaded "${id}" from Firestore.` });
      } else {
        setForm({ name:"", size:"", inStock:true, price:"", blurb:"", howToUse:[""], benefits:[""], gallery:["","",""], rating:"5", reviews:"0" });
        setGalleryFiles([null,null,null]);
        setImagesB64([null,null,null]);
        toast({ title: "Not found", description: `No document for "${id}". Use defaults to seed.` });
      }
    } finally { setLoadingItem(false); }
  };

  useEffect(() => { loadAll(); }, []);
  useEffect(() => { loadExisting(selectedId); }, [selectedId]);

  const onPickFile = async (file: File | null, idx: number) => {
    if (!file) {
      setGalleryFiles((p)=>{const n=[...p]; n[idx]=null; return n;});
      setImagesB64((p)=>{const n=[...p]; n[idx]=null; return n;});
      return;
    }
    if (!file.type.startsWith("image/")) { toast({ title:"Invalid file", description:"Please pick an image.", variant:"destructive" }); return; }
    try {
      const out = await fileToCompressedBase64(file);
      setGalleryFiles((p)=>{const n=[...p]; n[idx]=file; return n;});
      setImagesB64((p)=>{const n=[...p]; n[idx]={ base64: out.base64, mime: out.mime, name: file.name }; return n;});
      setDirty(true);
      toast({ title: "Image prepared", description: `${file.name} compressed for upload.` });
    } catch (e: any) {
      toast({ title:"Compression failed", description:e?.message || "Try a smaller image.", variant:"destructive" });
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Partial<ProductDoc> & { images: { index: number; name: string; type: string; base64: string }[] } = {
        id: selectedId,
        name: form.name.trim(),
        size: form.size.trim(),
        inStock: !!form.inStock,
        price: numericPrice,
        blurb: form.blurb.trim(),
        howToUse: form.howToUse.map(s=>s.trim()).filter(Boolean),
        benefits: form.benefits.map(s=>s.trim()).filter(Boolean),
        gallery: form.gallery.map(g=>g.trim()).filter(Boolean), // keeps pasted URLs
        rating: numericRating,
        reviews: numericReviews,
        images: imagesB64
          .map((v, i) => v ? ({ index: i, name: v.name, type: v.mime, base64: v.base64 }) : null)
          .filter(Boolean) as any,
      };

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) {
        toast({ title: "Save failed", description: json?.error || "Try again.", variant: "destructive" });
        return;
      }

      toast({
        title: json.created ? "Product created successfully" : "Product updated successfully",
        description: `"${selectedId}" has been saved.`,
      });

      await Promise.all([loadExisting(selectedId), loadAll()]);
      setDirty(false);
      setGalleryFiles([null,null,null]);
      setImagesB64([null,null,null]);
      router.refresh();
    } catch {
      toast({ title: "Save error", description: "Unexpected error occurred.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id: ProductID) => {
    if (!confirm(`Delete ${id}? This cannot be undone.`)) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json().catch(()=>({} as any));
        toast({ title:"Delete failed", description:j?.error || "Server error.", variant:"destructive" });
      } else {
        toast({ title: "Deleted", description: `"${id}" removed from Firestore.` });
      }
      if (id === selectedId) await loadExisting(selectedId);
      await loadAll();
      router.refresh();
    } finally { setSaving(false); }
  };

  const updateListItem = (list: "howToUse" | "benefits" | "gallery", index: number, value: string) => {
    const updated = [...form[list]]; updated[index] = value; setForm({ ...form, [list]: updated }); markDirty();
  };
  const addToList = (list: "howToUse" | "benefits") => { setForm({ ...form, [list]: [...form[list], ""] }); markDirty(); };
  const removeFromList = (list: "howToUse" | "benefits", index: number) => {
    const out = form[list].filter((_, i) => i !== index);
    setForm({ ...form, [list]: out.length ? out : [""] }); markDirty();
  };

  const seedDefaults = () => {
    const seed = SEEDS[selectedId];
    setForm((prev) => ({
      ...prev,
      name: seed.name ?? prev.name,
      size: seed.size ?? prev.size,
      inStock: seed.inStock ?? prev.inStock,
      price: seed.price != null ? String(seed.price) : prev.price,
      blurb: seed.blurb ?? prev.blurb,
      howToUse: seed.howToUse ?? prev.howToUse,
      benefits: seed.benefits ?? prev.benefits,
      gallery: seed.gallery ? [...seed.gallery, "", "", ""].slice(0, 3) : prev.gallery,
      rating: seed.rating != null ? String(seed.rating) : prev.rating,
      reviews: seed.reviews != null ? String(seed.reviews) : prev.reviews,
    }));
    setGalleryFiles([null,null,null]);
    setImagesB64([null,null,null]);
    setDirty(true);
    toast({ title: "Defaults applied", description: `Seeded content for "${selectedId}".` });
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
          <div className="shrink-0 rounded-xl bg-emerald-600 text-white p-2"><ImageIcon className="h-5 w-5"/></div>
          <div>
            <div className="font-semibold text-emerald-900">Products Admin (Spark compatible)</div>
            <div className="text-sm text-emerald-900/80">
              Select images now; they’ll be compressed and stored in Firestore on Save.
            </div>
          </div>
        </div>

        {/* Overview */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Current Products</CardTitle>
              <CardDescription>What’s in Firestore right now</CardDescription>
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
                          <Button variant="outline" size="sm" onClick={() => { setSelectedId(id); loadExisting(id); window.scrollTo({ top: document.body.scrollHeight * 0.25, behavior: "smooth" }); }}>
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => onDelete(id)} disabled={saving} title="Delete this product">
                            <Trash className="h-4 w-4 mr-1"/>Delete
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {!all.length && <div className="text-xs text-muted-foreground mt-3">No products yet. Use the editor below to create them.</div>}
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
                <Link href="/admin"><ArrowLeft className="mr-2 h-4 w-4"/>Back</Link>
              </Button>

              <div className="space-y-1">
                <Label>Product ID</Label>
                <select className="border rounded-md px-3 py-2" value={selectedId} onChange={(e)=>setSelectedId(e.target.value as ProductID)} disabled={saving || loadingItem}>
                  {IDS.map((id) => (<option key={id} value={id}>{id}</option>))}
                </select>
              </div>

              <Button variant="outline" onClick={() => loadExisting(selectedId)} disabled={loadingItem || saving}>
                {loadingItem ? <Loader2 className="h-4 w-4 animate-spin"/> : "Load current"}
              </Button>

              <Button type="button" onClick={seedDefaults} variant="secondary" disabled={saving || loadingItem}>
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
                    <Input id="name" value={form.name} onChange={(e)=>{ setForm({...form, name: e.target.value}); markDirty(); }} required disabled={saving} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (R)</Label>
                      <Input id="price" type="number" step="0.01" value={form.price} onChange={(e)=>{ setForm({...form, price: e.target.value}); markDirty(); }} required disabled={saving} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="size">Size</Label>
                      <Input id="size" value={form.size} onChange={(e)=>{ setForm({...form, size: e.target.value}); markDirty(); }} placeholder="60ml / 100ml" required disabled={saving} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch id="inStock" checked={form.inStock} onCheckedChange={(v)=>{ setForm({...form, inStock: v}); markDirty(); }} disabled={saving} />
                    <Label htmlFor="inStock">In Stock</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="blurb">Blurb (short description)</Label>
                    <Textarea id="blurb" rows={4} value={form.blurb} onChange={(e)=>{ setForm({...form, blurb: e.target.value}); markDirty(); }} required disabled={saving} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rating">Rating (0–5)</Label>
                      <Input id="rating" type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e)=>{ setForm({...form, rating: e.target.value}); markDirty(); }} disabled={saving} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reviews">Reviews (count)</Label>
                      <Input id="reviews" type="number" step="1" min="0" value={form.reviews} onChange={(e)=>{ setForm({...form, reviews: e.target.value}); markDirty(); }} disabled={saving} />
                    </div>
                  </div>
                </div>

                {/* Right: gallery pickers (compress + preview) */}
                <div className="space-y-4">
                  <Label>Gallery (3 images)</Label>
                  {form.gallery.map((url, i) => (
                    <div key={i} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <Label>Image {i + 1}</Label>
                        {url && <a className="text-xs underline" target="_blank" rel="noreferrer" href={url}>Open</a>}
                      </div>
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                        <div className="border rounded-lg p-2 bg-white min-h-[160px] grid place-items-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          {galleryFiles[i] ? (
                            <img alt={`Preview ${i + 1}`} className="max-h-40 object-contain" src={URL.createObjectURL(galleryFiles[i]!)} />
                          ) : url ? (
                            <img alt={`Preview ${i + 1}`} className="max-h-40 object-contain" src={url} />
                          ) : (
                            <div className="text-xs text-muted-foreground">No image selected</div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e)=> onPickFile(e.target.files?.[0] ?? null, i)}
                              disabled={saving}
                            />
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Or paste a URL below. If a file is chosen, it will replace the URL on save.
                          </div>
                        </div>
                      </div>
                      <div className="mt-2">
                        <Input placeholder="Or paste image URL" value={form.gallery[i] || ""} onChange={(e)=> updateListItem("gallery", i, e.target.value)} />
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
                    <Input value={s} onChange={(e)=> updateListItem("howToUse", i, e.target.value)} disabled={saving} placeholder={`Step ${i + 1}`} />
                    {form.howToUse.length > 1 && (
                      <Button type="button" variant="outline" size="icon" onClick={()=> removeFromList("howToUse", i)} disabled={saving}>
                        <Minus className="h-4 w-4"/>
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={()=> addToList("howToUse")} disabled={saving}>
                  <Plus className="mr-2 h-4 w-4"/> Add Step
                </Button>
              </div>

              {/* Benefits */}
              <div className="space-y-3">
                <Label>Benefits</Label>
                {form.benefits.map((b, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={b} onChange={(e)=> updateListItem("benefits", i, e.target.value)} disabled={saving} placeholder="Benefit" />
                    {form.benefits.length > 1 && (
                      <Button type="button" variant="outline" size="icon" onClick={()=> removeFromList("benefits", i)} disabled={saving}>
                        <Minus className="h-4 w-4"/>
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={()=> addToList("benefits")} disabled={saving}>
                  <Plus className="mr-2 h-4 w-4"/> Add Benefit
                </Button>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 justify-end">
                <Button type="button" variant="destructive" onClick={()=> onDelete(selectedId)} disabled={saving} title="Delete current product">
                  <Trash className="h-4 w-4 mr-2"/> Delete
                </Button>
                <Button type="submit" disabled={!canSave} className="w-full sm:w-auto">
                  {saving ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Saving…</>) : (<><Save className="mr-2 h-4 w-4"/> Save Product</>)}
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
