'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { REGIONS } from '@/lib/regions';
import { panToMarker, travelTo } from '@/lib/travel';
import { useDismiss } from '@/hooks/useDismiss';
import { useMobile } from '@/hooks/useMobile';

const REGION_LABELS: Record<string, string> = {
  'phnom-penh': 'Phnom Penh',
  melbourne: 'Melbourne',
};

function Checkbox({ checked, accent }: { checked: boolean; accent: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
      <rect
        x="0.75" y="0.75" width="12.5" height="12.5" rx="3"
        fill={checked ? accent : 'none'}
        stroke={checked ? accent : '#8a7a63'}
        strokeWidth="1.5"
      />
      {checked && (
        <path
          d="M3 7 L6 10 L11 4"
          stroke="#FBF5EA"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

function CompassIcon({ open, accent }: { open: boolean; accent: string }) {
  return (
    <div style={{
      width: 44, height: 44,
      borderRadius: 12,
      background: open ? '#3F3226' : accent,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 4px 10px rgba(63,50,38,0.3)',
      transform: 'rotate(-2deg)',
      transition: 'background 0.2s',
    }}>
      <div style={{
        width: 0, height: 0,
        borderLeft: '8px solid transparent',
        borderRight: '8px solid transparent',
        borderBottom: `13px solid ${open ? accent : '#FBF5EA'}`,
        transform: 'rotate(45deg) translate(1px, -1px)',
        transition: 'border-bottom-color 0.2s',
      }} />
    </div>
  );
}

export default function WhatToFind() {
  const [open, setOpen] = useState(false);
  const mobile    = useMobile();
  const panelRef  = useRef<HTMLDivElement>(null);
  useDismiss(panelRef, () => setOpen(false), open);

  const currentRegion  = useGameStore((s) => s.currentRegion);
  const transitioning  = useGameStore((s) => s.transitioning);
  const markers        = useGameStore((s) => s.markers[currentRegion] ?? []);
  const visitedMarkers = useSettingsStore((s) => s.visitedMarkers);
  const toggleVisited  = useSettingsStore((s) => s.toggleVisited);
  const accent         = REGIONS[currentRegion].accentColor;
  const otherRegion    = currentRegion === 'phnom-penh' ? 'melbourne' : 'phnom-penh';
  const otherLabel     = REGION_LABELS[otherRegion];

  const flyToOther = () => {
    if (transitioning) return;
    setOpen(false);
    useGameStore.getState().setTransitioning(true);
    travelTo(otherRegion);
  };

  const grouped = markers.reduce<Record<string, typeof markers>>((acc, m) => {
    const d = m.district ?? 'Other';
    acc[d] = [...(acc[d] ?? []), m];
    return acc;
  }, {});
  const sortedDistricts = Object.keys(grouped).sort((a, b) => {
    if (a === 'Other') return 1;
    if (b === 'Other') return -1;
    return a.localeCompare(b);
  });

  // Panel content is identical on mobile and desktop.
  const panelContent = (
    <>
      <div style={{ padding: '12px 16px 10px', borderBottom: '1px solid #EEE1CB' }}>
        <p style={{ margin: 0, fontFamily: 'var(--font-caveat, cursive)', fontWeight: 700, fontSize: 20, color: '#C96A43' }}>
          Places
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
          <p style={{ margin: 0, fontFamily: 'var(--font-caveat, cursive)', fontWeight: 600, fontSize: 14, color: '#3F3226' }}>
            {REGION_LABELS[currentRegion]}
          </p>
          <button
            onClick={flyToOther}
            disabled={transitioning}
            style={{
              background: 'none', border: 'none', padding: '2px 0', cursor: transitioning ? 'wait' : 'pointer',
              fontFamily: 'var(--font-caveat, cursive)', fontWeight: 700, fontSize: 13,
              color: '#8a7a63', opacity: transitioning ? 0.5 : 1,
              display: 'flex', alignItems: 'center', gap: 3,
            }}
          >
            ✈ {otherLabel}
          </button>
        </div>
      </div>
      <div style={{ padding: '10px 16px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {markers.length === 0 ? (
          <p style={{ margin: 0, fontSize: 12, fontStyle: 'italic', color: '#8a7a63' }}>Nothing here yet.</p>
        ) : (
          sortedDistricts.map((district) => (
            <div key={district}>
              <p style={{
                margin: '0 0 5px',
                fontFamily: 'var(--font-caveat, cursive)',
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#8a7a63',
              }}>
                {district}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {grouped[district].map((m) => {
                  const visited = visitedMarkers.includes(m.id);
                  return (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        onClick={() => toggleVisited(m.id)}
                        title={visited ? 'Mark as not found' : 'Mark as found'}
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      >
                        <Checkbox checked={visited} accent={accent} />
                      </button>
                      <button
                        onClick={() => { panToMarker(m.lng, m.lat); setOpen(false); }}
                        style={{
                          background: 'none', border: 'none', padding: 0,
                          cursor: 'pointer', textAlign: 'left',
                          fontSize: 13, color: '#3F3226',
                          fontFamily: 'var(--font-lora, serif)',
                          opacity: visited ? 0.4 : 1,
                          textDecoration: visited ? 'line-through' : 'none',
                          transition: 'opacity 0.12s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = visited ? '0.25' : '0.65')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = visited ? '0.4' : '1')}
                      >
                        {m.title}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );

  const panelStyle = (origin: string): React.CSSProperties => ({
    background: '#FBF5EA',
    border: '1.5px dashed #C9B08A',
    borderRadius: 14,
    boxShadow: '0 8px 20px rgba(63,50,38,0.18)',
    minWidth: 200,
    maxWidth: 240,
    overflow: 'hidden',
    transformOrigin: origin,
    transform: 'rotate(-0.5deg)',
  });

  // Mobile: button sits above the D-pad (bottom: D-pad-bottom + D-pad-height + gap = 116+96+12 = 224)
  // Panel opens upward from button, anchored to bottom-right of container.
  if (mobile) {
    return (
      <div ref={panelRef} style={{ position: 'fixed', bottom: 224, right: 14, zIndex: 40 }}>
        <button
          onClick={() => setOpen((o) => !o)}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'block' }}
        >
          <CompassIcon open={open} accent={accent} />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 6 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                bottom: 'calc(100% + 8px)',
                right: 0,
                ...panelStyle('bottom right'),
              }}
            >
              {panelContent}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Desktop: button top-left, panel opens downward.
  return (
    <div ref={panelRef} style={{ position: 'fixed', top: 16, left: 16, zIndex: 40 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        title="Places"
        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'block' }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
      >
        <CompassIcon open={open} accent={accent} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -6 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            style={{ marginTop: 8, ...panelStyle('top left') }}
          >
            {panelContent}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
