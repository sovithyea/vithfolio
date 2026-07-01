'use client';

import { useRef, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { travelTo } from '@/lib/travel';
import { useDismiss } from '@/hooks/useDismiss';
import { useMobile } from '@/hooks/useMobile';

const REGION_CONFIG = [
  { id: 'phnom-penh', label: 'Phnom Penh' },
  { id: 'melbourne',  label: 'Melbourne'  },
] as const;

export default function RegionSwitcher() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useDismiss(containerRef, () => setOpen(false), open);

  const mobile        = useMobile();
  const currentRegion = useGameStore((s) => s.currentRegion);
  const transitioning = useGameStore((s) => s.transitioning);
  const currentLabel  = REGION_CONFIG.find((r) => r.id === currentRegion)?.label ?? currentRegion;

  // bottom sheet handles region switching on mobile
  if (mobile) return null;

  const travel = (id: string) => {
    if (id === currentRegion || transitioning) return;
    setOpen(false);
    useGameStore.getState().setTransitioning(true);
    travelTo(id);
  };

  return (
    <div
      ref={containerRef}
      style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 40 }}
    >
      {/* dropdown — rendered above the trigger */}
      {open && (
        <div style={{
          position: 'absolute',
          bottom: 'calc(100% + 8px)',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#FBF5EA',
          border: '1.5px dashed #C9B08A',
          borderRadius: 14,
          boxShadow: '0 8px 20px rgba(63,50,38,0.18)',
          overflow: 'hidden',
          minWidth: 160,
        }}>
          {REGION_CONFIG.map((r, i) => {
            const isCurrent = r.id === currentRegion;
            return (
              <button
                key={r.id}
                onClick={() => travel(r.id)}
                disabled={isCurrent}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 18px',
                  background: 'none',
                  border: 'none',
                  borderTop: i > 0 ? '1px solid #EEE1CB' : 'none',
                  cursor: isCurrent ? 'default' : 'pointer',
                  fontFamily: 'var(--font-caveat, cursive)',
                  fontWeight: 700,
                  fontSize: 16,
                  color: isCurrent ? '#8a7a63' : '#3F3226',
                }}
                onMouseEnter={(e) => { if (!isCurrent) e.currentTarget.style.background = '#F0E6D2'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
              >
                {isCurrent ? '✓ ' : '✈ '}{r.label}
              </button>
            );
          })}
        </div>
      )}

      {/* pill trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={transitioning}
        style={{
          background: '#FBF5EA',
          border: `1.5px solid ${open ? '#3F3226' : '#E7D8BE'}`,
          borderRadius: 999,
          padding: '7px 18px',
          cursor: transitioning ? 'wait' : 'pointer',
          boxShadow: '0 2px 8px rgba(63,50,38,0.14)',
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          transition: 'opacity 0.15s, border-color 0.2s',
        }}
        onMouseEnter={(e) => { if (!transitioning) e.currentTarget.style.opacity = '0.8'; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
      >
        <span style={{ fontSize: 12, color: '#8a7a63' }}>✈</span>
        <span style={{
          fontFamily: 'var(--font-caveat, cursive)',
          fontWeight: 700,
          fontSize: 16,
          color: '#3F3226',
        }}>
          {currentLabel}
        </span>
        <span style={{ fontSize: 9, color: '#8a7a63', marginLeft: 1 }}>{open ? '▴' : '▾'}</span>
      </button>
    </div>
  );
}
