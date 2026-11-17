/**
 * type-specimen — variable-font specimen driven by the pointer
 * (x → weight 100–900, y → width 62–125); idles on slow sine waves.
 *
 * Authoring rows:
 *   1. head cell: <p> eyebrow, <h3> title, <p> description
 *   2. specimen cell: <p> the specimen word ("Archivo")
 */

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

function wrap(className, ...nodes) {
  const el = document.createElement('div');
  el.className = className;
  el.append(...nodes);
  return el;
}

export default async function decorate(block) {
  const rows = [...block.children];
  const headCell = rows[0] ? rows[0].firstElementChild : null;
  const wordCell = rows[1] ? rows[1].firstElementChild : null;

  const head = wrap('type-specimen-head');
  if (headCell) {
    const heading = headCell.querySelector('h1, h2, h3, h4, h5, h6');
    const ps = [...headCell.querySelectorAll('p')];
    // eslint-disable-next-line no-bitwise
    const before = (p) => heading && (p.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING);
    const eyebrow = ps.filter((p) => before(p));
    const lede = ps.filter((p) => !before(p));
    const title = wrap('type-specimen-headline');
    if (eyebrow.length) title.append(wrap('type-specimen-eyebrow', ...eyebrow));
    if (heading) title.append(wrap('type-specimen-title', heading));
    head.append(title);
    if (lede.length) head.append(wrap('type-specimen-lede', ...lede));
  }

  const word = wrap('type-specimen-word');
  const wordP = wordCell ? wordCell.querySelector('p') : null;
  if (wordP) word.append(wordP);

  const readout = wrap('type-specimen-readout');
  readout.setAttribute('aria-hidden', 'true');
  const mk = (label) => {
    const s = document.createElement('span');
    const v = document.createElement('span');
    v.className = 'type-specimen-value';
    s.append(`${label} `, v);
    readout.append(s);
    return v;
  };
  const wg = mk('wght');
  const wd = mk('wdth');

  block.replaceChildren(head, word, readout);

  const V = {
    w: 400, d: 100, tw: 400, td: 100, active: false,
  };
  const apply = () => {
    word.style.fontVariationSettings = `'wght' ${V.w.toFixed(1)}, 'wdth' ${V.d.toFixed(1)}`;
    wg.textContent = Math.round(V.w);
    wd.textContent = Math.round(V.d);
  };
  apply();

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

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
    apply();
    raf = requestAnimationFrame(tick);
  };
  new IntersectionObserver(([entry]) => {
    cancelAnimationFrame(raf);
    if (entry.isIntersecting) raf = requestAnimationFrame(tick);
  }).observe(word);
}
