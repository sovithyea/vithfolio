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
  // outer: MapLibre owns transform:translate here — never set transform on outer.
  // width/height must match inner so MapLibre computes the anchor box correctly.
  const outer = document.createElement('div');
  outer.style.cssText = 'width:10px;height:10px;position:relative;';

  const inner = document.createElement('div');
  inner.style.cssText =
    `width:10px;height:10px;border-radius:50%;background:${color};` +
    `box-shadow:0 0 0 2px ${color}40,0 0 10px ${color}70;` +
    `cursor:pointer;transition:transform 0.15s;`;
  outer.appendChild(inner);

  outer.addEventListener('mouseenter', () => {
    cancelHoverClear();
    inner.style.transform = 'scale(1.08)';
    useGameStore.getState().setHoveredProject(p.id);
  });
  outer.addEventListener('mouseleave', () => {
    inner.style.transform = 'scale(1)';
    scheduleHoverClear();
  });

  // proximity-gated click: only opens callout if avatar is within 40px
  outer.addEventListener('click', () => {
    const markerPx = map.project([p.lng, p.lat]);
    const center = map.project(map.getCenter());
    if (Math.hypot(center.x - markerPx.x, center.y - markerPx.y) < 40) {
      useGameStore.getState().setActiveProject(p.id);
    }
  });

  return outer;
}

export default function MapCanvas() {
  const [map, setMap] = useState<maplibregl.Map | null>(null);
  const currentRegion = useGameStore((s) => s.currentRegion);
  const storeMarkers = useGameStore((s) => s.markers[currentRegion] ?? []);
  const editMode = useGameStore((s) => s.editMode);
  const zoom = useSettingsStore((s) => s.zoom);

  const containerRef = (el: HTMLDivElement | null) => {
    if (!el || map) return;
    const region = REGIONS['phnom-penh'];
    const m = new maplibregl.Map({
      container: el,
      style: getStyleUrl(region.styleId),
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
    const region = REGIONS[currentRegion];
    const markers = storeMarkers.map((p) => {
      const el = createMarkerElement(p, region.accentColor, map);
      return new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([p.lng, p.lat])
        .addTo(map);
    });
    return () => markers.forEach((m) => m.remove());
  }, [map, currentRegion, storeMarkers]);

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
      style={{ position: 'fixed', inset: 0, cursor: editMode ? 'crosshair' : 'default' }}
    />
  );
}
