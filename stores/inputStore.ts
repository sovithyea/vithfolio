import { create } from 'zustand';

type InputState = {
  vector: { x: number; y: number };
  setVector: (x: number, y: number) => void;
};

export const useInputStore = create<InputState>((set) => ({
  vector: { x: 0, y: 0 },
  setVector: (x, y) => set({ vector: { x, y } }),
}));
