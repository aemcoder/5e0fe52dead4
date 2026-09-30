/**
 * loads and decorates the closing block
 * @param {Element} block The closing block element
 */
export default async function decorate(block) {
  // Collect all rows
  const rows = [...block.children];

  // Extract heading and CTA paragraphs
  let headingEl = null;
  const ctaElements = [];

  rows.forEach((row) => {
    const div = row.querySelector(':scope > div');
    if (!div) return;

    const heading = div.querySelector('h2, h3');
    const paragraphs = [...div.querySelectorAll('p')];

    if (heading && !headingEl) {
      headingEl = heading;
    }

    paragraphs.forEach((p) => {
      ctaElements.push(p);
    });
  });

  // Clear the block
  block.innerHTML = '';

  // Create wrapper
  const wrap = document.createElement('div');
  wrap.className = 'closing-wrap';

  // Create headline wrapper
  if (headingEl) {
    const headline = document.createElement('div');
    headline.className = 'closing-headline';
    headline.append(headingEl);
    wrap.append(headline);
  }

  // Create actions wrapper
  if (ctaElements.length) {
    const actions = document.createElement('div');
    actions.className = 'closing-actions';
    ctaElements.forEach((el) => {
      actions.append(el);
    });
    wrap.append(actions);
  }

  block.append(wrap);

  // Create marquee only if animation is preferred
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    createMarquee(block);
  }
}

/**
 * Creates a decorative marquee ticker at the bottom of the closing section
 * @param {Element} block The closing block element
 */
function createMarquee(block) {
  const marquee = document.createElement('div');
  marquee.className = 'closing-marquee';

  const track = document.createElement('div');
  track.className = 'closing-marquee-track';

  // Create repeating content: "Field Guide · The page moves · Field Guide · The page moves ..."
  const texts = ['Field Guide', 'The page moves'];
  const separator = '·';
  const repeatCount = 6; // Repeat enough times to fill and scroll

  let content = '';
  for (let i = 0; i < repeatCount; i++) {
    texts.forEach((text, idx) => {
      if (i > 0 || idx > 0) content += ` ${separator} `;
      content += text;
    });
  }

  track.textContent = content;
  marquee.append(track);
  block.append(marquee);
}
