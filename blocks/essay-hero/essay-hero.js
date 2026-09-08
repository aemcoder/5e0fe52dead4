/**
 * essay-hero — cinematic full-height dark hero for the essay.
 *
 * Authoring (one cell, in order):
 *   1. eyebrow  — short label paragraph (before the heading)
 *   2. heading  — the page's single <h1> (use <em> for the accented word)
 *   3. lede     — italic subtitle paragraph (after the heading)
 *
 * Decorative rings are generated (CSS), not authored. Authored elements are
 * MOVED into layout wrappers so they stay inline-editable.
 */
function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

export default async function decorate(block) {
  const heading = block.querySelector('h1, h2, h3');
  const ps = [...block.querySelectorAll('p')];

  let eyebrow = null;
  let lede = null;
  ps.forEach((p) => {
    // eslint-disable-next-line no-bitwise
    const precedesHeading = heading
      && (heading.compareDocumentPosition(p) & Node.DOCUMENT_POSITION_PRECEDING);
    if (precedesHeading && !eyebrow) eyebrow = p;
    else if (!lede) lede = p;
  });

  const inner = document.createElement('div');
  inner.className = 'hero-inner';

  if (eyebrow) inner.append(wrapNode(eyebrow, 'hero-eyebrow'));
  if (heading) inner.append(wrapNode(heading, 'hero-title'));

  const divider = document.createElement('div');
  divider.className = 'hero-divider';
  divider.setAttribute('aria-hidden', 'true');
  inner.append(divider);

  if (lede) inner.append(wrapNode(lede, 'hero-lede'));

  // decorative rings (aria-hidden)
  const rings = ['ring-a', 'ring-b', 'ring-c'].map((c) => {
    const r = document.createElement('div');
    r.className = `hero-ring ${c}`;
    r.setAttribute('aria-hidden', 'true');
    return r;
  });

  block.replaceChildren(...rings, inner);
}
