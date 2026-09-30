/**
 * opening — the page's lead: a two-line display <h1>, a lede and two CTAs.
 * Template-slotted: authored nodes are MOVED into the prototype layout.
 *
 * Authoring (one cell per row, order-agnostic — decoded by content):
 *   - <h1> headline; use a line break (Shift+Enter) between the two lines
 *   - <p> lede paragraph
 *   - CTA paragraphs: <strong><a> primary, <em><a> secondary
 *
 * Motion: each headline line slides up from a mask (WAAPI), the lede and CTAs
 * fade in after it. Disabled under prefers-reduced-motion.
 */

const EASE = 'cubic-bezier(.2,.8,.1,1)';
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

/**
 * Presentation refinement: groups the heading's own child nodes (split at <br>)
 * into masked line spans. Text nodes are moved, never copied, so textContent is
 * unchanged and the heading keeps its identity.
 */
function splitLines(heading) {
  const groups = [[]];
  [...heading.childNodes].forEach((n) => {
    if (n.nodeName === 'BR') {
      n.remove();
      groups.push([]);
    } else {
      groups[groups.length - 1].push(n);
    }
  });
  const lines = [];
  groups.filter((g) => g.some((n) => n.textContent.trim())).forEach((g) => {
    const mask = document.createElement('span');
    mask.className = 'line';
    const inner = document.createElement('span');
    inner.className = 'line-inner';
    inner.append(...g);
    mask.append(inner);
    heading.append(mask);
    lines.push(inner);
  });
  return lines;
}

export default async function decorate(block) {
  const heading = block.querySelector('h1, h2');
  const ctas = [...block.querySelectorAll('p')].filter((p) => p.querySelector('a'));
  const lede = [...block.querySelectorAll('p')].find((p) => !p.querySelector('a') && p.textContent.trim());

  const layout = document.createElement('div');
  layout.className = 'opening-inner';

  let lines = [];
  if (heading) {
    lines = splitLines(heading);
    layout.append(wrapNode(heading, 'headline'));
  }

  const row = document.createElement('div');
  row.className = 'opening-row';
  if (lede) row.append(wrapNode(lede, 'lede'));
  if (ctas.length) {
    const actions = document.createElement('div');
    actions.className = 'actions';
    actions.append(...ctas);
    row.append(actions);
  }
  if (row.children.length) layout.append(row);

  block.replaceChildren(layout);

  if (!reduced()) {
    lines.forEach((el, i) => el.animate(
      [{ transform: 'translateY(105%)' }, { transform: 'none' }],
      {
        duration: 1200, delay: 120 + i * 140, easing: EASE, fill: 'backwards',
      },
    ));
    [...row.children].forEach((el, i) => el.animate(
      [{ opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: 'none' }],
      {
        duration: 900, delay: 560 + i * 120, easing: EASE, fill: 'backwards',
      },
    ));
  }
}
