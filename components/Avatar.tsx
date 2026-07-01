'use client';

export default function Avatar() {
  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 12,
        height: 12,
        borderRadius: '50%',
        background: '#ffffff',
        boxShadow: '0 0 0 2px rgba(0,0,0,0.6), 0 0 8px rgba(255,255,255,0.4)',
        zIndex: 10,
        pointerEvents: 'none',
      }}
    />
  );
}
