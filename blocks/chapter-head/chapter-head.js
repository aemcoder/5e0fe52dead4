/**
 * chapter-head — chapter opener: oversized red numeral, eyebrow, title and lede,
 * set on a two-column grid under a divider rule. The title scrambles into place
 * once; the grid reveals on enter. The numeral also names the chapter anchor
 * (`01` → `#ch1`) so in-page links and the nav can target it.
 *
 * Authoring: one cell — numeral <p>, eyebrow <p>, <h2> title, lede <p>.
 */

const EASE = 'cubic-bezier(.2,.8,.1,1)';
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  if (node) w.append(node);
  return w;
}

/** scrambles a text-only heading; the original text node is restored at the end */
function scramble(heading) {
  const nodes = [...heading.childNodes];
  if (nodes.some((n) => n.nodeType !== 3)) return;
  const original = heading.textContent;
  const temp = document.createTextNode(original);
  heading.replaceChildren(temp);
  const lo = 'abcdefghijklmnopqrstuvwxyz';
  const t0 = performance.now();
  const d = Math.min(1400, 400 + original.length * 22);
  const frame = (t) => {
    const p = Math.min(1, (t - t0) / d);
    if (p >= 1) {
      heading.replaceChildren(...nodes);
      return;
    }
    let s = '';
    for (let i = 0; i < original.length; i += 1) {
      const c = original[i];
      if (!/[a-z]/i.test(c) || i / original.length < p) s += c;
      else {
        const r = lo[Math.floor(Math.random() * 26)];
        s += c === c.toUpperCase() ? r.toUpperCase() : r;
      }
    }
    temp.data = s;
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

export default async function decorate(block) {
  const heading = block.querySelector('h1, h2, h3');
  const paras = [...block.querySelectorAll('p')];
  const before = heading
    // eslint-disable-next-line no-bitwise
    ? paras.filter((p) => heading.compareDocumentPosition(p) & Node.DOCUMENT_POSITION_PRECEDING)
    : paras.slice(0, 2);
  const after = paras.filter((p) => !before.includes(p));
  const num = before.find((p) => /^\s*\d+\s*$/.test(p.textContent));
  const eyebrow = before.find((p) => p !== num);

  const grid = wrapNode(null, 'chapter-grid');
  const title = wrapNode(null, 'chapter-title');
  if (num) title.append(wrapNode(num, 'chapter-num'));
  if (eyebrow) title.append(wrapNode(eyebrow, 'chapter-eyebrow'));
  if (heading) title.append(wrapNode(heading, 'chapter-heading'));
  grid.append(title);
  if (after.length) {
    const lede = wrapNode(null, 'chapter-lede');
    lede.append(...after);
    grid.append(lede);
  }
  block.replaceChildren(grid);

  if (num) {
    const n = parseInt(num.textContent.trim(), 10);
    if (!Number.isNaN(n) && !document.getElementById(`ch${n}`)) block.id = `ch${n}`;
  }

  if (reduced()) return;
  if (grid.getBoundingClientRect().top > window.innerHeight * 0.9) {
    grid.style.opacity = '0';
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      grid.style.opacity = '';
      grid.animate(
        [{ opacity: 0, transform: 'translateY(48px)' }, { opacity: 1, transform: 'none' }],
        { duration: 1000, easing: EASE, fill: 'backwards' },
      );
    }), { threshold: 0.12 });
    io.observe(grid);
  }
  if (heading) {
    const io2 = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      io2.disconnect();
      scramble(heading);
    }), { threshold: 0.6 });
    io2.observe(heading);
  }
}
