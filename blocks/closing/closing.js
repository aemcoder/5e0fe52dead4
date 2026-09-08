/**
 * closing — final dark reflection band.
 *
 * Authoring (one cell):
 *   1. <h2> closing statement (use <em> for the accented word)
 *   2. <p>  closing paragraph
 *
 * The circle emblem and the closing rule are generated (decorative).
 */
function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

export default async function decorate(block) {
  const heading = block.querySelector('h2, h3');
  const para = [...block.querySelectorAll('p')].find((p) => p.textContent.trim());

  const inner = document.createElement('div');
  inner.className = 'closing-inner';

  const emblem = document.createElement('div');
  emblem.className = 'closing-emblem';
  emblem.setAttribute('aria-hidden', 'true');
  emblem.innerHTML = '<span></span>';
  inner.append(emblem);

  if (heading) inner.append(wrapNode(heading, 'closing-title'));
  if (para) inner.append(wrapNode(para, 'closing-body'));

  const rule = document.createElement('div');
  rule.className = 'closing-rule';
  rule.setAttribute('aria-hidden', 'true');
  inner.append(rule);

  block.replaceChildren(inner);
}
