/**
 * Essay hero — template-slotted.
 * Authored shape: one cell holding an eyebrow <p>, the <h1>, and a lede <p>.
 * The authored elements are MOVED into the template slots (never copied).
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const h1 = block.querySelector('h1');
  const paragraphs = [...block.querySelectorAll('p')];
  const eyebrow = h1
    ? paragraphs.find((p) => p.compareDocumentPosition(h1) === Node.DOCUMENT_POSITION_FOLLOWING)
    : null;
  const ledes = paragraphs.filter((p) => p !== eyebrow);

  const rings = document.createElement('div');
  rings.className = 'essay-hero-rings';
  rings.setAttribute('aria-hidden', 'true');
  ['ring-1', 'ring-2', 'ring-3'].forEach((name) => {
    const ring = document.createElement('span');
    ring.className = `ring ${name}`;
    rings.append(ring);
  });

  const inner = document.createElement('div');
  inner.className = 'essay-hero-inner';
  const slot = (name) => {
    const el = document.createElement('div');
    el.className = name;
    inner.append(el);
    return el;
  };
  const eyebrowSlot = slot('eyebrow');
  const headlineSlot = slot('headline');
  slot('rule').setAttribute('aria-hidden', 'true');
  const ledeSlot = slot('lede');

  if (eyebrow) eyebrowSlot.append(eyebrow);
  else eyebrowSlot.remove();
  if (h1) headlineSlot.append(h1);
  ledeSlot.append(...ledes);

  block.replaceChildren(rings, inner);
}
