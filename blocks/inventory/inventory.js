/**
 * inventory — a data table (the page's effect inventory). The first row is the
 * header; every other row is one entry. The first column is set in accent red.
 * Scrolls horizontally on narrow screens. Reveals on enter.
 *
 * Authoring: header row, then one row per entry (up to 4 columns).
 */

const EASE = 'cubic-bezier(.2,.8,.1,1)';
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function fillCell(target, cell) {
  const ps = [...cell.querySelectorAll(':scope > p')];
  if (ps.length) target.append(...ps);
  else target.append(...cell.childNodes);
}

export default async function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  rows.forEach((row, i) => {
    const tr = document.createElement('tr');
    [...row.children].forEach((cell) => {
      const td = document.createElement(i === 0 ? 'th' : 'td');
      if (i === 0) td.scope = 'col';
      fillCell(td, cell);
      tr.append(td);
    });
    (i === 0 ? thead : tbody).append(tr);
  });
  table.append(thead, tbody);
  const scroller = document.createElement('div');
  scroller.className = 'inventory-scroll';
  scroller.append(table);
  block.replaceChildren(scroller);

  if (reduced() || scroller.getBoundingClientRect().top <= window.innerHeight * 0.9) return;
  scroller.style.opacity = '0';
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    scroller.style.opacity = '';
    scroller.animate(
      [{ opacity: 0, transform: 'translateY(48px)' }, { opacity: 1, transform: 'none' }],
      { duration: 1000, easing: EASE, fill: 'backwards' },
    );
  }), { threshold: 0.12 });
  io.observe(scroller);
}
