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

// Label (no rotation) above a cream-ring + accent-circle + up-arrow SVG (rotated to bearing).
function makeArrowEl(b: number, color: string, label: string): HTMLDivElement {
  const cx   = window.innerWidth  / 2;
  const cy   = window.innerHeight / 2;
  const RING = 108;
  const rad  = (b - 90) * Math.PI / 180;
  const x    = cx + RING * Math.cos(rad);
  const y    = cy + RING * Math.sin(rad);

  // Outer wrapper: positioned, NOT rotated — label stays readable.
  const el = document.createElement('div');
  el.style.cssText =
    `position:fixed;left:${x}px;top:${y}px;` +
    `transform:translate(-50%,-50%);` +
    `z-index:15;pointer-events:none;` +
    `display:flex;flex-direction:column;align-items:center;gap:4px;`;

  // Project title pill — matches pin label style, always horizontal.
  const lbl = document.createElement('span');
  lbl.textContent = label;
  lbl.style.cssText =
    `font-family:var(--font-caveat,cursive);font-weight:700;font-size:12px;` +
    `color:#3F3226;background:#FBF5EA;` +
    `padding:1px 8px 2px;border-radius:8px;border:1px solid #E7D8BE;` +
    `white-space:nowrap;line-height:1.4;` +
    `box-shadow:0 1px 4px rgba(63,50,38,0.12);`;

  // SVG wrapper rotates independently so arrow points at off-screen marker.
  const svgWrap = document.createElement('div');
  svgWrap.style.cssText =
    `transform:rotate(${b}deg);line-height:0;` +
    `filter:drop-shadow(0 2px 6px rgba(63,50,38,0.3));`;
  svgWrap.innerHTML =
    `<svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">` +
      `<circle cx="14" cy="14" r="13" fill="#FBF5EA"/>` +
      `<circle cx="14" cy="14" r="10" fill="${color}"/>` +
      `<path d="M14 8 L20 16 L16 16 L16 20 L12 20 L12 16 L8 16 Z" fill="#FBF5EA"/>` +
    `</svg>`;

  el.appendChild(lbl);
  el.appendChild(svgWrap);
  return el;
}

export default function DirectionArrows() {
  const currentRegion = useGameStore((s) => s.currentRegion);
  const storeMarkers  = useGameStore((s) => s.markers[currentRegion] ?? []);
  const activeProject = useGameStore((s) => s.activeProject);
  const containerRef  = useRef<HTMLDivElement>(null);

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
        const offScreen =
          px.x < MARGIN || px.x > vw - MARGIN ||
          px.y < MARGIN || px.y > vh - MARGIN;
        if (!offScreen) continue;

        const b  = bearing(center.lng, center.lat, p.lng, p.lat);
        const el = makeArrowEl(b, region.accentColor, p.title);
        el.setAttribute('data-arrow', p.id);
        container.appendChild(el);
      }
    };

    map.on('move',    update);
    map.on('moveend', update);
    update();

    return () => {
      map.off('move',    update);
      map.off('moveend', update);
    };
  }, [currentRegion, storeMarkers, activeProject]);

  return <div ref={containerRef} className="fixed inset-0" style={{ zIndex: 15, pointerEvents: 'none' }} />;
}
