'use client';

import { useRef, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { travelTo } from '@/lib/travel';
import { useDismiss } from '@/hooks/useDismiss';

const REGION_CONFIG = [
  { id: 'phnom-penh', label: 'Phnom Penh' },
  { id: 'melbourne', label: 'Melbourne' },
] as const;

export default function RegionSwitcher() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useDismiss(containerRef, () => setOpen(false), open);

  const currentRegion = useGameStore((s) => s.currentRegion);
  const transitioning = useGameStore((s) => s.transitioning);

  const currentLabel = REGION_CONFIG.find((r) => r.id === currentRegion)?.label ?? currentRegion;

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
      {/* dropdown — rendered above the button */}
      {open && (
        <div style={{
          position: 'absolute',
          bottom: 'calc(100% + 6px)',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#FAF3E8',
          border: '1px solid #E8DCC8',
          borderRadius: 10,
          boxShadow: '0 4px 16px rgba(58,46,38,0.16)',
          overflow: 'hidden',
          minWidth: 150,
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
                  padding: '9px 16px',
                  background: 'none',
                  border: 'none',
                  borderTop: i > 0 ? '1px solid #E8DCC8' : 'none',
                  cursor: isCurrent ? 'default' : 'pointer',
                  fontSize: 14,
                  fontFamily: 'var(--font-fraunces, serif)',
                  color: isCurrent ? '#6B5D4F' : '#3A2E26',
                  opacity: isCurrent ? 0.6 : 1,
                }}
                onMouseEnter={(e) => { if (!isCurrent) e.currentTarget.style.background = '#F0E8D8'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
              >
                {isCurrent ? '✓ ' : ''}{r.label}
              </button>
            );
          })}
        </div>
      )}

      {/* trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={transitioning}
        style={{
          background: '#FAF3E8',
          border: `1px solid ${open ? '#6B5D4F' : '#E8DCC8'}`,
          borderRadius: 10,
          padding: '6px 14px',
          cursor: transitioning ? 'wait' : 'pointer',
          boxShadow: '0 1px 6px rgba(58,46,38,0.12)',
          transition: 'opacity 0.15s, border-color 0.15s',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
        onMouseEnter={(e) => { if (!transitioning) e.currentTarget.style.opacity = '0.8'; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
      >
        <span style={{ fontSize: 11, color: '#6B5D4F' }}>✈</span>
        <span style={{ fontSize: 13, color: '#3A2E26', fontFamily: 'var(--font-fraunces, serif)' }}>{currentLabel}</span>
        <span style={{ fontSize: 9, color: '#6B5D4F', marginLeft: 2 }}>{open ? '▴' : '▾'}</span>
      </button>
    </div>
  );
}
