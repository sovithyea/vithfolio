'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInputStore } from '@/stores/inputStore';
import { useMobile } from '@/hooks/useMobile';

export default function OnboardingTooltip() {
  const [dismissed, setDismissed] = useState(false);
  const mobile = useMobile();

  useEffect(() => {
    if (localStorage.getItem('vith-explored')) {
      setDismissed(true);
      return;
    }
    return useInputStore.subscribe((state) => {
      if (state.vector.x !== 0 || state.vector.y !== 0) {
        setDismissed(true);
        localStorage.setItem('vith-explored', '1');
      }
    });
  }, []);

  const mobileStyle: React.CSSProperties = {
    position: 'fixed',
    top: '14%',
    left: '50%',
    transform: 'translateX(-50%)',
  };
  const desktopStyle: React.CSSProperties = {
    position: 'fixed',
    top: 'calc(50% - 56px)',
    left: '50%',
    transform: 'translateX(-50%)',
  };

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ delay: 1.4, duration: 0.4 }}
          style={{
            ...(mobile ? mobileStyle : desktopStyle),
            background: '#3F3226',
            color: '#FBF5EA',
            borderRadius: 10,
            padding: mobile ? '7px 11px' : '7px 14px',
            fontFamily: 'var(--font-lora, serif)',
            fontSize: mobile ? 11.5 : 13,
            whiteSpace: 'nowrap',
            zIndex: 11,
            pointerEvents: 'none',
            boxShadow: '0 4px 12px rgba(63,50,38,0.4)',
          }}
        >
          {mobile ? 'use the pad below to wander' : 'click here, then use ← ↑ → ↓ to wander'}
          {/* downward pointer only on desktop (above avatar) */}
          {!mobile && (
            <div style={{
              position: 'absolute',
              bottom: -7,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '8px solid #3F3226',
            }} />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
