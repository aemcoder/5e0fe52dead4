/**
 * field — full-bleed Canvas 2D pointer field: a grid of squares that grow with
 * proximity to the pointer (the closest turn red); without a pointer a slow
 * orbit drives it. Drawing stops while the field is off screen.
 *
 * Authoring: one cell holding the corner label paragraph.
 */

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

export default function decorate(block) {
  const label = block.querySelector('p');
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  block.replaceChildren(canvas);
  if (label) block.append(wrapNode(label, 'field-label'));

  const ctx = canvas.getContext('2d');
  const css = getComputedStyle(document.documentElement);
  const ink = css.getPropertyValue('--color-text').trim() || '#201e1d';
  const red = css.getPropertyValue('--color-accent').trim() || '#ec3013';
  const F = {
    w: 0, h: 0, x: 0, y: 0, tx: 0, ty: 0, active: false, on: false,
  };

  const draw = (t) => {
    if (!F.w) return;
    const { w, h } = F;
    if (!F.active) {
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
    F.w = block.clientWidth;
    F.h = block.clientHeight;
    canvas.width = F.w * d;
    canvas.height = F.h * d;
    ctx.setTransform(d, 0, 0, d, 0, 0);
    if (!F.x) {
      F.x = F.w / 2;
      F.y = F.h / 2;
    }
    draw(0);
  };
  new ResizeObserver(size).observe(block);
  block.addEventListener('pointermove', (e) => {
    const r = block.getBoundingClientRect();
    F.tx = e.clientX - r.left;
    F.ty = e.clientY - r.top;
    F.active = true;
  });
  block.addEventListener('pointerleave', () => { F.active = false; });
  new IntersectionObserver((es) => { F.on = es[0].isIntersecting; }).observe(block);

  const tick = (t) => {
    if (F.on && !reduced()) draw(t);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
