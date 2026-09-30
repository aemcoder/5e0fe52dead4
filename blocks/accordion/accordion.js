/**
 * accordion — numbered notes that open one at a time (grid-template-rows
 * transition). The section head (kicker + title) is authored as default
 * content directly before the block and is reabsorbed as the grid's left
 * column.
 *
 * Authoring: one row per note — cell 1: question, cell 2: answer.
 * The first note starts open. Item numbers (01, 02 …) are derived.
 *
 * The question text sits beside (not inside) the toggle button, so it stays
 * editable; the whole question row toggles the note.
 */

const EASE = 'cubic-bezier(.2,.8,.1,1)';
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const pad = (n) => String(n).padStart(2, '0');

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
  const uid = Math.random().toString(36).slice(2, 7);
  const list = document.createElement('div');
  list.className = 'accordion-list';
  const items = [];

  [...block.children].forEach((row, i) => {
    const [qCell, aCell] = [...row.children];
    if (!qCell) return;
    const item = document.createElement('div');
    item.className = 'item';

    const head = document.createElement('div');
    head.className = 'item-head';
    const num = document.createElement('span');
    num.className = 'num';
    num.setAttribute('aria-hidden', 'true');
    num.textContent = pad(i + 1);
    const question = document.createElement('div');
    question.className = 'question';
    question.id = `accordion-${uid}-q${i}`;
    question.append(...qCell.childNodes);
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'toggle';
    toggle.setAttribute('aria-controls', `accordion-${uid}-a${i}`);
    toggle.setAttribute('aria-labelledby', question.id);
    toggle.innerHTML = '<span class="bar"></span><span class="bar vertical"></span>';
    head.append(num, question, toggle);

    const panel = document.createElement('div');
    panel.className = 'panel';
    panel.id = `accordion-${uid}-a${i}`;
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', question.id);
    const inner = document.createElement('div');
    inner.className = 'panel-inner';
    if (aCell) inner.append(...aCell.childNodes);
    panel.append(inner);

    item.append(head, panel);
    list.append(item);
    items.push({ item, toggle, panel });
    head.addEventListener('click', () => {
      const open = !item.classList.contains('is-open');
      items.forEach((it) => {
        const on = it.item === item ? open : false;
        it.item.classList.toggle('is-open', on);
        it.toggle.setAttribute('aria-expanded', String(on));
        it.panel.inert = !on;
      });
    });
  });

  items.forEach((it, i) => {
    it.item.classList.toggle('is-open', i === 0);
    it.toggle.setAttribute('aria-expanded', String(i === 0));
    it.panel.inert = i !== 0;
  });

  const layout = document.createElement('div');
  layout.className = 'accordion-layout';

  // reabsorb the section head authored as default content right before the block
  const prev = block.parentElement?.previousElementSibling;
  let head = null;
  if (prev && prev.classList.contains('default-content-wrapper')) {
    head = document.createElement('div');
    head.className = 'accordion-head';
    const heading = prev.querySelector('h2, h3, h4');
    [...prev.children].forEach((el) => {
      // eslint-disable-next-line no-bitwise
      const isKicker = el.tagName === 'P' && heading && (el.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING);
      if (isKicker) {
        const w = document.createElement('div');
        w.className = 'eyebrow';
        w.append(el);
        head.append(w);
      } else if (el === heading) {
        const w = document.createElement('div');
        w.className = 'headline';
        w.append(el);
        head.append(w);
      } else {
        head.append(el);
      }
    });
    prev.remove();
    layout.append(head);
  }
  layout.append(list);
  block.replaceChildren(layout);

  if (head && !reduced()) reveal(head);
}
