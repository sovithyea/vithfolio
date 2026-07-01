'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';

export default function ProjectPanel() {
  const expandedProject = useGameStore((s) => s.expandedProject);
  const currentRegion = useGameStore((s) => s.currentRegion);
  const markers = useGameStore((s) => s.markers[currentRegion] ?? []);
  const setExpandedProject = useGameStore((s) => s.setExpandedProject);

  const project = expandedProject ? markers.find((p) => p.id === expandedProject) : null;

  return (
    <AnimatePresence>
      {project && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-30"
            style={{ background: 'rgba(58,46,38,0.35)' }}
            onClick={() => setExpandedProject(null)}
          />
          <motion.div
            key={project.id}
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 h-full w-full sm:w-96 z-40 p-6 overflow-y-auto flex flex-col"
            style={{ background: '#FAF3E8', borderLeft: '1px solid #E8DCC8' }}
          >
            <button
              onClick={() => setExpandedProject(null)}
              className="text-sm mb-6 self-start transition-opacity hover:opacity-70"
              style={{ color: '#6B5D4F' }}
            >← back to map</button>
            <p className="text-xs uppercase tracking-wide mb-1" style={{ color: '#C97A4A' }}>Project</p>
            <h2 className="font-serif text-3xl mb-4" style={{ color: '#3A2E26' }}>{project.title}</h2>
            {project.images.length > 0 && (
              <div className="flex flex-col gap-2 mb-4">
                {project.images.map((src) => (
                  <img key={src} src={src} alt={project.title} className="rounded-lg w-full" style={{ border: '1px solid #E8DCC8' }} />
                ))}
              </div>
            )}
            <p className="text-sm leading-relaxed mb-5" style={{ color: '#3A2E26' }}>{project.description}</p>
            {project.links.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {project.links.map((link) => (
                  <a
                    key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                    className="text-xs px-3 py-1.5 rounded-full transition-opacity hover:opacity-70"
                    style={{ border: '1px solid #C97A4A', color: '#C97A4A' }}
                  >{link.label} ↗</a>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
