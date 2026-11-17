/**
 * stats — "This page, by the numbers": four counting numerals.
 *
 * Authoring rows (one per stat):
 *   one cell: <p> number, <p> label
 * Numbers count up from 0 on first view and end on the exact authored text.
 */

const EASE = 'cubic-bezier(.2,.8,.1,1)';

function wrap(className, ...nodes) {
  const el = document.createElement('div');
  el.className = className;
  el.append(...nodes);
  return el;
}

function countUp(p) {
  const node = [...p.childNodes].find((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
  if (!node || p.childNodes.length !== 1) return;
  const final = node.nodeValue;
  const target = parseInt(final.replace(/[^\d]/g, ''), 10);
  if (!Number.isFinite(target) || target === 0) return;
  const t0 = performance.now();
  const d = 1600;
  const f = (t) => {
    const k = Math.min(1, (t - t0) / d);
    const e = 1 - (1 - k) ** 4;
    node.nodeValue = k < 1 ? String(Math.round(target * e)) : final;
    if (k < 1) requestAnimationFrame(f);
  };
  node.nodeValue = '0';
  requestAnimationFrame(f);
}

export default async function decorate(block) {
  const grid = wrap('stats-grid');
  const items = [];
  [...block.children].forEach((row) => {
    const ps = [...row.querySelectorAll('p')];
    if (!ps.length) return;
    const numIdx = ps.findIndex((p) => /^\s*[\d.,]+\s*\S{0,2}\s*$/.test(p.textContent));
    const num = ps[numIdx >= 0 ? numIdx : 0];
    const labels = ps.filter((p) => p !== num);
    const item = wrap('stats-item', wrap('stats-number', num));
    if (labels.length) item.append(wrap('stats-label', ...labels));
    grid.append(item);
    items.push({ item, num });
  });
  block.replaceChildren(grid);

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (document.body.classList.contains('quick-edit')) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const i = items.findIndex((it) => it.item === e.target);
      e.target.animate(
        [{ opacity: 0, transform: 'translateY(48px)' }, { opacity: 1, transform: 'none' }],
        {
          duration: 1000, delay: i * 80, easing: EASE, fill: 'backwards',
        },
      );
      countUp(items[i].num);
    });
  }, { threshold: 0.6 });
  items.forEach(({ item }) => io.observe(item));
}
