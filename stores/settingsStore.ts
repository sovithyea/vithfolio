import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type SettingsState = {
  speed: number;
  zoom: number;
  visitedMarkers: string[];
  setSpeed: (v: number) => void;
  setZoom: (v: number) => void;
  markVisited: (id: string) => void;
  toggleVisited: (id: string) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      speed: 10,
      zoom: 15,
      visitedMarkers: [],
      setSpeed: (v) => set({ speed: v }),
      setZoom: (v) => set({ zoom: v }),
      markVisited: (id) =>
        set((s) => ({
          visitedMarkers: s.visitedMarkers.includes(id)
            ? s.visitedMarkers
            : [...s.visitedMarkers, id],
        })),
      toggleVisited: (id) =>
        set((s) => ({
          visitedMarkers: s.visitedMarkers.includes(id)
            ? s.visitedMarkers.filter((v) => v !== id)
            : [...s.visitedMarkers, id],
        })),
    }),
    { name: 'vithfolio-settings' }
  )
);
