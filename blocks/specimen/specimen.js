/**
 * specimen — a variable-font specimen. Over the word, horizontal pointer
 * position sets the weight axis (100–900) and vertical position the width
 * axis (62–125); left alone both drift on slow sine waves. Live axis values
 * are read out underneath.
 *
 * Authoring:
 *   row 1: kicker paragraph, <h3> title, description paragraph
 *   row 2: the specimen word (one short paragraph)
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

function readout(name, value) {
  const s = document.createElement('span');
  s.textContent = `${name} `;
  const v = document.createElement('span');
  v.className = 'value';
  v.textContent = value;
  s.append(v);
  return [s, v];
}

export default async function decorate(block) {
  const rows = [...block.children];
  const heading = block.querySelector('h2, h3, h4');
  const headRow = (heading && rows.find((r) => r.contains(heading))) || rows[0];
  const headPs = headRow ? [...headRow.querySelectorAll('p')] : [];
  // eslint-disable-next-line no-bitwise
  const before = (p) => heading && (p.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING);
  const kicker = headPs.find((p) => before(p));
  const lede = headPs.filter((p) => p !== kicker);
  const wordRow = rows.find((r) => r !== headRow);
  const wordP = wordRow?.querySelector('p');

  const head = document.createElement('div');
  head.className = 'specimen-head';
  const title = document.createElement('div');
  title.className = 'specimen-title';
  if (kicker) title.append(wrapNode(kicker, 'eyebrow'));
  if (heading) title.append(wrapNode(heading, 'headline'));
  head.append(title);
  if (lede.length) {
    const l = document.createElement('div');
    l.className = 'lede';
    l.append(...lede);
    head.append(l);
  }

  const word = document.createElement('div');
  word.className = 'word';
  if (wordP) word.append(wordP);

  const axes = document.createElement('div');
  axes.className = 'axes';
  axes.setAttribute('aria-hidden', 'true');
  const [wg, wgv] = readout('wght', '400');
  const [wd, wdv] = readout('wdth', '100');
  axes.append(wg, wd);

  block.replaceChildren(head, word, axes);
  if (reduced()) return;
  reveal(head);

  const V = {
    w: 400, d: 100, tw: 400, td: 100, active: false,
  };
  word.addEventListener('pointermove', (e) => {
    const r = word.getBoundingClientRect();
    V.tw = 100 + clamp((e.clientX - r.left) / r.width) * 800;
    V.td = 62 + clamp(1 - (e.clientY - r.top) / r.height) * 63;
    V.active = true;
  });
  word.addEventListener('pointerleave', () => { V.active = false; });

  let raf = 0;
  const tick = (t) => {
    if (!V.active) {
      V.tw = 500 + Math.sin(t / 1200) * 400;
      V.td = 93 + Math.sin(t / 1700) * 31;
    }
    V.w += (V.tw - V.w) * 0.1;
    V.d += (V.td - V.d) * 0.1;
    word.style.fontVariationSettings = `'wght' ${V.w.toFixed(1)}, 'wdth' ${V.d.toFixed(1)}`;
    wgv.textContent = String(Math.round(V.w));
    wdv.textContent = String(Math.round(V.d));
    raf = requestAnimationFrame(tick);
  };
  new IntersectionObserver((entries) => entries.forEach((entry) => {
    cancelAnimationFrame(raf);
    if (entry.isIntersecting) raf = requestAnimationFrame(tick);
  })).observe(word);
}
