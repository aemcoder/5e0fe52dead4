/**
 * feature-image — full-bleed editorial image band
 *
 * Authoring (one cell):
 *   1. <img> / <picture> — the band image
 *   2. optional caption paragraph — overlaid, italic (use the `caption` variant)
 *
 * Variant: `feature-image caption` adds a dark bottom scrim + overlaid caption.
 */

export default async function decorate(block) {
  const media = block.querySelector('picture, img');
  const caption = [...block.querySelectorAll('p')]
    .find((p) => !p.querySelector('picture, img') && p.textContent.trim());

  const figure = document.createElement('div');
  figure.className = 'feature-image-figure';

  if (media) figure.append(media);

  const overlay = document.createElement('div');
  overlay.className = 'feature-image-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  figure.append(overlay);

  if (caption) {
    const cap = document.createElement('div');
    cap.className = 'feature-image-caption';
    cap.append(caption);
    figure.append(cap);
  }

  block.replaceChildren(figure);
}
