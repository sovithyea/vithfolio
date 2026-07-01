'use client';

import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { travelTo, panToMarker } from '@/lib/travel';
import { useMobile } from '@/hooks/useMobile';

const REGION_LABELS: Record<string, string> = {
  'phnom-penh': 'Phnom Penh',
  melbourne:    'Melbourne',
};

const OTHER_REGION: Record<string, string> = {
  'phnom-penh': 'melbourne',
  melbourne:    'phnom-penh',
};

export default function MobileBottomSheet() {
  const mobile = useMobile();
  const [cityMenuOpen, setCityMenuOpen] = useState(false);

  const currentRegion = useGameStore((s) => s.currentRegion);
  const transitioning = useGameStore((s) => s.transitioning);
  const markers       = useGameStore((s) => s.markers[currentRegion] ?? []);

  if (!mobile) return null;

  const switchCity = () => {
    if (transitioning) return;
    const target = OTHER_REGION[currentRegion];
    setCityMenuOpen(false);
    useGameStore.getState().setTransitioning(true);
    travelTo(target);
  };

  return (
    <div style={{
      position: 'fixed',
      left: 10,
      right: 10,
      bottom: 26,
      background: '#FBF5EA',
      border: '1.5px solid #E7D8BE',
      borderRadius: 18,
      padding: '12px 16px 14px',
      zIndex: 40,
      boxShadow: '0 10px 24px rgba(63,50,38,0.22)',
    }}>
      {/* drag handle */}
      <div style={{ width: 34, height: 4, background: '#E7D8BE', borderRadius: 2, margin: '0 auto 10px' }} />

      {/* city row */}
      <div
        onClick={() => setCityMenuOpen((o) => !o)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
      >
        <span style={{
          fontFamily: 'var(--font-caveat, cursive)',
          fontWeight: 700,
          color: '#C96A43',
          fontSize: 17,
        }}>
          {REGION_LABELS[currentRegion]}
        </span>
        <span style={{ fontSize: 12, color: '#8a7a63' }}>switch ▾</span>
      </div>

      {/* switch option */}
      {cityMenuOpen && (
        <button
          onClick={switchCity}
          disabled={transitioning}
          style={{
            display: 'block',
            width: '100%',
            textAlign: 'left',
            background: 'none',
            border: 'none',
            borderTop: '1px solid #EEE1CB',
            marginTop: 8,
            padding: '8px 0',
            fontSize: 13,
            color: '#3F3226',
            cursor: transitioning ? 'wait' : 'pointer',
            fontFamily: 'var(--font-lora, serif)',
          }}
        >
          ✈ {REGION_LABELS[OTHER_REGION[currentRegion]]}
        </button>
      )}

      {/* places list */}
      <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column' }}>
        {markers.length === 0 ? (
          <p style={{ margin: 0, fontSize: 12, color: '#8a7a63', fontStyle: 'italic' }}>
            nothing here yet
          </p>
        ) : (
          markers.map((m) => (
            <button
              key={m.id}
              onClick={() => panToMarker(m.lng, m.lat)}
              style={{
                background: 'none',
                border: 'none',
                padding: '4px 0',
                textAlign: 'left',
                fontSize: 13,
                color: '#3F3226',
                cursor: 'pointer',
                fontFamily: 'var(--font-lora, serif)',
              }}
            >
              ● {m.title}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
