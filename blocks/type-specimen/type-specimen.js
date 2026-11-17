/**
 * type-specimen — a variable-font specimen. Over the word, horizontal pointer
 * position sets the weight (100–900) and vertical position sets the width
 * (62–125); left alone both axes drift on slow sine waves. A readout shows the
 * live axis values. Static (wght 400, wdth 100) under reduced motion.
 *
 * Authoring:
 *   1. eyebrow <p>, <h3> title, description <p>
 *   2. the specimen word
 */

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  if (node) w.append(node);
  return w;
}

function axis(name, value) {
  const s = document.createElement('span');
  s.className = 'ts-axis';
  const v = document.createElement('span');
  v.className = 'ts-axis-value';
  v.textContent = value;
  s.append(document.createTextNode(`${name} `), v);
  return [s, v];
}

export default async function decorate(block) {
  const rows = [...block.children];
  const headRow = rows.find((r) => r.querySelector('h1, h2, h3, h4')) || rows[0];
  const specimenRow = rows.find((r) => r !== headRow);
  const heading = headRow ? headRow.querySelector('h1, h2, h3, h4') : null;
  const paras = headRow ? [...headRow.querySelectorAll('p')] : [];
  const eyebrow = heading
    // eslint-disable-next-line no-bitwise
    ? paras.find((p) => heading.compareDocumentPosition(p) & Node.DOCUMENT_POSITION_PRECEDING)
    : null;
  const body = paras.filter((p) => p !== eyebrow);
  const word = specimenRow ? specimenRow.querySelector('p') : null;

  const head = wrapNode(null, 'ts-head');
  const title = wrapNode(null, 'ts-title');
  if (eyebrow) title.append(wrapNode(eyebrow, 'eyebrow'));
  if (heading) title.append(wrapNode(heading, 'headline'));
  head.append(title);
  if (body.length) {
    const b = wrapNode(null, 'ts-body');
    b.append(...body);
    head.append(b);
  }
  const specimen = wrapNode(word, 'ts-specimen');
  const [wgSpan, wg] = axis('wght', '400');
  const [wdSpan, wd] = axis('wdth', '100');
  const readout = wrapNode(null, 'ts-readout');
  readout.append(wgSpan, wdSpan);
  block.replaceChildren(head, specimen, readout);

  const V = {
    w: 400, d: 100, tw: 400, td: 100, active: false, on: false,
  };
  const paint = () => {
    specimen.style.fontVariationSettings = `'wght' ${V.w.toFixed(1)}, 'wdth' ${V.d.toFixed(1)}`;
    wg.textContent = String(Math.round(V.w));
    wd.textContent = String(Math.round(V.d));
  };
  paint();
  if (reduced()) return;

  specimen.addEventListener('pointermove', (e) => {
    const r = specimen.getBoundingClientRect();
    V.tw = 100 + clamp((e.clientX - r.left) / r.width) * 800;
    V.td = 62 + clamp(1 - (e.clientY - r.top) / r.height) * 63;
    V.active = true;
  });
  specimen.addEventListener('pointerleave', () => { V.active = false; });

  let raf = 0;
  const loop = (t) => {
    if (!V.active) {
      V.tw = 500 + Math.sin(t / 1200) * 400;
      V.td = 93 + Math.sin(t / 1700) * 31;
    }
    V.w += (V.tw - V.w) * 0.1;
    V.d += (V.td - V.d) * 0.1;
    paint();
    if (V.on) raf = requestAnimationFrame(loop);
  };
  new IntersectionObserver((entries) => entries.forEach((e) => {
    V.on = e.isIntersecting;
    cancelAnimationFrame(raf);
    if (V.on) raf = requestAnimationFrame(loop);
  })).observe(block);
}
