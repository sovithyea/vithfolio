'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/stores/gameStore';
import type { ProjectMarker } from '@/lib/regions';

type LinkEntry = { label: string; url: string };
type FormState = { title: string; blurb: string; district: string; description: string; links: LinkEntry[]; images: string[] };
const EMPTY: FormState = { title: '', blurb: '', district: '', description: '', links: [], images: [] };

export default function EditOverlay() {
  const editMode = useGameStore((s) => s.editMode);
  const currentRegion = useGameStore((s) => s.currentRegion);
  const allMarkers = useGameStore((s) => s.markers);
  const pendingCoords = useGameStore((s) => s.pendingCoords);
  const editingMarkerId = useGameStore((s) => s.editingMarkerId);
  const setPendingCoords = useGameStore((s) => s.setPendingCoords);
  const setEditingMarkerId = useGameStore((s) => s.setEditingMarkerId);
  const setMarkers = useGameStore((s) => s.setMarkers);

  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const regionMarkers = allMarkers[currentRegion] ?? [];
  const showForm = !!(pendingCoords || editingMarkerId);

  useEffect(() => {
    if (editingMarkerId) {
      const m = regionMarkers.find((p) => p.id === editingMarkerId);
      if (m) setForm({ title: m.title, blurb: m.blurb, district: m.district ?? '', description: m.description, links: m.links, images: m.images });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingMarkerId]);

  useEffect(() => {
    if (pendingCoords) setForm(EMPTY);
  }, [pendingCoords]);

  if (!editMode) return null;

  const cancel = () => { setPendingCoords(null); setEditingMarkerId(null); };

  const uploadImage = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd }).catch(() => null);
    if (res?.ok) {
      const { path } = await res.json();
      setForm((s) => ({ ...s, images: [...s.images, path] }));
    }
    setUploading(false);
  };

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    const updated = [...regionMarkers];
    if (editingMarkerId) {
      const idx = updated.findIndex((p) => p.id === editingMarkerId);
      if (idx !== -1) updated[idx] = { ...updated[idx], ...form };
    } else if (pendingCoords) {
      const newMarker: ProjectMarker = {
        id: form.title.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
        lng: pendingCoords.lng,
        lat: pendingCoords.lat,
        ...form,
      };
      updated.push(newMarker);
    }
    const payload = { ...allMarkers, [currentRegion]: updated };
    await fetch('/api/markers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});
    setMarkers(currentRegion, updated);
    cancel();
    setSaving(false);
  };

  const del = async (id: string) => {
    const updated = regionMarkers.filter((p) => p.id !== id);
    const payload = { ...allMarkers, [currentRegion]: updated };
    await fetch('/api/markers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});
    setMarkers(currentRegion, updated);
  };

  const inputStyle = { background: '#EFE8D9', border: '1px solid #E8DCC8', color: '#3A2E26' };

  return (
    <div
      className="fixed top-4 right-4 z-50 w-72 rounded-xl overflow-hidden shadow-xl"
      style={{ background: '#FAF3E8', border: '1px solid #E8DCC8' }}
    >
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid #E8DCC8' }}>
        <span className="text-xs font-medium uppercase tracking-wide" style={{ color: '#C97A4A' }}>◉ Edit Mode</span>
        <span className="text-xs" style={{ color: '#6B5D4F' }}>{currentRegion} · E to exit</span>
      </div>

      {showForm ? (
        <div className="p-4 flex flex-col gap-3">
          <p className="text-xs" style={{ color: '#6B5D4F' }}>
            {editingMarkerId ? 'Editing' : `${pendingCoords?.lng.toFixed(4)}, ${pendingCoords?.lat.toFixed(4)}`}
          </p>
          {(['title', 'blurb', 'district'] as const).map((f) => (
            <div key={f} className="flex flex-col gap-1">
              <label className="text-xs capitalize" style={{ color: '#6B5D4F' }}>{f}</label>
              <input
                value={form[f]}
                onChange={(e) => setForm((s) => ({ ...s, [f]: e.target.value }))}
                className="text-sm px-2 py-1 rounded-md outline-none w-full"
                style={inputStyle}
              />
            </div>
          ))}
          <div className="flex flex-col gap-1">
            <label className="text-xs" style={{ color: '#6B5D4F' }}>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
              rows={3}
              className="text-sm px-2 py-1 rounded-md outline-none w-full resize-none"
              style={inputStyle}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs" style={{ color: '#6B5D4F' }}>Images</label>
            {form.images.length > 0 && (
              <div className="flex flex-col gap-1">
                {form.images.map((src, i) => (
                  <div key={src} className="flex items-center gap-2">
                    <img src={src} alt="" className="w-10 h-10 object-cover rounded" style={{ border: '1px solid #E8DCC8' }} />
                    <span className="text-xs truncate flex-1" style={{ color: '#6B5D4F' }}>{src.split('/').pop()}</span>
                    <button onClick={() => setForm((s) => ({ ...s, images: s.images.filter((_, j) => j !== i) }))}
                      className="text-xs shrink-0" style={{ color: '#C97A4A' }}>✕</button>
                  </div>
                ))}
              </div>
            )}
            <label
              className="text-xs cursor-pointer self-start px-3 py-1 rounded-md transition-opacity hover:opacity-70"
              style={{ border: '1px solid #C97A4A', color: '#C97A4A' }}
            >
              {uploading ? 'Uploading…' : '+ add image'}
              <input type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); e.target.value = ''; }}
                disabled={uploading} />
            </label>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs" style={{ color: '#6B5D4F' }}>Links</label>
            {form.links.map((link, i) => (
              <div key={i} className="flex gap-1">
                <input placeholder="label" value={link.label}
                  onChange={(e) => { const l = [...form.links]; l[i] = { ...l[i], label: e.target.value }; setForm((s) => ({ ...s, links: l })); }}
                  className="text-xs px-2 py-1 rounded-md outline-none w-20" style={inputStyle} />
                <input placeholder="url" value={link.url}
                  onChange={(e) => { const l = [...form.links]; l[i] = { ...l[i], url: e.target.value }; setForm((s) => ({ ...s, links: l })); }}
                  className="text-xs px-2 py-1 rounded-md outline-none flex-1" style={inputStyle} />
                <button onClick={() => setForm((s) => ({ ...s, links: s.links.filter((_, j) => j !== i) }))}
                  className="text-xs px-1" style={{ color: '#C97A4A' }}>✕</button>
              </div>
            ))}
            <button onClick={() => setForm((s) => ({ ...s, links: [...s.links, { label: '', url: '' }] }))}
              className="text-xs self-start" style={{ color: '#C97A4A' }}>+ add link</button>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={cancel} className="text-xs px-3 py-1.5 rounded-md flex-1"
              style={{ border: '1px solid #E8DCC8', color: '#6B5D4F' }}>Cancel</button>
            <button onClick={save} disabled={saving || !form.title.trim()}
              className="text-xs px-3 py-1.5 rounded-md flex-1 font-medium disabled:opacity-50"
              style={{ background: '#C97A4A', color: '#FAF3E8' }}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 flex flex-col gap-2">
          {regionMarkers.length === 0
            ? <p className="text-xs" style={{ color: '#6B5D4F' }}>Click map to add first marker</p>
            : regionMarkers.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium truncate" style={{ color: '#3A2E26' }}>{m.title}</span>
                <div className="flex gap-3 shrink-0">
                  <button onClick={() => setEditingMarkerId(m.id)} className="text-xs" style={{ color: '#C97A4A' }}>Edit</button>
                  <button onClick={() => del(m.id)} className="text-xs" style={{ color: '#6B5D4F' }}>Del</button>
                </div>
              </div>
            ))
          }
          <p className="text-xs mt-1 pt-2" style={{ color: '#94a3b8', borderTop: '1px solid #E8DCC8' }}>
            Click anywhere on map to place
          </p>
        </div>
      )}
    </div>
  );
}
