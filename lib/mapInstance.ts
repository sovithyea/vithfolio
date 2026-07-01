import type { Map } from 'maplibre-gl';

let instance: Map | null = null;

export function setMapInstance(m: Map | null) { instance = m; }
export function getMapInstance() { return instance; }
