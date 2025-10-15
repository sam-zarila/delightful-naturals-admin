"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Plus, Trash2, CheckCircle2, AlertCircle } from "lucide-react";

/* ──────────────────────────────────────────────────────────
   Types
────────────────────────────────────────────────────────── */
type JournalDoc = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverUrl?: string;
  content?: string;           // markdown or html (optional for safety)
  author?: string;
  published: boolean;
  publishedAt?: number | string | null;
  createdAt?: number | string | null;
  updatedAt?: number | string | null;
};

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/** Coerce any raw API item into a safe JournalDoc shape */
function normalizeDoc(raw: any): JournalDoc {
  const publishedAt = raw?.publishedAt ?? raw?.createdAt ?? null;
  return {
    id: String(raw?.id ?? ""),
    title: String(raw?.title ?? ""),
    slug: String(raw?.slug ?? ""),
    excerpt: raw?.excerpt ? String(raw.excerpt) : undefined,
    coverUrl: raw?.coverUrl || undefined,
    content: raw?.content ? String(raw.content) : "",
    author: raw?.author ? String(raw.author) : undefined,
    published: !!raw?.published,
    publishedAt,
    createdAt: raw?.createdAt ?? null,
    updatedAt: raw?.updatedAt ?? null,
  };
}

function fmtDate(d: number | string | null | undefined) {
  if (d == null) return "—";
  const date = typeof d === "number" ? new Date(d) : new Date(d);
  const time = date.getTime();
  if (Number.isNaN(time)) return "—";
  return date.toLocaleString();
}

/* ──────────────────────────────────────────────────────────
   Component
────────────────────────────────────────────────────────── */
export default function AdminJournalPage() {
  const [list, setList] = useState<JournalDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<null | { kind: "ok" | "err"; msg: string }>(null);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    coverUrl: "",
    content: "",
    author: "",
    published: true,
  });

  async function load() {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/journal?limit=50", { cache: "no-store" });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data) {
        throw new Error((data && (data.error || data.message)) || "Failed to fetch posts");
      }

      // Accept either [{...}] or { ok, items, ... }
      const items = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
      const normalized: JournalDoc[] = items.map(normalizeDoc);

      setList(normalized);
    } catch (e: any) {
      setStatus({ kind: "err", msg: e?.message || "Failed to load posts" });
      setList([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const title = form.title.trim();
      const slug = (form.slug || slugify(title)).trim();
      if (!title) throw new Error("Title is required.");
      if (!slug) throw new Error("Slug is required.");

      const payload = {
        title,
        slug,
        excerpt: form.excerpt.trim(),
        coverUrl: form.coverUrl.trim() || undefined, // omit if empty
        content: form.content.trim(),
        author: form.author.trim() || undefined,
        published: form.published,
        publishedAt: Date.now(), // client-side stamp (server may also write createdAt/updatedAt)
      };

      const res = await fetch("/api/admin/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || "Failed to save post");
      }

      setForm({ title: "", slug: "", excerpt: "", coverUrl: "", content: "", author: "", published: true });
      await load();
      setStatus({ kind: "ok", msg: "Post saved successfully." });
    } catch (e: any) {
      setStatus({ kind: "err", msg: e?.message || "Failed to save post" });
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this post?")) return;
    setStatus(null);
    try {
      const res = await fetch(`/api/admin/journal/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) throw new Error(data?.error || "Failed to delete");
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
          <h1 className="text-3xl font-bold text-charcoal">Journal</h1>
          <p className="text-muted-foreground">Create and manage blog posts.</p>
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
            <CardTitle>Create Post</CardTitle>
            <CardDescription>Publish a journal article.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-3">
              <input
                className="w-full border rounded-md px-3 py-2"
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
              <div className="grid md:grid-cols-2 gap-3">
                <input
                  className="border rounded-md px-3 py-2"
                  placeholder="Slug (optional – auto from title)"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                />
                <input
                  className="border rounded-md px-3 py-2"
                  placeholder="Cover Image URL (optional)"
                  value={form.coverUrl}
                  onChange={(e) => setForm({ ...form, coverUrl: e.target.value })}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <input
                  className="border rounded-md px-3 py-2"
                  placeholder="Author (optional)"
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                />
                <label className="inline-flex items-center gap-2 text-sm pl-1">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(e) => setForm({ ...form, published: e.target.checked })}
                  />
                  Published
                </label>
              </div>
              <textarea
                className="w-full border rounded-md px-3 py-2"
                rows={3}
                placeholder="Excerpt"
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              />
              <textarea
                className="w-full border rounded-md px-3 py-2"
                rows={12}
                placeholder="Content (Markdown or HTML)"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
              <div className="flex items-center gap-2">
                <Button type="submit" disabled={saving}>
                  <Plus className="h-4 w-4 mr-1" />
                  {saving ? "Saving…" : "Save Post"}
                </Button>
                <Button type="button" variant="outline" onClick={load} disabled={loading}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  {loading ? "Loading…" : "Refresh"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Existing posts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Current Posts</CardTitle>
              <CardDescription>Latest first</CardDescription>
            </div>
            <Button variant="outline" onClick={load} disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-1" />
              {loading ? "Loading…" : "Refresh"}
            </Button>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {list.map((p) => (
                <li key={p.id} className="py-4 flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{p.title}</div>
                      {!p.published && <Badge variant="outline">Draft</Badge>}
                    </div>
                    <div className="text-xs text-neutral-500 mt-0.5">
                      {fmtDate(p.publishedAt)} · {p.slug}
                    </div>
                    {p.excerpt && <p className="text-sm mt-1 text-neutral-800">{p.excerpt}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="destructive" size="icon" onClick={() => onDelete(p.id)} aria-label="Delete">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
              {!list.length && <li className="py-6 text-sm text-neutral-500 text-center">No posts yet.</li>}
            </ul>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
