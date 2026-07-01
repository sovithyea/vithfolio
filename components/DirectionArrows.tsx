'use client';

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { REGIONS } from '@/lib/regions';
import { getMapInstance } from '@/lib/mapInstance';

function bearing(fromLng: number, fromLat: number, toLng: number, toLat: number): number {
  const toRad = (d: number) => d * Math.PI / 180;
  const lat1 = toRad(fromLat), lat2 = toRad(toLat);
  const dLng = toRad(toLng - fromLng);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

function makeArrowEl(b: number, color: string, label: string): HTMLDivElement {
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  const RING = 88;
  const rad = (b - 90) * Math.PI / 180;
  const x = cx + RING * Math.cos(rad);
  const y = cy + RING * Math.sin(rad);

  const el = document.createElement('div');
  el.style.cssText = [
    `position:fixed;left:${x}px;top:${y}px;`,
    `transform:translate(-50%,-50%) rotate(${b}deg);`,
    `z-index:15;display:flex;flex-direction:column;align-items:center;gap:2px;`,
    `pointer-events:none;`,
  ].join('');

  const arrow = document.createElement('div');
  arrow.style.cssText = `width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:10px solid ${color};opacity:0.85;`;

  const lbl = document.createElement('span');
  lbl.textContent = label;
  lbl.style.cssText = `font-size:9px;font-family:monospace;color:${color};background:rgba(250,243,232,0.92);padding:1px 4px;border-radius:2px;white-space:nowrap;transform:rotate(-${b}deg);`;

  el.appendChild(arrow);
  el.appendChild(lbl);
  return el;
}

export default function DirectionArrows() {
  const currentRegion = useGameStore((s) => s.currentRegion);
  const storeMarkers = useGameStore((s) => s.markers[currentRegion] ?? []);
  const activeProject = useGameStore((s) => s.activeProject);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const map = getMapInstance();
    if (!map) return;

    const update = () => {
      const container = containerRef.current;
      if (!container) return;

      const center = map.getCenter();
      const region = REGIONS[currentRegion];
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const MARGIN = 40;

      container.querySelectorAll('[data-arrow]').forEach((el) => el.remove());

      for (const p of storeMarkers) {
        if (p.id === activeProject) continue;
        const px = map.project([p.lng, p.lat]);
        const offScreen = px.x < MARGIN || px.x > vw - MARGIN || px.y < MARGIN || px.y > vh - MARGIN;
        if (!offScreen) continue;

        const b = bearing(center.lng, center.lat, p.lng, p.lat);
        const el = makeArrowEl(b, region.accentColor, p.title);
        el.setAttribute('data-arrow', p.id);
        container.appendChild(el);
      }
    };

    map.on('move', update);
    map.on('moveend', update);
    update();

    return () => {
      map.off('move', update);
      map.off('moveend', update);
    };
  }, [currentRegion, storeMarkers, activeProject]);

  return <div ref={containerRef} className="fixed inset-0" style={{ zIndex: 15, pointerEvents: 'none' }} />;
}
