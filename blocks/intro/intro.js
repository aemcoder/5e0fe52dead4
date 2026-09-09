/**
 * intro — the opening prose band of the essay (constrained measure; the first
 * paragraph reads as a large serif lead). Authored as a small block rather than
 * bare default content so the constrained/lead typography is reliable regardless
 * of the runtime's section-metadata handling.
 *
 * Authoring (one cell): two or more <p> paragraphs; the first is the lead.
 * Authored paragraphs are MOVED into wrapper divs (never rebuilt/classed) so they
 * stay inline-editable in the Experience Workspace.
 */

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

export default async function decorate(block) {
  const cell = block.querySelector(':scope > div > div') || block;
  const paras = [...cell.querySelectorAll('p')];

  const inner = document.createElement('div');
  inner.className = 'intro-inner';
  paras.forEach((p, i) => inner.append(wrapNode(p, i === 0 ? 'intro-lead' : 'intro-body')));

  block.replaceChildren(inner);
}
