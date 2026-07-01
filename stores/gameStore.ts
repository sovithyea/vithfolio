import { create } from 'zustand';
import type { ProjectMarker } from '@/lib/regions';
import { REGIONS } from '@/lib/regions';

type GameState = {
  currentRegion: string;
  activeProject: string | null;
  hoveredProject: string | null;
  expandedProject: string | null;
  transitioning: boolean;
  facing: { x: number; y: number };
  editMode: boolean;
  mapReady: boolean;
  markers: Record<string, ProjectMarker[]>;
  pendingCoords: { lng: number; lat: number } | null;
  editingMarkerId: string | null;
  setRegion: (id: string) => void;
  setActiveProject: (id: string | null) => void;
  setHoveredProject: (id: string | null) => void;
  setExpandedProject: (id: string | null) => void;
  setTransitioning: (v: boolean) => void;
  setFacing: (x: number, y: number) => void;
  setEditMode: (v: boolean) => void;
  setMapReady: (v: boolean) => void;
  setMarkers: (region: string, markers: ProjectMarker[]) => void;
  setPendingCoords: (coords: { lng: number; lat: number } | null) => void;
  setEditingMarkerId: (id: string | null) => void;
};

export const useGameStore = create<GameState>((set) => ({
  currentRegion: 'phnom-penh',
  activeProject: null,
  hoveredProject: null,
  expandedProject: null,
  transitioning: false,
  facing: { x: 0, y: 1 },
  editMode: false,
  mapReady: false,
  markers: {
    'phnom-penh': REGIONS['phnom-penh'].projects,
    melbourne: REGIONS['melbourne'].projects,
  },
  pendingCoords: null,
  editingMarkerId: null,
  setRegion: (id) => set({ currentRegion: id }),
  setActiveProject: (id) => set({ activeProject: id }),
  setHoveredProject: (id) => set({ hoveredProject: id }),
  setExpandedProject: (id) => set({ expandedProject: id }),
  setTransitioning: (v) => set({ transitioning: v }),
  setFacing: (x, y) =>
    set((s) => ({ facing: x || y ? { x, y } : s.facing })),
  setEditMode: (v) =>
    set({ editMode: v, pendingCoords: null, editingMarkerId: null }),
  setMapReady: (v) => set({ mapReady: v }),
  setMarkers: (region, markers) =>
    set((s) => ({ markers: { ...s.markers, [region]: markers } })),
  setPendingCoords: (coords) =>
    set({ pendingCoords: coords, editingMarkerId: null }),
  setEditingMarkerId: (id) =>
    set({ editingMarkerId: id, pendingCoords: null }),
}));
