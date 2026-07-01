import { getMapInstance } from './mapInstance';
import { useGameStore } from '@/stores/gameStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { REGIONS, getStyleUrl } from './regions';

export type RegionId = 'phnom-penh' | 'melbourne';

export function travelTo(targetId: string) {
  const map = getMapInstance();
  if (!map) return;
  const target = REGIONS[targetId];
  // respect persisted style choice for the target region
  const styleId = useSettingsStore.getState().mapStyles[targetId] ?? target.styleId;
  map.once('styledata', () => {
    map.setMaxBounds(null);
    map.setMaxBounds(target.bounds);
    map.jumpTo({ center: target.center, zoom: useSettingsStore.getState().zoom });
    useGameStore.getState().setTransitioning(false);
  });
  map.setStyle(getStyleUrl(styleId));
  useGameStore.getState().setRegion(targetId);
}

export function changeStyle(styleId: string) {
  const map = getMapInstance();
  if (!map) return;
  const { currentRegion } = useGameStore.getState();
  const region = REGIONS[currentRegion];
  map.once('styledata', () => {
    map.setMaxBounds(null);
    map.setMaxBounds(region.bounds);
  });
  map.setStyle(getStyleUrl(styleId));
  useSettingsStore.getState().setMapStyle(currentRegion, styleId);
}

export function panToMarker(lng: number, lat: number) {
  getMapInstance()?.jumpTo({ center: [lng, lat] });
}
