"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Plus, Trash2, CheckCircle2, AlertCircle } from "lucide-react";

type TestimonialDoc = {
  id: string;
  name: string;
  location?: string;
  rating: number;      // 0..5
  message: string;
  avatarUrl?: string;
  createdAt: number;   // epoch ms
  published: boolean;
};

export default function AdminTestimonialsPage() {
  const [list, setList] = useState<TestimonialDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<null | { kind: "ok" | "err"; msg: string }>(null);

  const [form, setForm] = useState({
    name: "",
    location: "",
    rating: "5",
    message: "",
    avatarUrl: "",
    published: true,
  });

  async function load() {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/testimonials?limit=50", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch testimonials");
      const items = (await res.json()) as TestimonialDoc[];
      setList(items);
    } catch (e: any) {
      setStatus({ kind: "err", msg: e?.message || "Failed to load testimonials" });
      setList([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const payload = {
        name: form.name.trim(),
        location: form.location.trim() || undefined,
        avatarUrl: form.avatarUrl.trim() || undefined,
        rating: Number(form.rating || 0),
        message: form.message.trim(),
        published: form.published,
        createdAt: Date.now(),
      };
      if (!payload.name || !payload.message) {
        throw new Error("Name and message are required.");
      }
      if (isNaN(payload.rating) || payload.rating < 0 || payload.rating > 5) {
        throw new Error("Rating must be between 0 and 5.");
      }

      const res = await fetch("/api/admin/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to save testimonial");
      }

      setForm({ name: "", location: "", rating: "5", message: "", avatarUrl: "", published: true });
      await load();
      setStatus({ kind: "ok", msg: "Testimonial saved successfully." });
    } catch (e: any) {
      setStatus({ kind: "err", msg: e?.message || "Failed to save testimonial" });
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this testimonial?")) return;
    setStatus(null);
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      await load();
      setStatus({ kind: "ok", msg: "Deleted." });
    } catch (e: any) {
      setStatus({ kind: "err", msg: e?.message || "Failed to delete" });
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-charcoal">Testimonials</h1>
          <p className="text-muted-foreground">Create and manage customer testimonials.</p>
        </div>

        {/* Feedback */}
        {status && (
          <Card className={status.kind === "ok" ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}>
            <CardContent className="py-3 text-sm flex items-center gap-2">
              {status.kind === "ok" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-700" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-700" />
              )}
              <span className={status.kind === "ok" ? "text-emerald-800" : "text-red-800"}>{status.msg}</span>
            </CardContent>
          </Card>
        )}

        {/* Create form */}
        <Card>
          <CardHeader>
            <CardTitle>Create Testimonial</CardTitle>
            <CardDescription>Post a new customer review.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <input
                  className="border rounded-md px-3 py-2"
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
                <input
                  className="border rounded-md px-3 py-2"
                  placeholder="Location (optional)"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
                <input
                  className="border rounded-md px-3 py-2"
                  placeholder="Avatar URL (optional)"
                  value={form.avatarUrl}
                  onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
                />
                <input
                  className="border rounded-md px-3 py-2"
                  type="number"
                  min={0}
                  max={5}
                  step={0.1}
                  placeholder="Rating 0–5"
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: e.target.value })}
                />
              </div>
              <textarea
                className="w-full border rounded-md px-3 py-2"
                rows={5}
                placeholder="Message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
              />
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                />
                Published
              </label>
              <div className="flex items-center gap-2">
                <Button type="submit" disabled={saving}>
                  <Plus className="h-4 w-4 mr-1" />
                  {saving ? "Saving…" : "Save Testimonial"}
                </Button>
                <Button type="button" variant="outline" onClick={load} disabled={loading}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  {loading ? "Loading…" : "Refresh"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Existing list */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Current Testimonials</CardTitle>
              <CardDescription>Latest first</CardDescription>
            </div>
            <Button variant="outline" onClick={load} disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-1" />
              {loading ? "Loading…" : "Refresh"}
            </Button>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {list.map((t) => (
                <li key={t.id} className="py-4 flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{t.name}</div>
                      {t.location && <span className="text-xs text-neutral-500">· {t.location}</span>}
                      <Badge className="bg-amber-100 text-amber-800">⭐ {t.rating.toFixed(1)}</Badge>
                      {!t.published && <Badge variant="outline">Draft</Badge>}
                    </div>
                    <p className="text-sm mt-1 text-neutral-800">{t.message}</p>
                    <div className="text-xs text-neutral-500 mt-1">
                      {new Date(t.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="destructive" size="icon" onClick={() => onDelete(t.id)} aria-label="Delete">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
              {!list.length && (
                <li className="py-6 text-sm text-neutral-500 text-center">No testimonials yet.</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
