/**
 * hero — cinematic dark essay opener (template-slotted, #95)
 *
 * Section schema: eyebrow → headline (h1) → lede, over a dark ground with
 * decorative concentric rings and a hairline rule between headline and lede.
 *
 * Authoring rows (positional, but decoded by query so the consolidated
 * single-cell shape also works):
 *   1. eyebrow — short uppercase kicker <p>
 *   2. headline — <h1> (the page's single <h1>; <em> for the accent word)
 *   3. lede — italic sentence <p>
 *
 * All authored elements are MOVED into slot wrappers (EW1); rings + rule are
 * decorative CSS.
 */
export default async function decorate(block) {
  const heading = block.querySelector('h1, h2');
  const paragraphs = [...block.querySelectorAll('p')];
  // eyebrow = link-free <p> before the heading; lede = <p> after it
  let eyebrow = null;
  let lede = null;
  if (heading) {
    eyebrow = paragraphs.find((p) => heading.compareDocumentPosition(p)
      & Node.DOCUMENT_POSITION_PRECEDING);
    lede = paragraphs.find((p) => heading.compareDocumentPosition(p)
      & Node.DOCUMENT_POSITION_FOLLOWING);
  } else {
    [eyebrow, lede] = paragraphs;
  }

  const stage = document.createElement('div');
  stage.className = 'hero-stage';
  stage.innerHTML = `
    <span class="hero-ring hero-ring-a" aria-hidden="true"></span>
    <span class="hero-ring hero-ring-b" aria-hidden="true"></span>
    <span class="hero-ring hero-ring-c" aria-hidden="true"></span>`;

  const inner = document.createElement('div');
  inner.className = 'hero-inner';

  if (eyebrow) {
    const w = document.createElement('div');
    w.className = 'hero-eyebrow';
    w.append(eyebrow);
    inner.append(w);
  }
  if (heading) {
    const w = document.createElement('div');
    w.className = 'hero-headline';
    w.append(heading);
    inner.append(w);
  }
  const rule = document.createElement('span');
  rule.className = 'hero-rule';
  rule.setAttribute('aria-hidden', 'true');
  inner.append(rule);
  if (lede) {
    const w = document.createElement('div');
    w.className = 'hero-lede';
    w.append(lede);
    inner.append(w);
  }

  stage.append(inner);
  block.replaceChildren(stage);
}
