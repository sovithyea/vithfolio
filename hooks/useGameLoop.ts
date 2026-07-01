'use client';

import { useEffect } from 'react';
import type { Map } from 'maplibre-gl';
import { useInputStore } from '@/stores/inputStore';
import { useGameStore } from '@/stores/gameStore';
import { useSettingsStore } from '@/stores/settingsStore';

function checkProximity(map: Map) {
  const { currentRegion, markers } = useGameStore.getState();
  const regionMarkers = markers[currentRegion] ?? [];
  const center = map.project(map.getCenter());
  for (const p of regionMarkers) {
    const px = map.project([p.lng, p.lat]);
    if (Math.hypot(center.x - px.x, center.y - px.y) < 40) {
      useGameStore.getState().setActiveProject(p.id);
      return;
    }
  }
  useGameStore.getState().setActiveProject(null);
}

export function useGameLoop(map: Map | null) {
  useEffect(() => {
    if (!map) return;
    let raf: number;
    const tick = () => {
      const { x, y } = useInputStore.getState().vector;
      if (x || y) {
        const speed = useSettingsStore.getState().speed;
        map.panBy([x * speed, y * speed], { duration: 0 });
        useGameStore.getState().setFacing(x, y);
      }
      checkProximity(map);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [map]);
}
