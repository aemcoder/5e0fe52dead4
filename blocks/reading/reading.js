/**
 * reading — a display paragraph whose words brighten one by one as the
 * paragraph crosses the lower part of the viewport, tied to scroll position.
 *
 * Authoring: one cell holding the paragraph.
 *
 * The paragraph's own text nodes are split into word spans in place (the
 * paragraph element and its textContent are unchanged).
 */

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

function splitWords(p) {
  const spans = [];
  const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => {
    const parts = node.nodeValue.split(/(\s+)/);
    const frag = document.createDocumentFragment();
    parts.forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) {
        frag.append(document.createTextNode(part));
      } else {
        const s = document.createElement('span');
        s.className = 'word';
        s.textContent = part;
        frag.append(s);
        spans.push(s);
      }
    });
    node.replaceWith(frag);
  });
  return spans;
}

export default async function decorate(block) {
  const p = block.querySelector('p');
  const wrap = document.createElement('div');
  wrap.className = 'words';
  if (p) wrap.append(p);
  block.replaceChildren(wrap);
  if (!p || reduced()) return;

  const spans = splitWords(p);
  block.classList.add('is-live');
  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = window.innerHeight;
    const r = p.getBoundingClientRect();
    if (r.bottom < -200 || r.top > vh + 200) return;
    const lit = clamp((vh * 0.8 - r.top) / (r.height + vh * 0.3)) * spans.length;
    spans.forEach((s, i) => {
      const k = (0.16 + 0.84 * clamp(lit - i)).toFixed(2);
      if (s.dataset.o !== k) {
        s.dataset.o = k;
        s.style.opacity = k;
      }
    });
  };
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };
  requestAnimationFrame(update);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
}
