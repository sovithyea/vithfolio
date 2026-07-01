'use client';

import { useEffect, useRef } from 'react';
import { useInputStore } from '@/stores/inputStore';
import { useGameStore } from '@/stores/gameStore';

export function useKeyboardInput() {
  const keys = useRef(new Set<string>());

  useEffect(() => {
    const update = () => {
      let x = 0, y = 0;
      if (keys.current.has('a') || keys.current.has('arrowleft')) x -= 1;
      if (keys.current.has('d') || keys.current.has('arrowright')) x += 1;
      if (keys.current.has('w') || keys.current.has('arrowup')) y -= 1;
      if (keys.current.has('s') || keys.current.has('arrowdown')) y += 1;
      useInputStore.getState().setVector(x, y);
    };

    const down = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toLowerCase();
      if (key === 'e') {
        useGameStore.getState().setEditMode(!useGameStore.getState().editMode);
        return;
      }
      keys.current.add(key);
      update();
    };

    const up = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      keys.current.delete(e.key.toLowerCase());
      update();
    };

    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);
}
