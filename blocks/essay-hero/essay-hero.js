/**
 * essay-hero — full-viewport dark opening band of the essay.
 * Decode tier: template-slotted (fixed composition; authored nodes are MOVED
 * into layout wrappers, never rebuilt — Experience Workspace stays editable).
 *
 * Authoring (one cell, or one element per row — both shapes work):
 *   - eyebrow paragraph (short line BEFORE the heading)
 *   - <h1> headline — wrap the accent word in <em>
 *   - lede paragraph (sentence AFTER the heading)
 * Decorative rings and the hairline rule are generated (aria-hidden).
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
    let kids = [...cell.children];
    if (kids.length === 1 && kids[0].tagName === 'P' && kids[0].querySelector('picture, img')) {
      kids = [...kids[0].childNodes].filter((n) => n.nodeType === 1);
    }
    if (kids.length) out.push(...kids);
    else if (cell.textContent.trim()) {
      // harness-only fallback: wrap existing text nodes (never fires on DA content)
      const p = document.createElement('p');
      p.append(...cell.childNodes);
      out.push(p);
    }
  });
  return out;
}

export default function decorate(block) {
  const nodes = collectNodes(block);
  const heading = nodes.find((n) => /^H[1-6]$/.test(n.tagName));
  const headingIndex = heading ? nodes.indexOf(heading) : -1;
  const texts = nodes.filter((n) => n.tagName === 'P' && n.textContent.trim());
  const eyebrows = headingIndex >= 0 ? texts.filter((p) => nodes.indexOf(p) < headingIndex) : [];
  const ledes = texts.filter((p) => !eyebrows.includes(p));

  const inner = document.createElement('div');
  inner.className = 'essay-hero-inner';

  const rings = document.createElement('div');
  rings.className = 'essay-hero-rings';
  rings.setAttribute('aria-hidden', 'true');
  rings.innerHTML = '<span class="ring ring-tr"></span><span class="ring ring-bl"></span><span class="ring ring-center"></span>';

  if (eyebrows.length) {
    const eyebrow = document.createElement('div');
    eyebrow.className = 'eyebrow';
    eyebrow.append(...eyebrows);
    inner.append(eyebrow);
  }
  if (heading) inner.append(wrapNode(heading, 'headline'));

  const rule = document.createElement('div');
  rule.className = 'essay-hero-rule';
  rule.setAttribute('aria-hidden', 'true');
  inner.append(rule);

  if (ledes.length) {
    const lede = document.createElement('div');
    lede.className = 'lede';
    lede.append(...ledes);
    inner.append(lede);
  }

  block.replaceChildren(rings, inner);
}
