/**
 * intro — narrow essay opening prose
 *
 * Authoring (default content in one cell):
 *   1. lead paragraph — large serif opener
 *   2..N. body paragraphs — sans-serif supporting copy
 */

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

export default async function decorate(block) {
  const paragraphs = [...block.querySelectorAll('p')];
  if (!paragraphs.length) return;

  const inner = document.createElement('div');
  inner.className = 'intro-inner';

  paragraphs.forEach((p, i) => {
    inner.append(wrapNode(p, i === 0 ? 'intro-lead' : 'intro-body'));
  });

  block.replaceChildren(inner);
}
