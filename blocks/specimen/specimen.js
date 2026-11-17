/**
 * specimen — variable-font specimen: a short note, then one huge word whose
 * weight follows the pointer's x and width its y (both drift on slow sine waves
 * when left alone), with live wght / wdth readouts.
 *
 * Authoring rows:
 *   1. cells: <p>eyebrow</p> + <h3>heading</h3> | <p>note</p>
 *   2. the specimen word, in one paragraph
 */

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

function readout(name, value) {
  const s = document.createElement('span');
  s.append(`${name} `);
  const v = document.createElement('span');
  v.className = 'specimen-value';
  v.textContent = value;
  s.append(v);
  return [s, v];
}

export default function decorate(block) {
  const [headRow, wordRow] = [...block.children];
  const head = document.createElement('div');
  head.className = 'specimen-head';
  if (headRow) {
    const [left, right] = [...headRow.children];
    if (left) {
      const t = document.createElement('div');
      t.className = 'specimen-title';
      const heading = left.querySelector('h2, h3, h4');
      [...left.children].forEach((el) => {
        t.append(wrapNode(el, el === heading ? 'specimen-heading' : 'specimen-eyebrow'));
      });
      head.append(t);
    }
    if (right) {
      const n = document.createElement('div');
      n.className = 'specimen-note';
      n.append(...right.children);
      head.append(n);
    }
  }
  const wordEl = wordRow ? wordRow.querySelector('p') || wordRow.firstElementChild : null;
  const word = wordEl ? wrapNode(wordEl, 'specimen-word') : null;
  const meta = document.createElement('div');
  meta.className = 'specimen-readout';
  meta.setAttribute('aria-hidden', 'true');
  const [wg, wgv] = readout('wght', '400');
  const [wd, wdv] = readout('wdth', '100');
  meta.append(wg, wd);
  block.replaceChildren(head);
  if (word) block.append(word, meta);
  if (!word) return;

  const V = {
    w: 400, d: 100, tw: 400, td: 100, active: false, on: false,
  };
  word.addEventListener('pointermove', (e) => {
    const r = word.getBoundingClientRect();
    V.tw = 100 + clamp((e.clientX - r.left) / r.width) * 800;
    V.td = 62 + clamp(1 - (e.clientY - r.top) / r.height) * 63;
    V.active = true;
  });
  word.addEventListener('pointerleave', () => { V.active = false; });
  new IntersectionObserver((es) => { V.on = es[0].isIntersecting; }).observe(block);
  const tick = (t) => {
    requestAnimationFrame(tick);
    if (!V.on || (reduced() && !V.active)) return;
    if (!V.active) {
      V.tw = 500 + Math.sin(t / 1200) * 400;
      V.td = 93 + Math.sin(t / 1700) * 31;
    }
    V.w += (V.tw - V.w) * 0.1;
    V.d += (V.td - V.d) * 0.1;
    word.style.fontVariationSettings = `'wght' ${V.w.toFixed(1)}, 'wdth' ${V.d.toFixed(1)}`;
    wgv.textContent = Math.round(V.w);
    wdv.textContent = Math.round(V.d);
  };
  requestAnimationFrame(tick);
}
