'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { cancelHoverClear, scheduleHoverClear } from '@/lib/hoverTimer';
import { getMapInstance } from '@/lib/mapInstance';

function useMarkerScreenPosition(lng: number | undefined, lat: number | undefined) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const map = getMapInstance();
    if (!map || lng === undefined || lat === undefined) {
      setPos(null);
      return;
    }

    const update = () => {
      const point = map.project([lng, lat]);
      if (point && Number.isFinite(point.x) && Number.isFinite(point.y)) {
        setPos({ x: point.x, y: point.y });
      } else {
        setPos(null);
      }
    };

    update();
    map.on('move', update);
    return () => { map.off('move', update); };
  }, [lng, lat]);

  return pos;
}

export default function ProjectCallout() {
  const activeProject    = useGameStore((s) => s.activeProject);
  const hoveredProject   = useGameStore((s) => s.hoveredProject);
  const currentRegion    = useGameStore((s) => s.currentRegion);
  const markers          = useGameStore((s) => s.markers[currentRegion] ?? []);
  const setExpandedProject = useGameStore((s) => s.setExpandedProject);

  const visibleId = activeProject ?? hoveredProject;
  const project   = visibleId ? markers.find((p) => p.id === visibleId) : null;
  const screenPos = useMarkerScreenPosition(project?.lng, project?.lat);

  return (
    <AnimatePresence>
      {project && screenPos && (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="fixed z-20 w-56"
          style={{ top: screenPos.y - 100, left: screenPos.x + 30 }}
          onMouseEnter={cancelHoverClear}
          onMouseLeave={() => scheduleHoverClear()}
        >
          <div
            className="rounded-xl px-4 py-3"
            style={{
              background: '#FBF5EA',
              border: '1.5px dashed #C9B08A',
              boxShadow: '0 8px 20px rgba(63,50,38,0.18)',
              transform: 'rotate(-0.5deg)',
            }}
          >
            <h3 className="font-serif text-base mb-1 font-semibold" style={{ color: '#3F3226' }}>
              {project.title}
            </h3>
            <p className="text-xs leading-snug mb-3" style={{ color: '#5b4c3a' }}>
              {project.blurb}
            </p>
            <button
              onClick={() => setExpandedProject(project.id)}
              className="transition-opacity hover:opacity-70"
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                fontFamily: 'var(--font-caveat, cursive)',
                fontWeight: 700,
                fontSize: 16,
                color: '#C96A43',
              }}
            >
              Expand ↗
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
