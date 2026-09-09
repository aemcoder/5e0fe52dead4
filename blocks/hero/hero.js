/**
 * hero — cinematic full-height opening band for the "Simply Enough" essay.
 *
 * Authoring (one cell, flat siblings):
 *   <p>eyebrow</p>            — short kicker above the title
 *   <h1>headline</h1>         — the page's single &lt;h1&gt; (may contain <em>)
 *   <p>lede</p>               — italic sub-line under the title
 *
 * Authored elements are MOVED into wrapper divs (never rebuilt/retagged) so they
 * stay inline-editable in the Experience Workspace; the wrappers carry the layout
 * classes. A decorative divider + rings are generated.
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
      // harness-only fallback: wrap a bare text node
      const p = document.createElement('p');
      p.append(...cell.childNodes);
      out.push(p);
    }
  });
  return out.length ? out : [...block.children];
}

export default async function decorate(block) {
  const nodes = collectNodes(block);
  const heading = nodes.find((n) => /^H[1-6]$/.test(n.tagName));
  const paras = nodes.filter((n) => n.tagName === 'P');
  // eslint-disable-next-line no-bitwise
  const eyebrow = heading
    ? paras.find((p) => heading.compareDocumentPosition(p) & Node.DOCUMENT_POSITION_PRECEDING)
    : paras[0];
  const lede = paras.find((p) => p !== eyebrow);

  const stage = document.createElement('div');
  stage.className = 'hero-stage';

  // decorative rings (drawn in CSS)
  ['ring ring-a', 'ring ring-b', 'ring ring-c'].forEach((cls) => {
    const ring = document.createElement('span');
    ring.className = cls;
    ring.setAttribute('aria-hidden', 'true');
    stage.append(ring);
  });

  const inner = document.createElement('div');
  inner.className = 'hero-inner';

  if (eyebrow) inner.append(wrapNode(eyebrow, 'hero-eyebrow'));
  if (heading) inner.append(heading);

  const rule = document.createElement('span');
  rule.className = 'hero-divider';
  rule.setAttribute('aria-hidden', 'true');
  inner.append(rule);

  if (lede) inner.append(wrapNode(lede, 'hero-lede'));

  stage.append(inner);
  block.replaceChildren(stage);
}
