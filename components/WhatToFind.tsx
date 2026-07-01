'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { REGIONS } from '@/lib/regions';
import { panToMarker } from '@/lib/travel';
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

// compass icon: terracotta square with a northeast-pointing arrow
function CompassIcon({ open, accent }: { open: boolean; accent: string }) {
  return (
    <div style={{
      width: 44, height: 44,
      borderRadius: 12,
      background: open ? '#3F3226' : '#C96A43',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 4px 10px rgba(63,50,38,0.3)',
      transform: 'rotate(-2deg)',
      transition: 'background 0.2s',
    }}>
      {/* CSS-triangle northeast arrow */}
      <div style={{
        width: 0, height: 0,
        borderLeft: '8px solid transparent',
        borderRight: '8px solid transparent',
        borderBottom: `13px solid ${open ? '#C96A43' : '#FBF5EA'}`,
        transform: 'rotate(45deg) translate(1px, -1px)',
        transition: 'border-bottom-color 0.2s',
      }} />
    </div>
  );
}

export default function WhatToFind() {
  const [open, setOpen] = useState(false);
  const mobile = useMobile();
  const panelRef = useRef<HTMLDivElement>(null);
  useDismiss(panelRef, () => setOpen(false), open);

  const currentRegion   = useGameStore((s) => s.currentRegion);
  const markers         = useGameStore((s) => s.markers[currentRegion] ?? []);
  const visitedMarkers  = useSettingsStore((s) => s.visitedMarkers);
  const toggleVisited   = useSettingsStore((s) => s.toggleVisited);
  const accent          = REGIONS[currentRegion].accentColor;

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

  // on mobile: compass is decorative (no panel, smaller), bottom sheet handles places
  if (mobile) {
    return (
      <div style={{ position: 'fixed', top: 14, left: 14, zIndex: 40, pointerEvents: 'none' }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, background: '#C96A43',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 3px 8px rgba(63,50,38,0.3)', transform: 'rotate(-2deg)',
        }}>
          <div style={{
            width: 0, height: 0,
            borderLeft: '7px solid transparent', borderRight: '7px solid transparent',
            borderBottom: '11px solid #FBF5EA',
            transform: 'rotate(45deg) translate(1px,-1px)',
          }} />
        </div>
      </div>
    );
  }

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
            style={{
              marginTop: 8,
              background: '#FBF5EA',
              border: '1.5px dashed #C9B08A',
              borderRadius: 14,
              boxShadow: '0 8px 20px rgba(63,50,38,0.18)',
              minWidth: 200,
              maxWidth: 240,
              overflow: 'hidden',
              transformOrigin: 'top left',
              transform: 'rotate(-0.5deg)',
            }}
          >
            {/* header */}
            <div style={{ padding: '12px 16px 10px', borderBottom: '1px solid #EEE1CB' }}>
              <p style={{
                margin: 0,
                fontFamily: 'var(--font-caveat, cursive)',
                fontWeight: 700,
                fontSize: 20,
                color: '#C96A43',
              }}>
                Places
              </p>
              <p style={{
                margin: '1px 0 0',
                fontFamily: 'var(--font-caveat, cursive)',
                fontWeight: 600,
                fontSize: 14,
                color: '#3F3226',
              }}>
                {REGION_LABELS[currentRegion]}
              </p>
            </div>

            {/* marker list */}
            <div style={{ padding: '10px 16px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {markers.length === 0 ? (
                <p style={{ margin: 0, fontSize: 12, fontStyle: 'italic', color: '#8a7a63' }}>
                  Nothing here yet.
                </p>
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
                              style={{
                                background: 'none', border: 'none', padding: 0,
                                cursor: 'pointer', display: 'flex', alignItems: 'center',
                              }}
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
