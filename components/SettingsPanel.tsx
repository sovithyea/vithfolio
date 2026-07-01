'use client';

import { useRef, useState } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { useDismiss } from '@/hooks/useDismiss';

export default function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  useDismiss(panelRef, () => setOpen(false), open);
  const speed = useSettingsStore((s) => s.speed);
  const zoom = useSettingsStore((s) => s.zoom);
  const setSpeed = useSettingsStore((s) => s.setSpeed);
  const setZoom = useSettingsStore((s) => s.setZoom);

  return (
    <div ref={panelRef} className="fixed bottom-4 left-4 z-50">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm transition-opacity hover:opacity-80"
        style={{ background: '#FAF3E8', border: '1px solid #E8DCC8', color: '#6B5D4F' }}
        title="Settings"
      >⚙</button>

      {open && (
        <div
          className="absolute bottom-10 left-0 w-56 rounded-xl p-4 flex flex-col gap-4 shadow-xl"
          style={{ background: '#FAF3E8', border: '1px solid #E8DCC8' }}
        >
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: '#C97A4A' }}>Settings</p>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between">
              <label className="text-xs" style={{ color: '#6B5D4F' }}>Speed</label>
              <span className="text-xs font-medium" style={{ color: '#3A2E26' }}>{speed}</span>
            </div>
            <input
              type="range" min={2} max={24} step={1} value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full accent-[#C97A4A]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between">
              <label className="text-xs" style={{ color: '#6B5D4F' }}>Zoom</label>
              <span className="text-xs font-medium" style={{ color: '#3A2E26' }}>{zoom}</span>
            </div>
            <input
              type="range" min={12} max={17} step={0.5} value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-[#C97A4A]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
