'use client';

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { REGIONS } from '@/lib/regions';
import { getMapInstance } from '@/lib/mapInstance';
import type { ProjectMarker } from '@/lib/regions';

function bearing(fromLng: number, fromLat: number, toLng: number, toLat: number): number {
  const toRad = (d: number) => d * Math.PI / 180;
  const lat1 = toRad(fromLat), lat2 = toRad(toLat);
  const dLng = toRad(toLng - fromLng);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

type ArrowEl = { outer: HTMLDivElement; svgWrap: HTMLDivElement };

function createArrowEl(color: string, label: string): ArrowEl {
  const outer = document.createElement('div');
  outer.style.cssText =
    'position:fixed;left:0;top:0;transform:translate(-50%,-50%);' +
    'z-index:15;pointer-events:none;' +
    'display:flex;flex-direction:column;align-items:center;gap:4px;';

  const lbl = document.createElement('span');
  lbl.textContent = label;
  lbl.style.cssText =
    'font-family:var(--font-caveat,cursive);font-weight:700;font-size:12px;' +
    'color:#3F3226;background:#FBF5EA;' +
    'padding:1px 8px 2px;border-radius:8px;border:1px solid #E7D8BE;' +
    'white-space:nowrap;line-height:1.4;' +
    'box-shadow:0 1px 4px rgba(63,50,38,0.12);';

  const svgWrap = document.createElement('div');
  svgWrap.style.cssText = 'line-height:0;filter:drop-shadow(0 2px 6px rgba(63,50,38,0.3));';
  svgWrap.innerHTML =
    '<svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">' +
      `<circle cx="14" cy="14" r="13" fill="#FBF5EA"/>` +
      `<circle cx="14" cy="14" r="10" fill="${color}"/>` +
      '<path d="M14 8 L20 16 L16 16 L16 20 L12 20 L12 16 L8 16 Z" fill="#FBF5EA"/>' +
    '</svg>';

  outer.appendChild(lbl);
  outer.appendChild(svgWrap);
  return { outer, svgWrap };
}

export default function DirectionArrows() {
  const mapReady      = useGameStore((s) => s.mapReady);
  const containerRef  = useRef<HTMLDivElement>(null);
  const arrowsRef     = useRef<Map<string, ArrowEl>>(new Map());

  // Keep latest game state in refs so the rAF loop always reads fresh values
  // without restarting the loop on every state change.
  const markersRef       = useRef<ProjectMarker[]>([]);
  const activeProjectRef = useRef<string | null>(null);
  const regionRef        = useRef<string>('phnom-penh');

  const currentRegion = useGameStore((s) => s.currentRegion);
  const storeMarkers  = useGameStore((s) => s.markers[currentRegion] ?? []);
  const activeProject = useGameStore((s) => s.activeProject);

  // Sync refs every render — zero overhead, no effect needed.
  markersRef.current       = storeMarkers;
  activeProjectRef.current = activeProject;
  regionRef.current        = currentRegion;

  // rAF loop: runs independently of map events, always in sync with the camera.
  useEffect(() => {
    if (!mapReady) return;

    const RING   = 108;
    const MARGIN = 40;

    let rafId: number;
    let lastLog = 0; // diagnostic — remove after confirming fix

    const tick = () => {
      // Read both the container and the map instance fresh every frame.
      // Capturing map once at effect-start causes stale project() values after
      // Strict Mode double-invoke (map.remove() freezes its internal transform).
      const container = containerRef.current;
      if (!container) { rafId = requestAnimationFrame(tick); return; }
      const map = getMapInstance();
      if (!map) { rafId = requestAnimationFrame(tick); return; }

      const markers       = markersRef.current;
      const activeProject = activeProjectRef.current;
      const region        = REGIONS[regionRef.current];
      const center        = map.getCenter();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const cx = vw / 2;
      const cy = vh / 2;

      const doLog = Date.now() - lastLog > 2000;
      if (doLog) lastLog = Date.now();

      const seen = new Set<string>();

      for (const p of markers) {
        if (p.id === activeProject) continue;

        const px = map.project([p.lng, p.lat]);
        const offScreen =
          px.x < MARGIN || px.x > vw - MARGIN ||
          px.y < MARGIN || px.y > vh - MARGIN;

        if (doLog) {
          console.log(
            `[DA] id=${p.id} px=(${px.x.toFixed(1)},${px.y.toFixed(1)}) ` +
            `viewport=${vw}x${vh} MARGIN=${MARGIN} offScreen=${offScreen}`
          );
        }

        if (!offScreen) {
          const existing = arrowsRef.current.get(p.id);
          if (existing) { existing.outer.remove(); arrowsRef.current.delete(p.id); }
          continue;
        }

        seen.add(p.id);
        const b   = bearing(center.lng, center.lat, p.lng, p.lat);
        const rad = (b - 90) * Math.PI / 180;
        const x   = cx + RING * Math.cos(rad);
        const y   = cy + RING * Math.sin(rad);

        if (doLog) {
          console.log(
            `[DA] → showing indicator id=${p.id} bearing=${b.toFixed(1)}° ` +
            `indicatorPos=(${x.toFixed(1)},${y.toFixed(1)}) center=(${cx},${cy}) RING=${RING}`
          );
        }

        const existing = arrowsRef.current.get(p.id);
        // isConnected guard: if Strict Mode cleanup removed the element from
        // the DOM but arrowsRef still holds the stale ref, recreate it.
        if (existing && existing.outer.isConnected) {
          existing.outer.style.left = `${x}px`;
          existing.outer.style.top  = `${y}px`;
          existing.svgWrap.style.transform = `rotate(${b}deg)`;
        } else {
          if (existing) arrowsRef.current.delete(p.id);
          const el = createArrowEl(region.accentColor, p.title);
          el.outer.style.left = `${x}px`;
          el.outer.style.top  = `${y}px`;
          el.svgWrap.style.transform = `rotate(${b}deg)`;
          container.appendChild(el.outer);
          arrowsRef.current.set(p.id, el);
        }
      }

      // Collect ids first to avoid mutating the Map while iterating it.
      const toRemove: string[] = [];
      for (const [id] of arrowsRef.current) {
        if (!seen.has(id)) toRemove.push(id);
      }
      for (const id of toRemove) {
        arrowsRef.current.get(id)?.outer.remove();
        arrowsRef.current.delete(id);
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      for (const [, el] of arrowsRef.current) el.outer.remove();
      arrowsRef.current.clear();
    };
  }, [mapReady]); // only restart when map becomes ready

  return <div ref={containerRef} className="fixed inset-0" style={{ zIndex: 15, pointerEvents: 'none' }} />;
}
