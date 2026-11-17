/**
 * accordion — numbered Q&A notes beside a section head. One item open at a time;
 * panels animate with a grid-template-rows transition. The first item starts open.
 *
 * Authoring: one row per item — question | answer.
 * The section head (eyebrow <p> + <h3>) is authored as default content directly
 * above the block; the block moves it into its left column.
 */

const EASE = 'cubic-bezier(.2,.8,.1,1)';
const pad = (n) => String(n).padStart(2, '0');
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  if (node) w.append(node);
  return w;
}

export default async function decorate(block) {
  const layout = wrapNode(null, 'accordion-layout');
  const head = wrapNode(null, 'accordion-head');

  // reabsorb the section head authored as default content above the block
  const prev = block.parentElement && block.parentElement.previousElementSibling;
  if (prev && prev.classList.contains('default-content-wrapper')) {
    head.append(...prev.childNodes);
    prev.remove();
  }

  const list = wrapNode(null, 'accordion-list');
  const items = [];
  const uid = Math.random().toString(36).slice(2, 7);
  [...block.children].forEach((row, i) => {
    const cells = [...row.children];
    const q = cells[0] && cells[0].querySelector('p, h2, h3, h4');
    const a = cells[1] ? [...cells[1].children] : [];
    if (!q) return;
    const item = wrapNode(null, 'accordion-item');
    const bar = wrapNode(null, 'accordion-row');
    const num = document.createElement('span');
    num.className = 'accordion-num';
    num.textContent = pad(i + 1);
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'accordion-toggle';
    toggle.setAttribute('aria-label', `Toggle: ${q.textContent.trim()}`);
    const panelId = `accordion-${uid}-${i}`;
    toggle.setAttribute('aria-controls', panelId);
    toggle.append(document.createElement('span'), document.createElement('span'));
    bar.append(num, wrapNode(q, 'accordion-question'), toggle);
    const inner = wrapNode(null, 'accordion-panel-inner');
    inner.append(...a);
    const panel = wrapNode(inner, 'accordion-panel');
    panel.id = panelId;
    panel.setAttribute('role', 'region');
    item.append(bar, panel);
    list.append(item);
    items.push({ item, toggle, bar });
  });

  if (head.childNodes.length) layout.append(head);
  layout.append(list);
  block.replaceChildren(layout);

  let open = -1;
  const setOpen = (k) => {
    open = k;
    items.forEach(({ item, toggle }, i) => {
      const on = i === k;
      item.classList.toggle('is-open', on);
      toggle.setAttribute('aria-expanded', on ? 'true' : 'false');
    });
  };
  items.forEach(({ bar }, i) => {
    bar.addEventListener('click', () => setOpen(open === i ? -1 : i));
  });
  setOpen(items.length ? 0 : -1);

  if (!head.childNodes.length || reduced()) return;
  if (head.getBoundingClientRect().top > window.innerHeight * 0.9) {
    head.style.opacity = '0';
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      head.style.opacity = '';
      head.animate(
        [{ opacity: 0, transform: 'translateY(48px)' }, { opacity: 1, transform: 'none' }],
        { duration: 1000, easing: EASE, fill: 'backwards' },
      );
    }), { threshold: 0.12 });
    io.observe(head);
  }
}
