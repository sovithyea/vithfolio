'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/stores/gameStore';
import type { ProjectMarker } from '@/lib/regions';

export function useMarkers() {
  const setMarkers = useGameStore((s) => s.setMarkers);

  useEffect(() => {
    fetch('/api/markers')
      .then((r) => r.json())
      .then((data: Record<string, ProjectMarker[]>) => {
        Object.entries(data).forEach(([region, markers]) => {
          setMarkers(region, markers);
        });
      })
      .catch(() => {});
  }, [setMarkers]);
}
