/**
 * chapter — chapter opener: an oversized accent numeral, a kicker, the
 * chapter title (<h2>) and a lede, set on a two-column grid below a rule.
 * The block carries the chapter's anchor id (#ch1 … #chN) derived from the
 * numeral, so nav links resolve. The title "scrambles" into place once.
 *
 * Authoring (one cell per row, decoded by content):
 *   - numeral paragraph, e.g. "01"
 *   - kicker paragraph, e.g. "Chapter 01 — Scroll as a timeline"
 *   - <h2> chapter title
 *   - lede paragraph (after the title)
 */

const EASE = 'cubic-bezier(.2,.8,.1,1)';
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

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

/** Scrambles the heading's own text nodes, then restores their exact values. */
function scramble(el) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  const finals = nodes.map((n) => n.nodeValue);
  const total = finals.join('').length;
  const lo = 'abcdefghijklmnopqrstuvwxyz';
  const d = Math.min(1400, 400 + total * 22);
  const t0 = performance.now();
  const f = (t) => {
    const p = clamp((t - t0) / d);
    let offset = 0;
    nodes.forEach((n, k) => {
      const final = finals[k];
      if (p >= 1) {
        n.nodeValue = final;
        return;
      }
      let s = '';
      for (let i = 0; i < final.length; i += 1) {
        const c = final[i];
        if (!/[a-z]/i.test(c) || (offset + i) / total < p) s += c;
        else {
          const r = lo[Math.floor(Math.random() * 26)];
          s += c === c.toUpperCase() ? r.toUpperCase() : r;
        }
      }
      n.nodeValue = s;
      offset += final.length;
    });
    if (p < 1) requestAnimationFrame(f);
  };
  requestAnimationFrame(f);
}

export default async function decorate(block) {
  const heading = block.querySelector('h1, h2, h3');
  const ps = [...block.querySelectorAll('p')];
  // eslint-disable-next-line no-bitwise
  const before = (p) => heading && (p.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING);
  const numeral = ps.find((p) => /^\s*\d{1,3}\s*$/.test(p.textContent));
  const kicker = ps.find((p) => p !== numeral && before(p));
  const lede = ps.find((p) => p !== numeral && p !== kicker);

  const grid = document.createElement('div');
  grid.className = 'chapter-grid';
  const title = document.createElement('div');
  title.className = 'chapter-title';
  if (numeral) title.append(wrapNode(numeral, 'num'));
  if (kicker) title.append(wrapNode(kicker, 'eyebrow'));
  if (heading) title.append(wrapNode(heading, 'headline'));
  grid.append(title);
  if (lede) grid.append(wrapNode(lede, 'lede'));
  block.replaceChildren(grid);

  const n = numeral ? parseInt(numeral.textContent, 10) : NaN;
  if (!Number.isNaN(n) && !document.getElementById(`ch${n}`)) block.id = `ch${n}`;

  if (reduced()) return;
  reveal(grid);
  if (heading) {
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      scramble(heading);
    }, { threshold: 0.6 });
    io.observe(heading);
  }
}
