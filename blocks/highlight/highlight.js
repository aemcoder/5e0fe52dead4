/**
 * highlight — a large display paragraph read word by word: each word brightens
 * from 16% to full opacity as it crosses the lower part of the screen, tracking
 * the scroll position exactly (scroll back and it dims again).
 *
 * Authoring: one cell holding the paragraph.
 */

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/** wraps every word of the paragraph's text nodes in a span (text is kept, not rebuilt) */
function splitWords(p) {
  const spans = [];
  const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
  const texts = [];
  while (walker.nextNode()) texts.push(walker.currentNode);
  texts.forEach((t) => {
    const frag = document.createDocumentFragment();
    t.textContent.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) frag.append(part);
      else {
        const s = document.createElement('span');
        s.className = 'word';
        s.textContent = part;
        spans.push(s);
        frag.append(s);
      }
    });
    t.replaceWith(frag);
  });
  return spans;
}

export default function decorate(block) {
  const p = block.querySelector('p');
  if (!p) return;
  block.replaceChildren(p);
  if (reduced()) return;
  const words = splitWords(p);
  let queued = false;
  const update = () => {
    queued = false;
    const vh = window.innerHeight;
    const r = p.getBoundingClientRect();
    const lit = clamp((vh * 0.8 - r.top) / (r.height + vh * 0.3)) * words.length;
    words.forEach((s, i) => {
      const k = (0.16 + 0.84 * clamp(lit - i)).toFixed(2);
      if (s.style.opacity !== k) s.style.opacity = k;
    });
  };
  const req = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  };
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', req);
  req();
}
