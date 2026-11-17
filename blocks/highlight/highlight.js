/**
 * highlight — display paragraph whose words brighten one by one as it
 * crosses the lower part of the viewport (scroll-linked, reversible).
 *
 * Authoring rows:
 *   1. one cell: <p> the paragraph
 * The authored <p> stays in place; its text nodes are split into word spans.
 */

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

function wrap(className, ...nodes) {
  const el = document.createElement('div');
  el.className = className;
  el.append(...nodes);
  return el;
}

/* split text nodes of the paragraph into word spans; inline elements count as one unit */
function splitWords(p) {
  const units = [];
  [...p.childNodes].forEach((n) => {
    if (n.nodeType === Node.TEXT_NODE) {
      const frag = document.createDocumentFragment();
      n.nodeValue.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) frag.append(part);
        else {
          const s = document.createElement('span');
          s.className = 'highlight-word';
          s.textContent = part;
          frag.append(s);
          units.push(s);
        }
      });
      n.replaceWith(frag);
    } else if (n.nodeType === Node.ELEMENT_NODE) units.push(n);
  });
  return units;
}

export default async function decorate(block) {
  const paras = [...block.querySelectorAll('p')];
  const text = wrap('highlight-text', ...paras);
  block.replaceChildren(text);

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (document.body.classList.contains('quick-edit')) return;

  const groups = paras.map((p) => ({ p, units: splitWords(p) }));
  const update = () => {
    const vh = window.innerHeight;
    groups.forEach(({ p, units }) => {
      const r = p.getBoundingClientRect();
      const lit = clamp((vh * 0.8 - r.top) / (r.height + vh * 0.3)) * units.length;
      units.forEach((u, i) => {
        const o = (0.16 + 0.84 * clamp(lit - i)).toFixed(2);
        if (u.dataset.o !== o) {
          u.dataset.o = o;
          u.style.opacity = o;
        }
      });
    });
  };

  let visible = false;
  let ticking = false;
  const onScroll = () => {
    if (!visible || ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      update();
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    update();
  }, { rootMargin: '200px 0px' }).observe(block);
  update();
}
