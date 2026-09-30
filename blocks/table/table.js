/**
 * table — a data table (Block Collection "table" shape).
 *
 * Authoring: first row = column headings; every following row = one record,
 * one cell per column (up to four columns). The first column renders in the
 * accent colour (index numbers). The table scrolls horizontally on narrow
 * screens.
 */

const EASE = 'cubic-bezier(.2,.8,.1,1)';
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function whenShown(el, cb) {
  const check = () => (el.getClientRects().length ? cb() : requestAnimationFrame(check));
  check();
}

function reveal(el) {
  whenShown(el, () => {
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
    el.style.opacity = '0';
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      el.style.opacity = '';
      el.animate(
        [{ opacity: 0, transform: 'translateY(48px)' }, { opacity: 1, transform: 'none' }],
        { duration: 1000, easing: EASE, fill: 'backwards' },
      );
    }, { threshold: 0.12 });
    io.observe(el);
  });
}

export default async function decorate(block) {
  const rows = [...block.children];
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
  if (thead.children.length) table.append(thead);
  table.append(tbody);

  const scroller = document.createElement('div');
  scroller.className = 'table-scroll';
  scroller.tabIndex = 0;
  scroller.setAttribute('role', 'region');
  scroller.setAttribute('aria-label', 'Inventory table');
  scroller.append(table);
  block.replaceChildren(scroller);

  if (!reduced()) reveal(scroller);
}
