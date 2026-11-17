/**
 * stats — a row of headline numerals with uppercase labels; each numeral counts
 * up from zero when it scrolls into view.
 *
 * Authoring: one row per figure — cells: number | label.
 */

const EASE = 'cubic-bezier(.2,.8,.1,1)';
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function countUp(p) {
  // only a paragraph holding a single plain text node is animated (edit-safe)
  if (p.childNodes.length !== 1 || p.firstChild.nodeType !== Node.TEXT_NODE) return;
  const node = p.firstChild;
  const final = node.textContent;
  const target = parseInt(final, 10);
  const t0 = performance.now();
  const f = (t) => {
    const k = Math.min(1, (t - t0) / 1600);
    const e = 1 - (1 - k) ** 4;
    node.textContent = k < 1 ? String(Math.round(target * e)) : final;
    if (k < 1) requestAnimationFrame(f);
  };
  requestAnimationFrame(f);
}

export default function decorate(block) {
  const items = [...block.children];
  items.forEach((row, i) => {
    row.className = 'stat';
    const [num, label] = row.children;
    if (num) num.className = 'stat-num';
    if (label) label.className = 'stat-label';
    row.dataset.delay = String(i * 80);
  });
  if (reduced()) return;

  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    const row = e.target;
    row.style.opacity = '';
    row.animate([
      { opacity: 0, transform: 'translateY(48px)' },
      { opacity: 1, transform: 'none' },
    ], {
      duration: 1000, delay: +row.dataset.delay, easing: EASE, fill: 'backwards',
    });
    const p = row.querySelector('.stat-num p');
    if (p && /^\d+$/.test(p.textContent.trim())) countUp(p);
  }), { threshold: 0.6 });
  items.forEach((row) => {
    row.style.opacity = '0';
    io.observe(row);
  });
}
