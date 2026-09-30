// add delayed functionality here

/**
 * Trailing cursor — a small accent square that follows the pointer with a
 * lerp and grows over interactive elements. Fine pointers only; off under
 * prefers-reduced-motion.
 */
function initTrailingCursor() {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (document.querySelector('.cursor-dot')) return;

  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  dot.setAttribute('aria-hidden', 'true');
  Object.assign(dot.style, {
    position: 'fixed',
    left: '0',
    top: '0',
    width: '14px',
    height: '14px',
    background: 'var(--color-accent)',
    pointerEvents: 'none',
    zIndex: '400',
    mixBlendMode: 'multiply',
    transform: 'translate3d(-100px,-100px,0)',
  });
  document.body.append(dot);

  const P = {
    x: -200, y: -200, cx: -200, cy: -200, s: 1, big: false,
  };
  const interactive = 'a, button, label, video, canvas, .clip, .frame, .specimen .word';
  window.addEventListener('pointermove', (e) => {
    P.x = e.clientX;
    P.y = e.clientY;
  }, { passive: true });
  window.addEventListener('pointerover', (e) => {
    P.big = !!(e.target && e.target.closest && e.target.closest(interactive));
  });
  const tick = () => {
    P.cx += (P.x - P.cx) * 0.2;
    P.cy += (P.y - P.cy) * 0.2;
    P.s += ((P.big ? 3.4 : 1) - P.s) * 0.18;
    dot.style.transform = `translate3d(${(P.cx - 7).toFixed(1)}px,${(P.cy - 7).toFixed(1)}px,0) scale(${P.s.toFixed(3)})`;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

initTrailingCursor();
