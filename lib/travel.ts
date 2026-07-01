import { getMapInstance } from './mapInstance';
import { useGameStore } from '@/stores/gameStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { REGIONS, getStyleUrl } from './regions';

export type RegionId = 'phnom-penh' | 'melbourne';

export function travelTo(targetId: string) {
  const map = getMapInstance();
  if (!map) return;
  const target = REGIONS[targetId];
  map.once('styledata', () => {
    map.setMaxBounds(null);
    map.setMaxBounds(target.bounds);
    map.jumpTo({ center: target.center, zoom: useSettingsStore.getState().zoom });
    useGameStore.getState().setTransitioning(false);
  });
  map.setStyle(getStyleUrl(target.styleId));
  useGameStore.getState().setRegion(targetId);
}

export function panToMarker(lng: number, lat: number) {
  getMapInstance()?.jumpTo({ center: [lng, lat] });
}
