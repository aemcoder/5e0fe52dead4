/**
 * Loads and decorates the media-grid block
 * Displays a grid of media thumbnails (photos or videos) with captions
 * @param {Element} block The media-grid block element
 */
export default async function decorate(block) {
  // Create grid container
  const grid = document.createElement('div');
  grid.className = 'media-grid-list';

  // Process each row as a media card
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length === 0) return;

    // Cell 1: picture/img or video link
    const mediaCell = cells[0];
    let mediaElement = null;

    // Extract media element
    const picture = mediaCell.querySelector('picture');
    const img = mediaCell.querySelector('img');
    const link = mediaCell.querySelector('a');

    if (picture) {
      mediaElement = picture;
    } else if (img) {
      mediaElement = img;
    } else if (link) {
      mediaElement = link;
    }

    // Cell 2: Number + Title (e.g. "04 · Stair core")
    let cardNum = '';
    let cardTitle = '';

    if (cells.length > 1) {
      const metaCell = cells[1];
      const metaText = metaCell.textContent.trim();
      // Try to split by · or the first space
      const parts = metaText.split(/·/).map((s) => s.trim());
      if (parts.length >= 2) {
        cardNum = parts[0];
        cardTitle = parts.slice(1).join('·').trim();
      } else {
        cardTitle = metaText;
      }
    }

    // Cell 3: Type label (e.g. "Photograph" or "Video · plays in view")
    let cardType = '';
    if (cells.length > 2) {
      const typeCell = cells[2];
      cardType = typeCell.textContent.trim();
    }

    // Build the card figure
    const figure = document.createElement('figure');
    figure.className = 'media-grid-card';

    // Create media frame
    const cardMedia = document.createElement('div');
    cardMedia.className = 'media-grid-card-media';

    if (mediaElement) {
      if (mediaElement.tagName === 'PICTURE') {
        cardMedia.append(mediaElement);
      } else if (mediaElement.tagName === 'IMG') {
        cardMedia.append(mediaElement);
      } else if (mediaElement.tagName === 'A') {
        cardMedia.append(mediaElement);
      }
    }

    figure.append(cardMedia);

    // Create caption bar if meta exists
    if (cardNum || cardTitle || cardType) {
      const cardMeta = document.createElement('figcaption');
      cardMeta.className = 'media-grid-card-meta';

      if (cardNum) {
        const numSpan = document.createElement('span');
        numSpan.className = 'media-grid-card-num';
        numSpan.textContent = cardNum;
        cardMeta.append(numSpan);
      }

      if (cardTitle) {
        const titleSpan = document.createElement('span');
        titleSpan.className = 'media-grid-card-title';
        titleSpan.textContent = cardTitle;
        cardMeta.append(titleSpan);
      }

      if (cardType) {
        const typeSpan = document.createElement('span');
        typeSpan.className = 'media-grid-card-type';
        typeSpan.textContent = cardType;
        cardMeta.append(typeSpan);
      }

      figure.append(cardMeta);
    }

    grid.append(figure);
  });

  // Create wrapper with max-width
  const wrap = document.createElement('div');
  wrap.className = 'media-grid-wrap';
  wrap.append(grid);

  // Replace block children
  block.replaceChildren(wrap);
}
