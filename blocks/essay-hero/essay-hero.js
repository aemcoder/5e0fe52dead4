/**
 * essay-hero — full-viewport dark opening band: eyebrow, serif <h1>, a short
 * terracotta rule and an italic lede, over three faint concentric rings.
 *
 * Decode tier: template-slotted (node-slotting). Authored elements are MOVED
 * into slot wrappers; the rings and the rule are decorative, generated here.
 *
 * Authoring (one cell, or one element per row — both are accepted):
 *   - eyebrow paragraph (short line BEFORE the heading)
 *   - <h1> headline (use <em> for the terracotta accent word)
 *   - lede paragraph (AFTER the heading)
 */

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

function collectNodes(block) {
  const out = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    const kids = [...cell.children];
    if (kids.length) out.push(...kids);
    // HARNESS-ONLY fallback (EW5): bare text cell — wrap the existing text nodes.
    else if (cell.textContent.trim()) {
      const p = document.createElement('p');
      p.append(...cell.childNodes);
      out.push(p);
    }
  });
  return out;
}

export default async function decorate(block) {
  const nodes = collectNodes(block);
  const heading = nodes.find((n) => /^H[1-6]$/.test(n.tagName));
  const headingIdx = nodes.indexOf(heading);
  const before = nodes.filter((n, i) => n.tagName === 'P' && (headingIdx < 0 || i < headingIdx));
  const after = nodes.filter((n, i) => n.tagName === 'P' && headingIdx >= 0 && i > headingIdx);

  const rings = document.createElement('div');
  rings.className = 'rings';
  rings.setAttribute('aria-hidden', 'true');
  ['ring-a', 'ring-b', 'ring-c'].forEach((c) => {
    const r = document.createElement('span');
    r.className = c;
    rings.append(r);
  });

  const inner = document.createElement('div');
  inner.className = 'inner';
  if (before.length) {
    const eyebrow = document.createElement('div');
    eyebrow.className = 'eyebrow';
    eyebrow.append(...before);
    inner.append(eyebrow);
  }
  if (heading) inner.append(wrapNode(heading, 'headline'));
  const rule = document.createElement('span');
  rule.className = 'rule';
  rule.setAttribute('aria-hidden', 'true');
  inner.append(rule);
  if (after.length) {
    const lede = document.createElement('div');
    lede.className = 'lede';
    lede.append(...after);
    inner.append(lede);
  }

  block.replaceChildren(rings, inner);
}
