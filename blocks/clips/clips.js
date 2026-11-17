/**
 * clips — three hover-to-play clips (Plates 11–13).
 *
 * Authoring rows (one per clip):
 *   media cell: poster image; optional .mp4 link (enables hover playback)
 *   text cell:  <p> plate number, <h3> title
 *
 * The "Hover to play" badge only renders when a video exists.
 * @ew-exempt <a> .mp4 source link (media cell) — metadata, consumed into <video src>
 */

function wrap(className, ...nodes) {
  const el = document.createElement('div');
  el.className = className;
  el.append(...nodes);
  return el;
}

function findVideoLink(cell) {
  return [...cell.querySelectorAll('a[href]')].find((a) => /\.(mp4|webm|mov)(\?|#|$)/i.test(a.href));
}

export default async function decorate(block) {
  const list = wrap('clips-list');
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const mediaCell = cells.find((c) => c.querySelector('picture, img, a[href]')) || cells[0];
    const textCell = cells.find((c) => c !== mediaCell) || null;

    const figure = document.createElement('figure');
    figure.className = 'clips-item';
    const media = wrap('clips-media grayscale');
    let video = null;
    if (mediaCell) {
      const pic = mediaCell.querySelector('picture') || mediaCell.querySelector('img');
      const link = findVideoLink(mediaCell);
      if (link) {
        video = document.createElement('video');
        video.preload = 'none';
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.src = link.href;
        const img = pic && (pic.tagName === 'IMG' ? pic : pic.querySelector('img'));
        if (img) video.poster = img.currentSrc || img.src;
        (link.closest('p') || link).remove();
        media.append(video);
        const badge = document.createElement('span');
        badge.className = 'clips-badge';
        badge.textContent = 'Hover to play';
        media.append(badge);
      } else if (pic) media.append(pic);
    }
    figure.append(media);

    if (textCell) {
      const caption = document.createElement('figcaption');
      caption.className = 'clips-caption';
      const heading = textCell.querySelector('h1, h2, h3, h4, h5, h6');
      const num = [...textCell.querySelectorAll('p')].find((p) => !heading
        // eslint-disable-next-line no-bitwise
        || (p.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING));
      if (num) caption.append(wrap('clips-num', num));
      if (heading) caption.append(wrap('clips-title', heading));
      figure.append(caption);
    }

    if (video) {
      figure.classList.add('has-video');
      figure.tabIndex = 0;
      const start = () => {
        video.muted = true;
        const p = video.play();
        if (p) p.catch(() => {});
      };
      const stop = () => video.pause();
      figure.addEventListener('pointerenter', start);
      figure.addEventListener('pointerleave', stop);
      figure.addEventListener('focus', start);
      figure.addEventListener('blur', stop);
      figure.addEventListener('click', () => (video.paused ? start() : stop()));
    }
    list.append(figure);
  });
  block.replaceChildren(list);
}
