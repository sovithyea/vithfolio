import { useGameStore } from '@/stores/gameStore';

let timer: ReturnType<typeof setTimeout> | null = null;

export function cancelHoverClear() {
  if (timer !== null) { clearTimeout(timer); timer = null; }
}

export function scheduleHoverClear(delay = 600) {
  cancelHoverClear();
  timer = setTimeout(() => {
    useGameStore.getState().setHoveredProject(null);
    timer = null;
  }, delay);
}
