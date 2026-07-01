'use client';

import { useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { REGIONS, getStyleUrl } from '@/lib/regions';
import type { ProjectMarker } from '@/lib/regions';
import { useKeyboardInput } from '@/hooks/useKeyboardInput';
import { useGameLoop } from '@/hooks/useGameLoop';
import { useMarkers } from '@/hooks/useMarkers';
import { useGameStore } from '@/stores/gameStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { setMapInstance } from '@/lib/mapInstance';
import { cancelHoverClear, scheduleHoverClear } from '@/lib/hoverTimer';

function createMarkerElement(p: ProjectMarker, color: string, map: maplibregl.Map): HTMLDivElement {
  const outer = document.createElement('div');
  outer.setAttribute('data-project-id', p.id);
  // flex column: label tag on top, teardrop pin below
  outer.style.cssText = 'display:flex;flex-direction:column;align-items:center;cursor:pointer;gap:3px;';

  const label = document.createElement('div');
  label.style.cssText =
    'font-family:var(--font-caveat,cursive);font-weight:700;font-size:15px;' +
    'color:#3F3226;background:#FBF5EA;' +
    'padding:1px 8px 2px;border-radius:8px;border:1px solid #E7D8BE;' +
    'white-space:nowrap;line-height:1.4;' +
    'box-shadow:0 1px 4px rgba(63,50,38,0.12);' +
    'transition:transform 0.15s;';
  label.textContent = p.title;
  outer.appendChild(label);

  // pinWrapper bobs the pin assembly up/down — separate from outer so MapLibre's
  // transform on outer is never touched.
  const pinWrapper = document.createElement('div');
  pinWrapper.style.cssText = 'line-height:0;animation:warm-bob-marker 2.4s ease-in-out infinite;';

  // pin: holds the SVG teardrop; receives hover scale + proximity pulse animation.
  // anchor:'bottom' on the Marker means the bottom of outer (= SVG tip) sits on the coordinate.
  const pin = document.createElement('div');
  pin.setAttribute('data-teardrop', '');
  pin.style.cssText =
    'line-height:0;transition:transform 0.15s;' +
    'filter:drop-shadow(0 4px 8px rgba(63,50,38,0.35));';
  // Two-tone pin: cream outer shell + accent inner fill. viewBox 26×28 → 22×24px rendered.
  // outer tip at viewBox y=28 = element bottom; anchor:'bottom' pins tip to the coordinate.
  pin.innerHTML =
    `<svg width="45" height="55" viewBox="0 0 26 28" xmlns="http://www.w3.org/2000/svg">` +
      `<path d="M13 1C7.5 1 1 7.5 1 13C1 20 7 27 13 28C19 27 25 20 25 13C25 7.5 18.5 1 13 1Z" fill="#FBF5EA"/>` +
      `<path d="M13 4.5C8.6 4.5 4.5 8.6 4.5 13C4.5 19 8.5 24.5 13 25.5C17.5 24.5 21.5 19 21.5 13C21.5 8.6 17.4 4.5 13 4.5Z" fill="${color}"/>` +
    `</svg>`;

  pinWrapper.appendChild(pin);
  outer.appendChild(pinWrapper);

  outer.addEventListener('mouseenter', () => {
    cancelHoverClear();
    label.style.transform = 'scale(1.06) translateY(-1px)';
    pinWrapper.style.animationPlayState = 'paused';
    pin.style.transform = 'scale(1.08)';
    useGameStore.getState().setHoveredProject(p.id);
  });
  outer.addEventListener('mouseleave', () => {
    label.style.transform = '';
    pin.style.transform = '';
    pinWrapper.style.animationPlayState = 'running';
    scheduleHoverClear();
  });

  outer.addEventListener('click', () => {
    const markerPx = map.project([p.lng, p.lat]);
    const center   = map.project(map.getCenter());
    if (Math.hypot(center.x - markerPx.x, center.y - markerPx.y) < 40) {
      useGameStore.getState().setActiveProject(p.id);
    }
  });

  return outer;
}

export default function MapCanvas() {
  const [map, setMap] = useState<maplibregl.Map | null>(null);
  const currentRegion = useGameStore((s) => s.currentRegion);
  const storeMarkers  = useGameStore((s) => s.markers[currentRegion] ?? []);
  const editMode      = useGameStore((s) => s.editMode);
  const zoom          = useSettingsStore((s) => s.zoom);
  const activeProject = useGameStore((s) => s.activeProject);

  const containerRef = (el: HTMLDivElement | null) => {
    if (!el || map) return;
    const region       = REGIONS['phnom-penh'];
    const initialStyle = useSettingsStore.getState().mapStyles['phnom-penh'] ?? region.styleId;
    const m = new maplibregl.Map({
      container: el,
      style: getStyleUrl(initialStyle),
      center: region.center,
      zoom,
      dragPan: false,
      scrollZoom: false,
      boxZoom: false,
      dragRotate: false,
      keyboard: false,
      doubleClickZoom: false,
      touchZoomRotate: false,
    });
    m.setMaxBounds(region.bounds);
    m.on('load', () => { setMap(m); });
  };

  useEffect(() => {
    if (!map) return;
    setMapInstance(map);
    return () => { setMapInstance(null); map.remove(); };
  }, [map]);

  useEffect(() => {
    if (!map) return;
    map.setZoom(zoom);
  }, [map, zoom]);

  useEffect(() => {
    if (!map) return;
    const region  = REGIONS[currentRegion];
    const markers = storeMarkers.map((p) => {
      const el = createMarkerElement(p, region.accentColor, map);
      return new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([p.lng, p.lat])
        .addTo(map);
    });
    return () => markers.forEach((m) => m.remove());
  }, [map, currentRegion, storeMarkers]);

  // pulse the active marker's teardrop
  useEffect(() => {
    document.querySelectorAll<HTMLElement>('[data-teardrop]').forEach((el) => {
      const id = el.closest('[data-project-id]')?.getAttribute('data-project-id');
      el.style.animation =
        id === activeProject && activeProject !== null
          ? 'warm-pulse 1.6s ease-out infinite'
          : '';
    });
  }, [activeProject]);

  useEffect(() => {
    if (!map || !editMode) return;
    const onClick = (e: maplibregl.MapMouseEvent) => {
      useGameStore.getState().setPendingCoords({ lng: e.lngLat.lng, lat: e.lngLat.lat });
    };
    map.on('click', onClick);
    return () => { map.off('click', onClick); };
  }, [map, editMode]);

  useMarkers();
  useKeyboardInput();
  useGameLoop(map);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        cursor: editMode ? 'crosshair' : 'default',
        filter: 'saturate(0.92) sepia(0.08) brightness(1.02)',
      }}
    />
  );
}
