/**
 * prose — centered text section with serif lead paragraph
 *
 * Authoring rows:
 *   1. Lead paragraph (rendered in serif at larger size)
 *   2..N Body paragraphs
 *
 * @param {Element} block The prose block element
 */
export default async function decorate(block) {
  const wrap = document.createElement('div');
  wrap.className = 'wrap';

  let isFirst = true;

  // Collect from cells — handle both <p>-wrapped and bare text
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    const paragraphs = [...cell.querySelectorAll('p')];
    if (paragraphs.length) {
      paragraphs.forEach((p) => {
        const para = p.cloneNode(true);
        if (isFirst) {
          para.classList.add('prose-lead');
          isFirst = false;
        }
        wrap.append(para);
      });
    } else {
      const text = cell.textContent.trim();
      if (text) {
        const para = document.createElement('p');
        para.textContent = text;
        if (isFirst) {
          para.classList.add('prose-lead');
          isFirst = false;
        }
        wrap.append(para);
      }
    }
  });

  block.replaceChildren(wrap);
}
