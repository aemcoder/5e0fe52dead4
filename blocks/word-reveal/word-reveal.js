/**
 * word-reveal — a large statement whose words brighten one by one as the
 * paragraph crosses the lower part of the screen (scroll-linked opacity).
 * Scroll back and it dims again. Static under reduced motion.
 *
 * Authoring: one cell with the statement paragraph.
 */

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** wraps each word of the paragraph's text nodes in a span (presentation only) */
function splitWords(p) {
  const spans = [];
  const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
  const texts = [];
  while (walker.nextNode()) texts.push(walker.currentNode);
  texts.forEach((node) => {
    const parts = node.data.split(/(\s+)/);
    const frag = document.createDocumentFragment();
    parts.forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) frag.append(document.createTextNode(part));
      else {
        const s = document.createElement('span');
        s.className = 'word';
        s.textContent = part;
        spans.push(s);
        frag.append(s);
      }
    });
    node.replaceWith(frag);
  });
  return spans;
}

export default async function decorate(block) {
  const p = block.querySelector('p');
  if (!p) return;
  const wrap = document.createElement('div');
  wrap.className = 'word-reveal-text';
  wrap.append(p);
  block.replaceChildren(wrap);
  if (reduced()) return;

  const words = splitWords(p);
  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = window.innerHeight;
    const r = p.getBoundingClientRect();
    if (r.bottom < -200 || r.top > vh + 200) return;
    const lit = clamp((vh * 0.8 - r.top) / (r.height + vh * 0.3)) * words.length;
    words.forEach((w, i) => {
      const o = (0.16 + 0.84 * clamp(lit - i)).toFixed(2);
      if (w.style.opacity !== o) w.style.opacity = o;
    });
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  update();
}
