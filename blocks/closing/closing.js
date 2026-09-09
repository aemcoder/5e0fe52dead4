/**
 * closing — dark, centered closing statement band. A decorative dot-in-circle
 * motif and a closing divider are generated; the authored heading + paragraph
 * are MOVED (never rebuilt) so they stay inline-editable.
 *
 * Authoring (one cell):
 *   <h2>closing headline</h2>   — may contain <em>
 *   <p>closing paragraph</p>
 */

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

export default async function decorate(block) {
  const cell = block.querySelector(':scope > div > div') || block;
  const heading = cell.querySelector('h1,h2,h3,h4,h5,h6');
  const para = cell.querySelector('p');

  const inner = document.createElement('div');
  inner.className = 'closing-inner';

  const motif = document.createElement('span');
  motif.className = 'closing-motif';
  motif.setAttribute('aria-hidden', 'true');
  motif.innerHTML = '<span class="closing-dot"></span>';
  inner.append(motif);

  if (heading) inner.append(heading);
  if (para) inner.append(wrapNode(para, 'closing-body'));

  const rule = document.createElement('span');
  rule.className = 'closing-divider';
  rule.setAttribute('aria-hidden', 'true');
  inner.append(rule);

  block.replaceChildren(inner);
}
