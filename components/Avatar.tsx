'use client';

import { useMobile } from '@/hooks/useMobile';

export default function Avatar() {
  const mobile = useMobile();
  const size   = mobile ? 22 : 26;

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: size,
        height: size,
        borderRadius: '50%',
        background: '#FBF5EA',
        border: mobile ? '2px solid #3F3226' : '2.5px solid #3F3226',
        boxShadow: '0 3px 6px rgba(63,50,38,0.35)',
        zIndex: 10,
        pointerEvents: 'none',
      }}
    >
      {!mobile && (
        <>
          <div style={{ position: 'absolute', left: 6,  top: 9, width: 3, height: 3, borderRadius: '50%', background: '#3F3226' }} />
          <div style={{ position: 'absolute', right: 6, top: 9, width: 3, height: 3, borderRadius: '50%', background: '#3F3226' }} />
        </>
      )}
    </div>
  );
}
