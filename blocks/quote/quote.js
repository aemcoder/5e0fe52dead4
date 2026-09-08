export default async function decorate(block) {
  const wrap = document.createElement('div');
  wrap.className = 'quote-wrap';

  // Decorative quote mark
  const mark = document.createElement('div');
  mark.className = 'quote-mark';
  mark.setAttribute('aria-hidden', 'true');
  mark.textContent = '"';
  wrap.append(mark);

  // Find blockquote and attribution
  const bq = block.querySelector('blockquote');
  const allPs = [...block.querySelectorAll('p')];
  // Attribution: a <p> that starts with a dash/em-dash
  const attribution = allPs.find(p => /^[—–\-―]/.test(p.textContent.trim()));

  if (bq) {
    const bqWrap = document.createElement('div');
    bqWrap.className = 'quote-text';
    bqWrap.append(bq);
    wrap.append(bqWrap);
  } else {
    // Fallback: find the longest <p> that's not the attribution
    const textP = allPs.find(p => p !== attribution);
    if (textP) {
      const bqEl = document.createElement('blockquote');
      bqEl.append(...textP.childNodes);
      const bqWrap = document.createElement('div');
      bqWrap.className = 'quote-text';
      bqWrap.append(bqEl);
      wrap.append(bqWrap);
      textP.remove();
    }
  }

  if (attribution) {
    const attrWrap = document.createElement('div');
    attrWrap.className = 'quote-attribution';
    attrWrap.append(attribution);
    wrap.append(attrWrap);
  }

  block.replaceChildren(wrap);
}
