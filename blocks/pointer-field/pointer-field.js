/**
 * pointer-field — full-bleed Canvas 2D grid that sizes each cell by its
 * distance to the pointer; idles on a slow orbit.
 *
 * Authoring rows:
 *   1. one cell: <p> label ("Pointer field · Canvas 2D")
 */

function wrap(className, ...nodes) {
  const el = document.createElement('div');
  el.className = className;
  el.append(...nodes);
  return el;
}

export default async function decorate(block) {
  const labelP = block.querySelector('p');
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  const stage = wrap('pointer-field-stage', canvas);
  if (labelP) stage.append(wrap('pointer-field-label', labelP));
  block.replaceChildren(stage);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const css = getComputedStyle(document.documentElement);
  const ink = css.getPropertyValue('--color-text').trim() || '#201e1d';
  const red = css.getPropertyValue('--color-accent').trim() || '#ec3013';
  const F = {
    w: 0, h: 0, x: 0, y: 0, tx: 0, ty: 0, active: false,
  };

  const draw = (t) => {
    if (!F.w) return;
    const { w, h } = F;
    if (!F.active && !reduced) {
      F.tx = w / 2 + Math.cos(t / 1600) * w * 0.32;
      F.ty = h / 2 + Math.sin(t / 1150) * h * 0.3;
    }
    F.x += (F.tx - F.x) * 0.12;
    F.y += (F.ty - F.y) * 0.12;
    ctx.clearRect(0, 0, w, h);
    const g = 26;
    const R = Math.max(180, Math.min(w, h) * 0.45);
    const cols = Math.ceil(w / g);
    const rows = Math.ceil(h / g);
    const ox = (w - cols * g) / 2 + g / 2;
    const oy = (h - rows * g) / 2 + g / 2;
    for (let j = 0; j < rows; j += 1) {
      for (let i = 0; i < cols; i += 1) {
        const x = ox + i * g;
        const y = oy + j * g;
        const f = Math.max(0, 1 - Math.hypot(x - F.x, y - F.y) / R);
        const e = f * f * (3 - 2 * f);
        const s = 2 + e * (g - 6);
        ctx.fillStyle = e > 0.6 ? red : ink;
        ctx.fillRect(x - s / 2, y - s / 2, s, s);
      }
    }
  };

  const size = () => {
    const d = window.devicePixelRatio || 1;
    F.w = stage.clientWidth;
    F.h = stage.clientHeight;
    canvas.width = Math.round(F.w * d);
    canvas.height = Math.round(F.h * d);
    ctx.setTransform(d, 0, 0, d, 0, 0);
    F.x = F.w / 2;
    F.y = F.h / 2;
    F.tx = F.x;
    F.ty = F.y;
    draw(0);
  };
  new ResizeObserver(size).observe(stage);

  if (reduced) return;

  stage.addEventListener('pointermove', (e) => {
    const r = stage.getBoundingClientRect();
    F.tx = e.clientX - r.left;
    F.ty = e.clientY - r.top;
    F.active = true;
  });
  stage.addEventListener('pointerleave', () => { F.active = false; });

  let raf = 0;
  const tick = (t) => {
    draw(t);
    raf = requestAnimationFrame(tick);
  };
  new IntersectionObserver(([entry]) => {
    cancelAnimationFrame(raf);
    if (entry.isIntersecting) raf = requestAnimationFrame(tick);
  }).observe(stage);
}
