/**
 * closing — dark centered coda ("The good life isn't the expensive life...").
 *
 * Authoring: one cell with an <h2> (use <em> for the accent word) and a <p>.
 * The circle-dot ornament and the closing rule are decorative CSS; authored
 * nodes are MOVED into wrappers (EW1/EW2).
 */
export default async function decorate(block) {
  const heading = block.querySelector('h2, h3');
  const body = [...block.querySelectorAll('p')].find((p) => p.textContent.trim());

  const inner = document.createElement('div');
  inner.className = 'closing-inner';

  const dot = document.createElement('span');
  dot.className = 'closing-dot';
  dot.setAttribute('aria-hidden', 'true');
  inner.append(dot);

  if (heading) {
    const w = document.createElement('div');
    w.className = 'closing-headline';
    w.append(heading);
    inner.append(w);
  }
  if (body) {
    const w = document.createElement('div');
    w.className = 'closing-body';
    w.append(body);
    inner.append(w);
  }

  const rule = document.createElement('span');
  rule.className = 'closing-rule';
  rule.setAttribute('aria-hidden', 'true');
  inner.append(rule);

  block.replaceChildren(inner);
}
