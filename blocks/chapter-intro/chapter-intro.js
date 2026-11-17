/**
 * chapter-intro — chapter opener: rule, big chapter numeral, eyebrow,
 * h2 (scrambles into place on first view) and a lede column.
 * Gives its section the anchor id `ch<N>` so nav links (#ch1…) resolve.
 *
 * Authoring rows:
 *   1. one cell: <p> number ("01"), <p> eyebrow, <h2> title, <p> lede
 *      (paragraphs before the heading: the purely numeric one is the
 *      numeral, the rest the eyebrow; paragraphs after it form the lede)
 */

const EASE = 'cubic-bezier(.2,.8,.1,1)';

function wrap(className, ...nodes) {
  const el = document.createElement('div');
  el.className = className;
  el.append(...nodes);
  return el;
}

/* scramble the heading's single text node, then restore the exact original */
function scramble(heading) {
  const node = heading.childNodes.length === 1 && heading.firstChild.nodeType === Node.TEXT_NODE
    ? heading.firstChild : null;
  if (!node) return;
  const final = node.nodeValue;
  const lo = 'abcdefghijklmnopqrstuvwxyz';
  const d = Math.min(1400, 400 + final.length * 22);
  const t0 = performance.now();
  const f = (t) => {
    const p = Math.min(1, (t - t0) / d);
    if (p >= 1) {
      node.nodeValue = final;
      return;
    }
    let s = '';
    for (let i = 0; i < final.length; i += 1) {
      const c = final[i];
      if (!/[a-z]/i.test(c) || i / final.length < p) s += c;
      else {
        const r = lo[Math.floor(Math.random() * 26)];
        s += c === c.toUpperCase() ? r.toUpperCase() : r;
      }
    }
    node.nodeValue = s;
    requestAnimationFrame(f);
  };
  requestAnimationFrame(f);
}

export default async function decorate(block) {
  const heading = block.querySelector('h1, h2, h3, h4');
  const ps = [...block.querySelectorAll('p')];
  // eslint-disable-next-line no-bitwise
  const isBefore = (p) => heading && (p.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING);
  const before = ps.filter(isBefore);
  const after = ps.filter((p) => !isBefore(p));
  const num = before.find((p) => /^\s*\d{1,3}\s*$/.test(p.textContent));
  const eyebrows = before.filter((p) => p !== num);

  const head = wrap('chapter-intro-head');
  if (num) head.append(wrap('chapter-intro-num', num));
  if (eyebrows.length) head.append(wrap('chapter-intro-eyebrow', ...eyebrows));
  if (heading) head.append(wrap('chapter-intro-title', heading));
  const grid = wrap('chapter-intro-grid', head);
  if (after.length) grid.append(wrap('chapter-intro-lede', ...after));
  block.replaceChildren(grid);

  // anchor id on the section (#ch1 … #ch7)
  const section = block.closest('.section');
  if (num && section && !section.id) {
    const n = parseInt(num.textContent, 10);
    if (Number.isFinite(n) && !document.getElementById(`ch${n}`)) section.id = `ch${n}`;
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (document.body.classList.contains('quick-edit')) return;

  const reveal = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    reveal.disconnect();
    grid.animate(
      [{ opacity: 0, transform: 'translateY(48px)' }, { opacity: 1, transform: 'none' }],
      { duration: 1000, easing: EASE, fill: 'backwards' },
    );
  }, { threshold: 0.12 });
  if (grid.getBoundingClientRect().top > window.innerHeight * 0.9) reveal.observe(grid);

  if (heading) {
    const once = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      once.disconnect();
      scramble(heading);
    }, { threshold: 0.6 });
    once.observe(heading);
  }
}
