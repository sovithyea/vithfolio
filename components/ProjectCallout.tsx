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
  const activeProject = useGameStore((s) => s.activeProject);
  const hoveredProject = useGameStore((s) => s.hoveredProject);
  const currentRegion = useGameStore((s) => s.currentRegion);
  const markers = useGameStore((s) => s.markers[currentRegion] ?? []);
  const setExpandedProject = useGameStore((s) => s.setExpandedProject);

  const visibleId = activeProject ?? hoveredProject;
  const project = visibleId ? markers.find((p) => p.id === visibleId) : null;

  const screenPos = useMarkerScreenPosition(project?.lng, project?.lat);

  return (
    <AnimatePresence>
      {project && screenPos && (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, scale: 0.9, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 6 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="fixed z-20 w-64"
          style={{
            top: screenPos.y - 90,
            left: screenPos.x + 28,
          }}
          onMouseEnter={cancelHoverClear}
          onMouseLeave={scheduleHoverClear}
        >
          <div
            className="rounded-xl px-4 py-3"
            style={{ background: '#FAF3E8', border: '1px solid #E8DCC8', boxShadow: '0 4px 14px rgba(58,46,38,0.15)' }}
          >
            <h3 className="font-serif text-base mb-1" style={{ color: '#3A2E26' }}>{project.title}</h3>
            <p className="text-xs leading-snug mb-2" style={{ color: '#6B5D4F' }}>{project.blurb}</p>
            <button
              onClick={() => setExpandedProject(project.id)}
              className="text-xs font-medium flex items-center gap-1 transition-opacity hover:opacity-70"
              style={{ color: '#C97A4A' }}
            >
              Expand ↗
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
