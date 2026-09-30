/**
 * stats — "this page, by the numbers": a row of large accent numerals with
 * small uppercase labels. Numerals count up once when they scroll into view.
 *
 * Authoring: one row per stat — cell 1: the number, cell 2: the label.
 * (A single-cell row with two paragraphs is accepted too.)
 */

const EASE = 'cubic-bezier(.2,.8,.1,1)';
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

function whenShown(el, cb) {
  const check = () => (el.getClientRects().length ? cb() : requestAnimationFrame(check));
  check();
}

function reveal(el, delay = 0) {
  whenShown(el, () => {
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
    el.style.opacity = '0';
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      el.style.opacity = '';
      el.animate(
        [{ opacity: 0, transform: 'translateY(48px)' }, { opacity: 1, transform: 'none' }],
        {
          duration: 1000, delay, easing: EASE, fill: 'backwards',
        },
      );
    }, { threshold: 0.12 });
    io.observe(el);
  });
}

/** Counts the numeral's own text node up to its authored value, then restores it. */
function countUp(p) {
  const node = [...p.childNodes].find((n) => n.nodeType === 3 && /\d/.test(n.nodeValue));
  if (!node) return;
  const final = node.nodeValue;
  const target = parseInt(final.replace(/[^\d]/g, ''), 10);
  if (!target) return;
  const t0 = performance.now();
  const f = (t) => {
    const k = clamp((t - t0) / 1600);
    const e = 1 - (1 - k) ** 4;
    node.nodeValue = k < 1 ? final.replace(/\d+/, String(Math.round(target * e))) : final;
    if (k < 1) requestAnimationFrame(f);
  };
  requestAnimationFrame(f);
}

export default async function decorate(block) {
  const grid = document.createElement('div');
  grid.className = 'stats-grid';
  grid.setAttribute('role', 'list');

  [...block.children].forEach((row) => {
    const ps = [...row.querySelectorAll('p')];
    if (!ps.length) return;
    const stat = document.createElement('div');
    stat.className = 'stat';
    stat.setAttribute('role', 'listitem');
    const num = ps.find((p) => /^\s*[\d.,]+\s*$/.test(p.textContent)) || ps[0];
    stat.append(wrapNode(num, 'num'));
    const label = ps.find((p) => p !== num);
    if (label) stat.append(wrapNode(label, 'label'));
    grid.append(stat);
  });

  const section = block.closest('.section');
  if (section && !section.getAttribute('aria-label')) section.setAttribute('aria-label', 'This page, by the numbers');

  block.replaceChildren(grid);

  if (reduced()) return;
  [...grid.children].forEach((stat, i) => reveal(stat, i * 80));
  const io = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    io.unobserve(entry.target);
    countUp(entry.target);
  }), { threshold: 0.6 });
  grid.querySelectorAll('.num p').forEach((p) => io.observe(p));
}
