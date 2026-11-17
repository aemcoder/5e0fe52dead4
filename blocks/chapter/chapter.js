/**
 * chapter — chapter opener: a huge accent numeral, an eyebrow and the chapter
 * title on the left, the chapter lede on the right, under a full-width rule.
 * The section gets the anchor id `ch<number>` (so nav links like #ch3 land here),
 * the title unscrambles once when it comes into view.
 *
 * Authoring: one row, two cells —
 *   1. <p>number</p> (digits), <p>eyebrow</p>, <h2>title</h2>
 *   2. <p>lede</p>
 */

const EASE = 'cubic-bezier(.2,.8,.1,1)';
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

function scramble(el) {
  // only a heading holding one plain text node is animated (keeps it edit-safe)
  if (el.childNodes.length !== 1 || el.firstChild.nodeType !== Node.TEXT_NODE) return;
  const node = el.firstChild;
  const final = node.textContent;
  const lo = 'abcdefghijklmnopqrstuvwxyz';
  const t0 = performance.now();
  const d = Math.min(1400, 400 + final.length * 22);
  const f = (t) => {
    const k = Math.min(1, (t - t0) / d);
    if (k >= 1) {
      node.textContent = final;
      return;
    }
    let s = '';
    for (let i = 0; i < final.length; i += 1) {
      const c = final[i];
      if (!/[a-z]/i.test(c) || i / final.length < k) s += c;
      else {
        const r = lo[Math.floor(Math.random() * 26)];
        s += c === c.toUpperCase() ? r.toUpperCase() : r;
      }
    }
    node.textContent = s;
    requestAnimationFrame(f);
  };
  requestAnimationFrame(f);
}

export default function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const heading = block.querySelector('h1, h2, h3');
  const ps = [...block.querySelectorAll('p')];
  const num = ps.find((p) => /^\d{1,3}$/.test(p.textContent.trim()));
  const titleCell = cells.find((c) => heading && c.contains(heading)) || cells[0];
  const eyebrow = ps.find((p) => p !== num && titleCell && titleCell.contains(p));
  const lede = ps.filter((p) => p !== num && p !== eyebrow);

  const head = document.createElement('div');
  head.className = 'chapter-head';
  const title = document.createElement('div');
  title.className = 'chapter-title';
  if (num) title.append(wrapNode(num, 'chapter-num'));
  if (eyebrow) title.append(wrapNode(eyebrow, 'chapter-eyebrow'));
  if (heading) title.append(wrapNode(heading, 'chapter-heading'));
  head.append(title);
  if (lede.length) {
    const l = document.createElement('div');
    l.className = 'chapter-lede';
    l.append(...lede);
    head.append(l);
  }
  block.replaceChildren(head);

  const section = block.closest('.section');
  if (section && num && !section.id) section.id = `ch${parseInt(num.textContent, 10)}`;

  if (reduced()) return;
  head.style.opacity = '0';
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    io.unobserve(head);
    head.style.opacity = '';
    head.animate([
      { opacity: 0, transform: 'translateY(48px)' },
      { opacity: 1, transform: 'none' },
    ], {
      duration: 1000, easing: EASE, fill: 'backwards',
    });
  }), { threshold: 0.12 });
  io.observe(head);
  if (heading) {
    const once = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      once.unobserve(heading);
      scramble(heading);
    }), { threshold: 0.6 });
    once.observe(heading);
  }
}
