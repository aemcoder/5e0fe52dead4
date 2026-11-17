/**
 * stats — "this page, by the numbers": a row of big counting numerals with labels.
 * Numerals count up once when they scroll into view; columns reveal on enter.
 *
 * Authoring: one row per stat — number | label.
 */

const EASE = 'cubic-bezier(.2,.8,.1,1)';
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  if (node) w.append(node);
  return w;
}

/** counts the numeral's own text node up to its value, then restores it untouched */
function countUp(p) {
  const textNode = [...p.childNodes].find((n) => n.nodeType === 3 && n.data.trim());
  if (!textNode || !/^\d+$/.test(textNode.data.trim())) return;
  const original = textNode.data;
  const target = Number(original.trim());
  const t0 = performance.now();
  const step = (t) => {
    const k = Math.min(1, (t - t0) / 1600);
    const e = 1 - (1 - k) ** 4;
    if (k < 1) {
      textNode.data = String(Math.round(target * e));
      requestAnimationFrame(step);
    } else textNode.data = original;
  };
  requestAnimationFrame(step);
}

export default async function decorate(block) {
  const grid = wrapNode(null, 'stats-grid');
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const num = cells[0] && cells[0].querySelector('p');
    const label = cells[1] && cells[1].querySelector('p');
    if (!num && !label) return;
    const stat = wrapNode(null, 'stat');
    if (num) stat.append(wrapNode(num, 'stat-num'));
    if (label) stat.append(wrapNode(label, 'stat-label'));
    grid.append(stat);
  });
  block.replaceChildren(grid);
  if (reduced()) return;

  const stats = [...grid.children];
  const vh = window.innerHeight;
  const reveal = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    reveal.unobserve(e.target);
    e.target.style.opacity = '';
    e.target.animate(
      [{ opacity: 0, transform: 'translateY(48px)' }, { opacity: 1, transform: 'none' }],
      {
        duration: 1000, delay: stats.indexOf(e.target) * 80, easing: EASE, fill: 'backwards',
      },
    );
  }), { threshold: 0.12 });
  const once = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    once.unobserve(e.target);
    countUp(e.target);
  }), { threshold: 0.6 });
  stats.forEach((stat) => {
    if (stat.getBoundingClientRect().top > vh * 0.9) {
      stat.style.opacity = '0';
      reveal.observe(stat);
    }
    const p = stat.querySelector('.stat-num p');
    if (p) once.observe(p);
  });
}
