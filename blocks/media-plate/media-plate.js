/**
 * Loads and decorates the media-plate block
 * Displays a single photograph or video with a caption bar underneath
 * @param {Element} block The media-plate block element
 */
export default async function decorate(block) {
  // Collect all nodes from the block cells
  const nodes = [];
  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      [...cell.children].forEach((node) => {
        nodes.push(node);
      });
    });
  });

  // Extract media (picture/img or video link), left caption, right caption
  let mediaElement = null;
  let leftCaption = '';
  let rightCaption = '';

  nodes.forEach((node, index) => {
    if (node.tagName === 'PICTURE') {
      mediaElement = node;
    } else if (node.tagName === 'IMG' && !mediaElement) {
      mediaElement = node;
    } else if (node.tagName === 'P' && node.querySelector('a')) {
      // Video link (treat as media)
      const link = node.querySelector('a');
      const href = link.getAttribute('href');
      if (href && (href.includes('youtube') || href.includes('vimeo') || href.endsWith('.mp4'))) {
        mediaElement = node;
      } else if (!leftCaption) {
        leftCaption = node.textContent.trim();
      } else if (!rightCaption) {
        rightCaption = node.textContent.trim();
      }
    } else if (node.tagName === 'P') {
      if (!leftCaption) {
        leftCaption = node.textContent.trim();
      } else if (!rightCaption) {
        rightCaption = node.textContent.trim();
      }
    }
  });

  // Build the figure structure
  const figure = document.createElement('figure');
  figure.className = 'media-plate-figure';

  // Create media frame
  const mediaFrame = document.createElement('div');
  mediaFrame.className = 'media-plate-frame';

  // Move media into frame
  if (mediaElement) {
    if (mediaElement.tagName === 'PICTURE') {
      mediaFrame.append(mediaElement);
    } else if (mediaElement.tagName === 'IMG') {
      mediaFrame.append(mediaElement);
    } else if (mediaElement.tagName === 'P') {
      // Video link - extract and create video iframe or embed
      const link = mediaElement.querySelector('a');
      const href = link.getAttribute('href');
      // For now, append the link as-is; styling will handle it
      mediaFrame.append(mediaElement);
    }
  }

  figure.append(mediaFrame);

  // Create caption bar if any caption exists
  if (leftCaption || rightCaption) {
    const caption = document.createElement('figcaption');
    caption.className = 'media-plate-caption';

    const leftSpan = document.createElement('span');
    leftSpan.className = 'media-plate-caption-left';
    leftSpan.textContent = leftCaption;
    caption.append(leftSpan);

    const rightSpan = document.createElement('span');
    rightSpan.className = 'media-plate-caption-right';
    rightSpan.textContent = rightCaption;
    caption.append(rightSpan);

    figure.append(caption);
  }

  // Wrap in container
  const wrap = document.createElement('div');
  wrap.className = 'media-plate-wrap';
  wrap.append(figure);

  // Replace block children
  block.replaceChildren(wrap);
}
