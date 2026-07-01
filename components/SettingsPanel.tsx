'use client';

import { useRef, useState } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { useGameStore } from '@/stores/gameStore';
import { useDismiss } from '@/hooks/useDismiss';
import { MAP_STYLES } from '@/lib/regions';
import { changeStyle } from '@/lib/travel';

export default function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  useDismiss(panelRef, () => setOpen(false), open);

  const speed = useSettingsStore((s) => s.speed);
  const zoom = useSettingsStore((s) => s.zoom);
  const setSpeed = useSettingsStore((s) => s.setSpeed);
  const setZoom = useSettingsStore((s) => s.setZoom);

  const currentRegion = useGameStore((s) => s.currentRegion);
  const mapStyles = useSettingsStore((s) => s.mapStyles);
  const currentStyle = mapStyles[currentRegion] ?? '';

  const inputStyle = { background: '#EEE1CB', border: '1px solid #E7D8BE', color: '#3F3226' };

  return (
    <div ref={panelRef} className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm transition-opacity hover:opacity-80"
        style={{ background: '#FBF5EA', border: '1px solid #E7D8BE', color: '#5b4c3a' }}
        title="Settings"
      >⚙</button>

      {open && (
        <div
          className="absolute bottom-10 right-0 w-56 rounded-xl p-4 flex flex-col gap-4 shadow-xl"
          style={{ background: '#FBF5EA', border: '1.5px dashed #C9B08A' }}
        >
          <p className="text-xs font-medium uppercase tracking-wide"
            style={{ color: '#C96A43', fontFamily: 'var(--font-caveat, cursive)', fontSize: 14 }}>
            Settings
          </p>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between">
              <label className="text-xs" style={{ color: '#5b4c3a' }}>Speed</label>
              <span className="text-xs font-medium" style={{ color: '#3F3226' }}>{speed}</span>
            </div>
            <input
              type="range" min={2} max={24} step={1} value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full accent-[#C96A43]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between">
              <label className="text-xs" style={{ color: '#5b4c3a' }}>Zoom</label>
              <span className="text-xs font-medium" style={{ color: '#3F3226' }}>{zoom}</span>
            </div>
            <input
              type="range" min={12} max={17} step={0.5} value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-[#C96A43]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs" style={{ color: '#5b4c3a' }}>Map Style</label>
            <select
              value={currentStyle}
              onChange={(e) => changeStyle(e.target.value)}
              className="text-xs px-2 py-1.5 rounded-md outline-none w-full"
              style={inputStyle}
            >
              {MAP_STYLES.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
