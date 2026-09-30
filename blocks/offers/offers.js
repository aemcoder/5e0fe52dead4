/**
 * Offers — image tiles with a dark gradient, tag, title and "view offer" link.
 * The section head (eyebrow, h2, "all offers" link) is default content in the
 * same section and is styled in place by this block's CSS.
 *
 * Authoring: one row per offer, two cells:
 *   [picture (optional)] | [<p>Tag</p> <h3>Title</h3> <p><a href="…">View offer</a></p>]
 */
function div(className) {
  const el = document.createElement('div');
  el.className = className;
  return el;
}

export default function decorate(block) {
  [...block.children].forEach((row) => {
    const link = row.querySelector('a[href]');
    const picture = row.querySelector('picture');
    const elements = [...row.querySelectorAll(':scope > div > *')];
    const heading = elements.find((el) => /^H[2-6]$/.test(el.tagName));
    const headingIndex = elements.indexOf(heading);

    const card = document.createElement(link ? 'a' : 'div');
    card.className = 'offers-card';
    if (link) card.href = link.href;

    const media = div('offers-media');
    if (picture) {
      const holder = picture.parentElement;
      media.append(picture);
      if (holder?.tagName === 'P' && !holder.textContent.trim()) holder.remove();
    }
    const overlay = div('offers-overlay');
    overlay.setAttribute('aria-hidden', 'true');
    const content = div('offers-content');

    elements.forEach((el, i) => {
      if (!el.isConnected || el.contains(media) || !el.textContent.trim()) return;
      if (link && el.contains(link)) {
        el.classList.add('offers-more');
        el.classList.remove('button-wrapper');
        link.replaceWith(...link.childNodes);
      } else if (heading && i < headingIndex) {
        el.classList.add('offers-tag');
      }
      content.append(el);
    });

    card.append(media, overlay, content);
    row.replaceWith(card);
  });
}
