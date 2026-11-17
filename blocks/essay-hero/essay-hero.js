/**
 * essay-hero — full-viewport dark opening: eyebrow, headline, drawn rule, italic lede.
 * Template-slotted: the authored nodes MOVE into fixed layout wrappers.
 *
 * Authoring (one cell, in order):
 *   1. eyebrow paragraph (short line before the heading)
 *   2. <h1> headline — <em> marks the accent word
 *   3. lede paragraph (after the heading)
 */

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

function ornament(className) {
  const d = document.createElement('div');
  d.className = className;
  d.setAttribute('aria-hidden', 'true');
  return d;
}

export default function decorate(block) {
  const heading = block.querySelector('h1, h2');
  const paras = [...block.querySelectorAll('p')];
  if (!heading && !paras.length) return;

  // eyebrow = text before the heading; lede = text after it (#51)
  const before = (p) => heading
    // eslint-disable-next-line no-bitwise
    && (p.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING);
  const eyebrow = paras.find((p) => before(p));
  const ledes = paras.filter((p) => p !== eyebrow);

  const stage = document.createElement('div');
  stage.className = 'stage';
  if (eyebrow) stage.append(wrapNode(eyebrow, 'eyebrow'));
  if (heading) stage.append(wrapNode(heading, 'headline'));
  stage.append(ornament('rule'));
  if (ledes.length) {
    const lede = document.createElement('div');
    lede.className = 'lede';
    lede.append(...ledes);
    stage.append(lede);
  }

  block.replaceChildren(
    ornament('ring ring-top'),
    ornament('ring ring-bottom'),
    ornament('ring ring-center'),
    stage,
  );
}
