"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

type Section = {
  id: string;
  section_key: string;
  section_type: string;
  eyebrow: string | null;
  title: string | null;
  body: string | null;
  primary_cta_label: string | null;
  primary_cta_href: string | null;
  secondary_cta_label: string | null;
  secondary_cta_href: string | null;
  media_path: string | null;
  media_url: string | null;
  theme: string;
  is_enabled: boolean;
  sort_order: number;
  status: string;
  scheduled_publish_at: string | null;
};

const empty = {
  section_key: "",
  section_type: "hero",
  eyebrow: "",
  title: "",
  body: "",
  primary_cta_label: "Shop handbags",
  primary_cta_href: "/shop",
  secondary_cta_label: "",
  secondary_cta_href: "",
  media_path: "",
  media_url: "",
  theme: "dark",
  is_enabled: true,
  sort_order: 10,
  status: "draft",
  scheduled_publish_at: "",
};

const types = ["hero", "promo", "product_rail", "editorial", "craft", "collections", "custom_order", "journal", "testimonial", "newsletter", "media"];
const IMAGE_MAX = 10 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export default function LandingCms() {
  const [rows, setRows] = useState<Section[]>([]);
  const [form, setForm] = useState<any>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const heroes = useMemo(() => rows.filter((x) => x.section_type === "hero" && x.status !== "archived"), [rows]);
  const set = (key: string, value: unknown) => setForm((current: any) => ({ ...current, [key]: value }));
  const cleanupPreview = () => { if (preview) URL.revokeObjectURL(preview); };

  const reset = () => {
    cleanupPreview();
    setEditingId(null);
    setForm({ ...empty });
    setFile(null);
    setPreview(null);
    setError("");
  };

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/content", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to load landing-page content.");
      setRows(Array.isArray(data.sections) ? data.sections : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load landing-page content.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    return () => cleanupPreview();
  }, []);

  const edit = (section: Section) => {
    cleanupPreview();
    setEditingId(section.id);
    setForm({
      ...empty,
      ...section,
      scheduled_publish_at: section.scheduled_publish_at ? new Date(section.scheduled_publish_at).toISOString().slice(0, 16) : "",
      media_url: section.media_url || "",
    });
    setFile(null);
    setPreview(null);
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const chooseFile = (next: File | null) => {
    cleanupPreview();
    if (next && (!IMAGE_TYPES.has(next.type) || next.size > IMAGE_MAX)) {
      setFile(null);
      setPreview(null);
      setError("Use JPG, PNG, WebP or AVIF up to 10 MiB.");
      return;
    }
    setFile(next);
    setPreview(next ? URL.createObjectURL(next) : null);
    setMessage("");
    setError("");
  };

  const uploadArtwork = async () => {
    if (!file || busy) return;
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/admin/content/media", { method: "POST", body });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Artwork upload failed.");
      set("media_path", data.path || "");
      set("media_url", data.url || preview || "");
      setFile(null);
      setMessage("Artwork uploaded. Save the section to attach it.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Artwork upload failed.");
    } finally {
      setBusy(false);
    }
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    const key = String(form.section_key || "").trim();
    if (!key) return setError("Give this section a unique key.");
    if (!editingId && form.section_type === "hero" && heroes.length >= 5) return setError("You can have a maximum of 5 hero slides.");
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const payload = {
        ...form,
        section_key: key,
        eyebrow: String(form.eyebrow || "").trim(),
        sort_order: Number(form.sort_order),
        scheduled_publish_at: form.scheduled_publish_at || null,
      };
      delete payload.media_url;
      const response = await fetch(editingId ? `/api/admin/content/${editingId}` : "/api/admin/content", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not save landing section.");
      reset();
      await load();
      setMessage("Saved. The customer homepage will use this content when it is published and visible.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save landing section.");
    } finally {
      setBusy(false);
    }
  };

  const removeSection = async (id: string) => {
    if (!window.confirm("Remove this landing section? This cannot be undone.")) return;
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch(`/api/admin/content/${id}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not remove section.");
      if (editingId === id) reset();
      await load();
      setMessage("Section removed.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not remove section.");
    } finally {
      setBusy(false);
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= rows.length || busy) return;
    const current = rows[index], target = rows[targetIndex];
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const update = async (section: Section, sortOrder: number) => {
        const payload = {
          section_key: section.section_key,
          section_type: section.section_type,
          eyebrow: section.eyebrow || "",
          title: section.title || "",
          body: section.body || "",
          primary_cta_label: section.primary_cta_label || "",
          primary_cta_href: section.primary_cta_href || "",
          secondary_cta_label: section.secondary_cta_label || "",
          secondary_cta_href: section.secondary_cta_href || "",
          media_path: section.media_path || "",
          theme: section.theme,
          is_enabled: section.is_enabled,
          sort_order: sortOrder,
          status: section.status,
          scheduled_publish_at: section.scheduled_publish_at || null,
        };
        const response = await fetch(`/api/admin/content/${section.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not reorder sections.");
      };
      await update(current, target.sort_order);
      await update(target, current.sort_order);
      await load();
      setMessage("Section order updated.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not reorder sections.");
    } finally {
      setBusy(false);
    }
  };

  const removeArtwork = () => {
    cleanupPreview();
    set("media_path", "");
    set("media_url", "");
    setFile(null);
    setPreview(null);
  };

  return <div className="zorah-content-layout">
    <form className="zorah-content-card zorah-content-form" onSubmit={save}>
      <div className="zorah-content-card-head">
        <div><h2>{editingId ? "Edit landing section" : "Add landing section"}</h2><p>Edit exactly what customers see. Clear a field if you do not want it displayed.</p></div>
        {editingId && <button type="button" className="zorah-content-cancel" onClick={reset}>Cancel</button>}
      </div>
      {message && <div className="zorah-content-message">{message}</div>}
      {error && <div className="zorah-content-message zorah-content-message-error" role="alert">{error}</div>}

      <div className="zorah-content-field"><label className="zorah-content-label" htmlFor="section-key">Section key</label><input id="section-key" required className="zorah-content-input" value={form.section_key} onChange={e => set("section_key", e.target.value)} placeholder="hero-01, story, site-logo" /></div>
      <div className="zorah-content-two"><div className="zorah-content-field"><label className="zorah-content-label">Section type</label><select className="zorah-content-select" value={form.section_type} onChange={e => set("section_type", e.target.value)}>{types.map(type => <option key={type}>{type}</option>)}</select></div><div className="zorah-content-field"><label className="zorah-content-label">Display order</label><input className="zorah-content-input" type="number" min="0" max="10000" value={form.sort_order} onChange={e => set("sort_order", e.target.value)} /></div></div>
      <div className="zorah-content-field"><label className="zorah-content-label">Small supporting text <span>(optional)</span></label><input className="zorah-content-input" value={form.eyebrow ?? ""} onChange={e => set("eyebrow", e.target.value)} placeholder="Leave empty for a cleaner page" /></div>
      <div className="zorah-content-field"><label className="zorah-content-label">Main title</label><input className="zorah-content-input" value={form.title ?? ""} onChange={e => set("title", e.target.value)} placeholder="Customer-facing headline" /></div>
      <div className="zorah-content-field"><label className="zorah-content-label">Body text</label><textarea className="zorah-content-textarea" rows={6} value={form.body ?? ""} onChange={e => set("body", e.target.value)} placeholder="The actual copy customers should read." /></div>

      <div className="zorah-content-subhead">Buttons</div>
      <div className="zorah-content-two"><div className="zorah-content-field"><label className="zorah-content-label">Primary button</label><input className="zorah-content-input" value={form.primary_cta_label ?? ""} onChange={e => set("primary_cta_label", e.target.value)} placeholder="Shop handbags" /></div><div className="zorah-content-field"><label className="zorah-content-label">Primary link</label><input className="zorah-content-input" value={form.primary_cta_href ?? ""} onChange={e => set("primary_cta_href", e.target.value)} placeholder="/shop" /></div><div className="zorah-content-field"><label className="zorah-content-label">Secondary button</label><input className="zorah-content-input" value={form.secondary_cta_label ?? ""} onChange={e => set("secondary_cta_label", e.target.value)} placeholder="Our story" /></div><div className="zorah-content-field"><label className="zorah-content-label">Secondary link</label><input className="zorah-content-input" value={form.secondary_cta_href ?? ""} onChange={e => set("secondary_cta_href", e.target.value)} placeholder="/our-story" /></div></div>

      <div className="zorah-content-media"><div className="zorah-content-media-head"><div><strong>Section image</strong><span>Upload the real Zorah photography, hero image or logo. JPG, PNG, WebP or AVIF, up to 10 MiB.</span></div>{(form.media_path || preview) && <button type="button" className="zorah-content-remove-image" onClick={removeArtwork}>Remove</button>}</div>{(preview || form.media_url) && <div className="zorah-content-preview"><img src={preview || form.media_url} alt="Landing artwork preview" /></div>}<input className="zorah-content-file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={e => chooseFile(e.target.files?.[0] ?? null)} />{file && <button type="button" disabled={busy} className="zorah-content-upload" onClick={uploadArtwork}>{busy ? "Uploading…" : "Upload image"}</button>}{form.media_path && !preview && <span className="zorah-content-attached">Image attached to this section.</span>}</div>

      <div className="zorah-content-two"><div className="zorah-content-field"><label className="zorah-content-label">Theme</label><select className="zorah-content-select" value={form.theme} onChange={e => set("theme", e.target.value)}>{["light", "dark", "leather", "green", "ivory"].map(theme => <option key={theme}>{theme}</option>)}</select></div><div className="zorah-content-field"><label className="zorah-content-label">Status</label><select className="zorah-content-select" value={form.status} onChange={e => set("status", e.target.value)}>{["draft", "published", "archived"].map(status => <option key={status}>{status}</option>)}</select></div></div>
      <div className="zorah-content-field"><label className="zorah-content-label">Scheduled publish <span>(optional)</span></label><input className="zorah-content-input" type="datetime-local" value={form.scheduled_publish_at} onChange={e => set("scheduled_publish_at", e.target.value)} /></div>
      <label className="zorah-content-check"><input type="checkbox" checked={!!form.is_enabled} onChange={e => set("is_enabled", e.target.checked)} /><span>Show this section on the customer site</span></label>
      <button className="zorah-content-save" disabled={busy}>{busy ? "Working…" : editingId ? "Save changes" : "Create section"}</button>
    </form>

    <section className="zorah-content-card zorah-content-list">
      <div className="zorah-content-card-head"><div><h2>Homepage controls</h2><p>Every section already on the homepage can be edited, reordered, hidden or removed here.</p></div><span className="zorah-content-hero-limit">{heroes.length}/5 hero slides</span></div>
      <div className="zorah-content-toolbar"><a href="/" className="zorah-content-preview-link">Preview customer homepage ↗</a><button type="button" className="zorah-content-refresh" onClick={() => void load()}>Refresh</button></div>
      <div className="zorah-content-helper"><strong>Logo:</strong> edit the <strong>site-logo</strong> section and upload the approved logo. The public header and footer use that artwork automatically.</div>
      {loading ? <div className="zorah-content-empty"><strong>Loading</strong>Reading your landing-page content…</div> : rows.length === 0 ? <div className="zorah-content-empty"><strong>No homepage sections</strong>Create a section above. Published and visible sections appear on the customer homepage.</div> : <div className="zorah-content-rows">{rows.map((section, index) => <article className="zorah-content-row" key={section.id}><div className="zorah-content-order"><button type="button" disabled={index === 0 || busy} onClick={() => void move(index, -1)} aria-label="Move section up">↑</button><button type="button" disabled={index === rows.length - 1 || busy} onClick={() => void move(index, 1)} aria-label="Move section down">↓</button></div><div className="zorah-content-row-main"><div className="zorah-content-row-top"><h3 className="zorah-content-row-title">{section.title || section.section_key}</h3><span className={`zorah-content-status ${section.status}`}>{section.status}</span></div><p className="zorah-content-row-meta">{section.section_type} · order {section.sort_order} · {section.is_enabled ? "visible" : "hidden"}</p></div><div className="zorah-content-row-actions"><button type="button" onClick={() => edit(section)}>Edit</button><button type="button" className="danger" disabled={busy} onClick={() => void removeSection(section.id)}>Remove</button></div></article>)}</div>}
    </section>
  </div>;
}
