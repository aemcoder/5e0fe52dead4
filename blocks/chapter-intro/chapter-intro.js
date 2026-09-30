/**
 * chapter-intro block — numbered chapter header with eyebrow, heading, and body text
 *
 * Authoring rows:
 *   1. Chapter number (e.g. "01")
 *   2. Eyebrow (e.g. "Chapter 01 — Scroll as a timeline")
 *   3. h2 heading
 *   4. Body paragraph
 *
 * @param {Element} block The chapter-intro block element
 */
export default function decorate(block) {
  // Flat-collect all authored elements from cells
  const nodes = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    const kids = [...cell.children];
    if (kids.length) {
      nodes.push(...kids);
    } else if (cell.textContent.trim()) {
      // Bare-text cell: wrap in a <p> (move the text nodes, don't copy)
      const p = document.createElement('p');
      p.append(...cell.childNodes);
      nodes.push(p);
    }
  });

  // Classify nodes
  const heading = nodes.find((n) => /^H[1-6]$/.test(n.tagName));
  const paragraphs = nodes.filter((n) => n.tagName === 'P' && n !== heading);

  // The chapter number is the first short non-heading text
  let numNode = null;
  let eyebrowNode = null;
  let bodyNode = null;

  paragraphs.forEach((p) => {
    const txt = p.textContent.trim();
    if (!numNode && /^\d{1,2}$/.test(txt)) {
      numNode = p;
    } else if (!eyebrowNode && txt.toLowerCase().startsWith('chapter')) {
      eyebrowNode = p;
    } else if (!bodyNode && txt.length > 40) {
      bodyNode = p;
    }
  });

  // Fallback: if no explicit eyebrow found, take the short non-num paragraph before heading
  if (!eyebrowNode) {
    eyebrowNode = paragraphs.find((p) => p !== numNode && p !== bodyNode && p.textContent.trim().length < 80);
  }
  if (!bodyNode) {
    bodyNode = paragraphs.find((p) => p !== numNode && p !== eyebrowNode);
  }

  // Build structure
  const wrap = document.createElement('div');
  wrap.className = 'chapter-intro-wrap';

  const grid = document.createElement('div');
  grid.className = 'chapter-intro-grid';

  // Left column
  const left = document.createElement('div');
  left.className = 'chapter-intro-left';

  if (numNode) {
    const numWrap = document.createElement('div');
    numWrap.className = 'chapter-num';
    numWrap.append(numNode);
    left.append(numWrap);
  }

  if (eyebrowNode) {
    const eyeWrap = document.createElement('div');
    eyeWrap.className = 'chapter-eyebrow';
    eyeWrap.append(eyebrowNode);
    left.append(eyeWrap);
  }

  if (heading) {
    const headWrap = document.createElement('div');
    headWrap.className = 'chapter-heading';
    headWrap.append(heading);
    left.append(headWrap);
  }

  grid.append(left);

  // Right column
  if (bodyNode) {
    const right = document.createElement('div');
    right.className = 'chapter-intro-right';
    right.append(bodyNode);
    grid.append(right);
  }

  wrap.append(grid);
  block.replaceChildren(wrap);
}
