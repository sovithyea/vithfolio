'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';

export default function ProjectPanel() {
  const expandedProject    = useGameStore((s) => s.expandedProject);
  const currentRegion      = useGameStore((s) => s.currentRegion);
  const markers            = useGameStore((s) => s.markers[currentRegion] ?? []);
  const setExpandedProject = useGameStore((s) => s.setExpandedProject);

  const project = expandedProject ? markers.find((p) => p.id === expandedProject) : null;

  return (
    <AnimatePresence>
      {project && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-30"
            style={{ background: 'rgba(63,50,38,0.35)' }}
            onClick={() => setExpandedProject(null)}
          />
          <motion.div
            key={project.id}
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 h-full w-full sm:w-96 z-40 overflow-y-auto flex flex-col"
            style={{ background: '#FBF5EA', borderLeft: '1px solid #E7D8BE' }}
          >
            {/* header */}
            <div style={{ padding: '20px 24px 18px', borderBottom: '1px solid #EEE1CB' }}>
              <button
                onClick={() => setExpandedProject(null)}
                style={{
                  background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                  fontFamily: 'var(--font-caveat, cursive)', fontWeight: 600, fontSize: 15,
                  color: '#5b4c3a', marginBottom: 12, display: 'block',
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.6')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                ← back to map
              </button>
              <p style={{
                margin: '0 0 3px',
                fontFamily: 'var(--font-caveat, cursive)', fontWeight: 700, fontSize: 14,
                color: '#C96A43', letterSpacing: '0.04em', textTransform: 'uppercase',
              }}>
                Project
              </p>
              <h2
                className="font-serif"
                style={{ margin: 0, fontSize: 26, color: '#3F3226', lineHeight: 1.2 }}
              >
                {project.title}
              </h2>
            </div>

            {/* body */}
            <div style={{ padding: '20px 24px 40px', flex: 1 }}>
              {project.images.length > 0 && (
                <div className="flex flex-col gap-2 mb-5">
                  {project.images.map((src) => (
                    <img
                      key={src} src={src} alt={project.title}
                      className="rounded-xl w-full"
                      style={{ border: '1px solid #E7D8BE' }}
                    />
                  ))}
                </div>
              )}
              <p className="font-serif text-sm leading-relaxed mb-6" style={{ color: '#3F3226' }}>
                {project.description}
              </p>
              {project.links.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {project.links.map((link) => (
                    <a
                      key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                      className="transition-opacity hover:opacity-70"
                      style={{
                        display: 'inline-block',
                        border: '1.5px solid #C96A43', color: '#C96A43',
                        fontFamily: 'var(--font-caveat, cursive)', fontWeight: 700, fontSize: 16,
                        padding: '4px 14px', borderRadius: 999, textDecoration: 'none',
                      }}
                    >
                      {link.label} ↗
                    </a>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
