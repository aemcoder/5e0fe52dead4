/**
 * hero — dark cinematic opening band: concentric rings, eyebrow, headline,
 * a drawn rule and an italic lede. Template-slotted (authored nodes are MOVED).
 *
 * Authoring (one cell, or one element per row — both decode the same):
 *   - eyebrow paragraph (short label, before the heading)
 *   - <h1> headline — use <em> for the accent word
 *   - lede paragraph (after the heading)
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
    else if (cell.textContent.trim()) {
      // harness-only fallback: wrap the existing text nodes (never copy text)
      const p = document.createElement('p');
      p.append(...cell.childNodes);
      out.push(p);
    }
  });
  return out;
}

export default async function decorate(block) {
  const nodes = collectNodes(block);
  const headingIdx = nodes.findIndex((n) => /^H[1-6]$/.test(n.tagName));
  const heading = headingIdx >= 0 ? nodes[headingIdx] : null;
  const before = headingIdx >= 0 ? nodes.slice(0, headingIdx) : [];
  const after = headingIdx >= 0 ? nodes.slice(headingIdx + 1) : nodes;

  const inner = document.createElement('div');
  inner.className = 'hero-inner';

  const rings = ['ring-a', 'ring-b', 'ring-c'].map((cls) => {
    const ring = document.createElement('div');
    ring.className = `ring ${cls}`;
    ring.setAttribute('aria-hidden', 'true');
    return ring;
  });

  if (before.length) {
    const eyebrow = document.createElement('div');
    eyebrow.className = 'eyebrow';
    eyebrow.append(...before);
    inner.append(eyebrow);
  }
  if (heading) inner.append(wrapNode(heading, 'headline'));

  const rule = document.createElement('div');
  rule.className = 'rule';
  rule.setAttribute('aria-hidden', 'true');
  inner.append(rule);

  if (after.length) {
    const lede = document.createElement('div');
    lede.className = 'lede';
    lede.append(...after);
    inner.append(lede);
  }

  block.replaceChildren(...rings, inner);
}
