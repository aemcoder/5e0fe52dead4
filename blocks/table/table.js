/**
 * table — data table; the first row is the header. The first column (an index
 * number) is set in the accent colour. Scrolls sideways on narrow screens.
 *
 * Authoring: first row = column headings, then one row per record (≤ 4 columns).
 */

const EASE = 'cubic-bezier(.2,.8,.1,1)';
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  rows.forEach((row, i) => {
    const tr = document.createElement('tr');
    [...row.children].forEach((cell) => {
      const c = document.createElement(i === 0 ? 'th' : 'td');
      if (i === 0) c.scope = 'col';
      c.append(...cell.childNodes);
      tr.append(c);
    });
    (i === 0 ? thead : tbody).append(tr);
  });
  table.append(thead, tbody);
  const scroller = document.createElement('div');
  scroller.className = 'table-scroll';
  scroller.append(table);
  block.replaceChildren(scroller);

  if (reduced()) return;
  scroller.style.opacity = '0';
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    io.unobserve(scroller);
    scroller.style.opacity = '';
    scroller.animate([
      { opacity: 0, transform: 'translateY(48px)' },
      { opacity: 1, transform: 'none' },
    ], {
      duration: 1000, easing: EASE, fill: 'backwards',
    });
  }), { threshold: 0.05 });
  io.observe(scroller);
}
