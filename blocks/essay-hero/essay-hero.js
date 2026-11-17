/**
 * essay-hero — full-viewport dark opening of the essay: eyebrow, headline, rule, lede,
 * with three decorative rings behind. Template-slotted (#95): the authored nodes are
 * MOVED into fixed slots; the rings and the rule are presentational CSS-only elements.
 *
 * Authoring (one cell, flat siblings, in order):
 *   1. eyebrow — short paragraph before the heading ("An essay on intentional living")
 *   2. headline — the page's single <h1>; accent word in <em>
 *   3. lede — sentence-length paragraph after the heading
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
    // HARNESS-ONLY fallback (EW5): wrap bare text nodes, never synthesize from textContent
    else if (cell.textContent.trim()) {
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
  const idx = heading ? nodes.indexOf(heading) : -1;
  const before = idx >= 0 ? nodes.slice(0, idx) : [];
  const after = idx >= 0 ? nodes.slice(idx + 1) : nodes;

  const stage = document.createElement('div');
  stage.className = 'stage';

  ['ring ring-a', 'ring ring-b', 'ring ring-c'].forEach((cls) => {
    const ring = document.createElement('div');
    ring.className = cls;
    ring.setAttribute('aria-hidden', 'true');
    stage.append(ring);
  });

  const content = document.createElement('div');
  content.className = 'content';
  before.forEach((n) => content.append(wrapNode(n, 'eyebrow')));
  if (heading) {
    content.append(wrapNode(heading, 'headline'));
    const rule = document.createElement('div');
    rule.className = 'rule';
    rule.setAttribute('aria-hidden', 'true');
    content.append(rule);
  }
  after.forEach((n) => content.append(wrapNode(n, 'lede')));

  stage.append(content);
  block.replaceChildren(stage);
}
