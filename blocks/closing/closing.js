/**
 * closing — dark centered coda band
 *
 * Authoring (one cell):
 *   1. <h2> — closing statement (use <em> for the accent word)
 *   2. paragraph — supporting sentence
 *
 * The dot-in-ring emblem above and the divider below are drawn in CSS.
 */

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

export default async function decorate(block) {
  const heading = block.querySelector('h1, h2, h3');
  const paragraph = block.querySelector('p');

  const inner = document.createElement('div');
  inner.className = 'closing-inner';

  const emblem = document.createElement('div');
  emblem.className = 'closing-emblem';
  emblem.setAttribute('aria-hidden', 'true');
  emblem.innerHTML = '<span></span>';
  inner.append(emblem);

  if (heading) inner.append(wrapNode(heading, 'closing-headline'));
  if (paragraph) inner.append(wrapNode(paragraph, 'closing-body'));

  const divider = document.createElement('div');
  divider.className = 'closing-divider';
  divider.setAttribute('aria-hidden', 'true');
  inner.append(divider);

  block.replaceChildren(inner);
}
