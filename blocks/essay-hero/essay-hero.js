/**
 * Essay hero — dark full-viewport opening with an eyebrow, the page h1 and an italic lede.
 * Template-slotted: authored elements are MOVED into fixed slots, never rebuilt.
 * Authored shape (one cell, or one row per item): eyebrow <p>, <h1>, lede <p>.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const items = [...block.querySelectorAll(':scope > div > div > *')];
  const heading = items.find((el) => /^H[1-6]$/.test(el.tagName));
  const headingIndex = items.indexOf(heading);
  const before = headingIndex >= 0 ? items.slice(0, headingIndex) : [];
  const after = headingIndex >= 0 ? items.slice(headingIndex + 1) : items;

  const slot = (className) => {
    const el = document.createElement('div');
    el.className = className;
    return el;
  };

  const inner = slot('essay-hero-inner');
  ['ring-a', 'ring-b', 'ring-c'].forEach((ring) => {
    const el = slot(`essay-hero-ring ${ring}`);
    el.setAttribute('aria-hidden', 'true');
    inner.append(el);
  });

  const eyebrow = slot('essay-hero-eyebrow');
  eyebrow.append(...before);
  const headline = slot('essay-hero-headline');
  if (heading) headline.append(heading);
  const rule = slot('essay-hero-rule');
  rule.setAttribute('aria-hidden', 'true');
  const lede = slot('essay-hero-lede');
  lede.append(...after);

  if (before.length) inner.append(eyebrow);
  inner.append(headline, rule);
  if (after.length) inner.append(lede);
  block.replaceChildren(inner);
}
