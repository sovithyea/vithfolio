'use client';

import { useEffect, useRef, useState } from 'react';
import { useInputStore } from '@/stores/inputStore';

const BTN: React.CSSProperties = {
  width: 30,
  height: 30,
  background: '#FBF5EA',
  border: '1px solid #E7D8BE',
  borderRadius: 7,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 13,
  cursor: 'pointer',
  color: '#3F3226',
  boxShadow: '0 2px 4px rgba(63,50,38,0.12)',
  userSelect: 'none',
  touchAction: 'none',
};

export default function TouchDPad() {
  const [show, setShow] = useState(false);
  const active = useRef(new Set<string>());

  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)');
    setShow(mq.matches);
    const handler = (e: MediaQueryListEvent) => setShow(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  if (!show) return null;

  const compute = () => {
    let x = 0, y = 0;
    if (active.current.has('up'))    y -= 1;
    if (active.current.has('down'))  y += 1;
    if (active.current.has('left'))  x -= 1;
    if (active.current.has('right')) x += 1;
    useInputStore.getState().setVector(x, y);
  };

  const press   = (dir: string) => () => { active.current.add(dir);    compute(); };
  const release = (dir: string) => () => { active.current.delete(dir); compute(); };

  const makeBtn = (dir: string, label: string) => (
    <button
      style={BTN}
      onMouseDown={press(dir)}  onMouseUp={release(dir)}  onMouseLeave={release(dir)}
      onTouchStart={(e) => { e.preventDefault(); press(dir)(); }}
      onTouchEnd={(e)   => { e.preventDefault(); release(dir)(); }}
    >
      {label}
    </button>
  );

  return (
    <div style={{
      position: 'fixed',
      bottom: 116,
      right: 14,
      zIndex: 40,
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 30px)',
      gridTemplateRows:    'repeat(3, 30px)',
      gap: 3,
    }}>
      <div />
      {makeBtn('up',    '↑')}
      <div />
      {makeBtn('left',  '←')}
      <div style={{ ...BTN, background: 'rgba(251,245,234,0.35)', boxShadow: 'none', border: '1px dashed #E7D8BE', cursor: 'default' }} />
      {makeBtn('right', '→')}
      <div />
      {makeBtn('down',  '↓')}
      <div />
    </div>
  );
}
