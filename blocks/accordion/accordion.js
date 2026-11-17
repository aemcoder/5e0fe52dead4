/**
 * accordion — numbered question rows between rules; one answer open at a time,
 * the panel height animating via a grid-template-rows transition. The first
 * item starts open.
 *
 * Authoring: one row per item — cells: question | answer.
 * The section's default content (eyebrow + heading) sits beside it as the head.
 */

const EASE = 'cubic-bezier(.2,.8,.1,1)';
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const pad = (n) => String(n).padStart(2, '0');

let seq = 0;

export default function decorate(block) {
  const items = [...block.children].map((row, i) => {
    const [q, a] = [...row.children];
    seq += 1;
    const id = `accordion-${seq}`;
    const item = document.createElement('div');
    item.className = 'accordion-item';

    const head = document.createElement('div');
    head.className = 'accordion-head';
    const num = document.createElement('span');
    num.className = 'accordion-num';
    num.setAttribute('aria-hidden', 'true');
    num.textContent = pad(i + 1);
    const title = document.createElement('div');
    title.className = 'accordion-title';
    if (q) title.append(...q.childNodes);
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'accordion-toggle';
    toggle.setAttribute('aria-controls', id);
    toggle.setAttribute('aria-label', `Toggle: ${title.textContent.trim()}`);
    head.append(num, title, toggle);

    const panel = document.createElement('div');
    panel.className = 'accordion-panel';
    panel.id = id;
    panel.setAttribute('role', 'region');
    const inner = document.createElement('div');
    inner.className = 'accordion-inner';
    const answer = document.createElement('div');
    answer.className = 'accordion-answer';
    if (a) answer.append(...a.childNodes);
    inner.append(answer);
    panel.append(inner);
    item.append(head, panel);
    return {
      item, head, toggle, panel,
    };
  });

  let open = 0;
  const render = () => items.forEach(({ item, toggle, panel }, i) => {
    const on = i === open;
    item.classList.toggle('open', on);
    toggle.setAttribute('aria-expanded', on ? 'true' : 'false');
    panel.setAttribute('aria-hidden', on ? 'false' : 'true');
  });
  items.forEach(({ head }, i) => head.addEventListener('click', (e) => {
    if (e.target.closest('.prosemirror-editor')) return;
    open = open === i ? -1 : i;
    render();
  }));
  render();
  block.replaceChildren(...items.map((x) => x.item));

  // section head (default content) reveal
  const headWrap = block.parentElement?.previousElementSibling;
  if (reduced() || !headWrap?.classList.contains('default-content-wrapper')) return;
  headWrap.style.opacity = '0';
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    io.unobserve(headWrap);
    headWrap.style.opacity = '';
    headWrap.animate([
      { opacity: 0, transform: 'translateY(48px)' },
      { opacity: 1, transform: 'none' },
    ], {
      duration: 1000, easing: EASE, fill: 'backwards',
    });
  }), { threshold: 0.12 });
  io.observe(headWrap);
}
