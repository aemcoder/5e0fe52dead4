/**
 * quote — a centred pull-quote band on the deep forest ground.
 *
 * Schema roles:
 *   quote        <p>  the quotation (row 1)
 *   attribution  <p>  who said it (row 2, optional)
 *
 * The oversized opening quote mark is presentation and is generated here.
 * The authored quotation paragraph is MOVED into a generated <blockquote>, so
 * the markup is semantic while the paragraph itself stays inline-editable.
 */

/**
 * Collects the authored elements of a block regardless of how the delivery
 * pipeline distributed them across rows and cells.
 * @param {Element} block the block element
 * @returns {Element[]} the authored elements, in document order
 */
function collectNodes(block) {
  const out = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    const kids = [...cell.children];
    if (kids.length) {
      out.push(...kids);
    } else if (cell.textContent.trim()) {
      // harness-only fallback: an unwrapped text cell
      const p = document.createElement('p');
      p.append(...cell.childNodes);
      out.push(p);
    }
  });
  return out.length ? out : [...block.children];
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const nodes = collectNodes(block).filter((n) => n.textContent.trim());
  if (!nodes.length) return;

  const [quoted, attribution] = nodes;

  const inner = document.createElement('div');
  inner.className = 'quote-inner';

  const mark = document.createElement('span');
  mark.className = 'quote-mark';
  mark.setAttribute('aria-hidden', 'true');
  mark.textContent = '"';
  inner.append(mark);

  if (quoted) {
    const blockquote = document.createElement('blockquote');
    blockquote.className = 'quote-text';
    blockquote.append(quoted);
    inner.append(blockquote);
  }

  if (attribution) {
    const cite = document.createElement('div');
    cite.className = 'quote-attribution';
    cite.append(attribution);
    inner.append(cite);
  }

  block.replaceChildren(inner);
}
