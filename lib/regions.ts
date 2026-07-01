export type ProjectMarker = {
  id: string;
  lng: number;
  lat: number;
  title: string;
  blurb: string;
  description: string;
  images: string[];
  links: { label: string; url: string }[];
  district?: string;
};

export type Region = {
  id: 'phnom-penh' | 'melbourne';
  center: [number, number];
  zoom: number;
  bounds: [[number, number], [number, number]];
  styleId: string;
  accentColor: string;
  projects: ProjectMarker[];
};

export const MAP_STYLES: { id: string; label: string }[] = [
  { id: 'stamen_watercolor', label: 'Watercolor' },
  { id: 'stamen_toner', label: 'Toner' },
  { id: 'stamen_toner_lite', label: 'Toner Lite' },
  { id: 'stamen_terrain', label: 'Terrain' },
  { id: 'alidade_smooth', label: 'Smooth' },
  { id: 'alidade_smooth_dark', label: 'Smooth Dark' },
];

export function getStyleUrl(styleId: string): string {
  const key = process.env.NEXT_PUBLIC_STADIA_KEY;
  const base = `https://tiles.stadiamaps.com/styles/${styleId}.json`;
  return key ? `${base}?api_key=${key}` : base;
}

export const REGIONS: Record<string, Region> = {
  'phnom-penh': {
    id: 'phnom-penh',
    center: [104.9282, 11.5564],
    zoom: 15,
    // All 14 khan: Daun Penh → Sensok north, Dangkao south, Prek Pnov west, Chbar Ampov east
    bounds: [[104.79, 11.46], [104.99, 11.68]],
    styleId: 'stamen_watercolor',
    accentColor: '#C96A43',
    projects: [
      {
        id: 'foodraccoon',
        lng: 104.9165,
        lat: 11.5703,
        title: 'FoodRaccoon',
        blurb: 'Food discovery app for Phnom Penh. Map-based exploration with real-time restaurant data.',
        description:
          'FoodRaccoon is a full-stack food discovery platform built for Phnom Penh. ' +
          'Users browse restaurants on an interactive Mapbox map, filter by cuisine and distance, ' +
          'and save favourites via Supabase-backed auth. ' +
          'Built with Next.js App Router, Supabase, Mapbox GL JS, Tailwind v4, and Zustand.',
        images: [],
        links: [
          { label: 'GitHub', url: 'https://github.com/sovithyea' },
        ],
      },
    ],
  },
  melbourne: {
    id: 'melbourne',
    center: [144.9631, -37.8136],
    zoom: 15,
    // CBD + inner north (Brunswick) + east to Springvale — no far west
    bounds: [[144.90, -37.98], [145.18, -37.74]],
    styleId: 'stamen_watercolor',
    accentColor: '#14b8a6',
    projects: [],
  },
};
