'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { REGIONS } from '@/lib/regions';
import { panToMarker } from '@/lib/travel';
import { useDismiss } from '@/hooks/useDismiss';

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
        stroke={checked ? accent : '#6B5D4F'}
        strokeWidth="1.5"
      />
      {checked && (
        <path
          d="M3 7 L6 10 L11 4"
          stroke="#FAF3E8"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

export default function WhatToFind() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  useDismiss(panelRef, () => setOpen(false), open);

  const currentRegion = useGameStore((s) => s.currentRegion);
  const markers = useGameStore((s) => s.markers[currentRegion] ?? []);
  const visitedMarkers = useSettingsStore((s) => s.visitedMarkers);
  const toggleVisited = useSettingsStore((s) => s.toggleVisited);
  const accent = REGIONS[currentRegion].accentColor;

  // group by district, "Other" last
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

  return (
    <div ref={panelRef} style={{ position: 'fixed', top: 16, left: 16, zIndex: 40 }}>
      {/* envelope toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        title="What to Find"
        style={{
          display: 'block',
          background: '#FAF3E8',
          border: `1px solid ${open ? accent : '#E8DCC8'}`,
          borderRadius: 10,
          padding: '7px 10px',
          boxShadow: '0 1px 6px rgba(58,46,38,0.12)',
          cursor: 'pointer',
          transition: 'opacity 0.15s, border-color 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
      >
        <svg width="28" height="20" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="0.75" y="0.75" width="26.5" height="18.5" rx="2.5"
            fill="#FAF3E8" stroke={open ? accent : '#E8DCC8'} strokeWidth="1.5"/>
          <path d="M1 1 L14 9.5 L27 1"
            stroke="#3A2E26" strokeWidth="1" strokeLinejoin="round" opacity="0.35" fill="none"/>
          <path d="M1 19.25 L9 12.5" stroke="#3A2E26" strokeWidth="1" opacity="0.2"/>
          <path d="M27 19.25 L19 12.5" stroke="#3A2E26" strokeWidth="1" opacity="0.2"/>
          <circle cx="14" cy="13" r="4.5" fill={accent} opacity="0.85"/>
          <circle cx="14" cy="13" r="2.5" fill={accent}/>
        </svg>
      </button>

      {/* unfolded panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -6 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            style={{
              marginTop: 8,
              background: '#FAF3E8',
              border: '1px solid #E8DCC8',
              borderRadius: 14,
              boxShadow: '0 4px 20px rgba(58,46,38,0.18)',
              minWidth: 230,
              maxWidth: 270,
              overflow: 'hidden',
              transformOrigin: 'top left',
            }}
          >
            {/* header */}
            <div style={{ padding: '12px 16px 10px', borderBottom: '1px solid #E8DCC8' }}>
              <p style={{
                margin: 0,
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-fraunces, serif)',
                color: accent,
              }}>
                What to Find
              </p>
              <p style={{ margin: '1px 0 0', fontSize: 12, color: '#3A2E26', fontFamily: 'var(--font-fraunces, serif)' }}>
                {REGION_LABELS[currentRegion]}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 11, color: '#6B5D4F' }}>Things to find:</p>
            </div>

            {/* districts + markers */}
            <div style={{ padding: '10px 16px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {markers.length === 0 ? (
                <p style={{ margin: 0, fontSize: 12, color: '#6B5D4F' }}>No markers yet.</p>
              ) : (
                sortedDistricts.map((district) => (
                  <div key={district}>
                    <p style={{
                      margin: '0 0 5px',
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      fontFamily: 'var(--font-fraunces, serif)',
                      color: '#6B5D4F',
                    }}>
                      {district}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {grouped[district].map((m) => {
                        const visited = visitedMarkers.includes(m.id);
                        return (
                          <div
                            key={m.id}
                            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                          >
                            {/* checkbox toggle */}
                            <button
                              onClick={() => toggleVisited(m.id)}
                              title={visited ? 'Mark as not found' : 'Mark as found'}
                              style={{
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'opacity 0.12s',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
                              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                            >
                              <Checkbox checked={visited} accent={accent} />
                            </button>

                            {/* title — click to pan */}
                            <button
                              onClick={() => { panToMarker(m.lng, m.lat); setOpen(false); }}
                              style={{
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                cursor: 'pointer',
                                textAlign: 'left',
                                fontSize: 13,
                                color: '#3A2E26',
                                opacity: visited ? 0.45 : 1,
                                textDecoration: visited ? 'line-through' : 'none',
                                transition: 'opacity 0.12s',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.opacity = visited ? '0.3' : '0.65')}
                              onMouseLeave={(e) => (e.currentTarget.style.opacity = visited ? '0.45' : '1')}
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
