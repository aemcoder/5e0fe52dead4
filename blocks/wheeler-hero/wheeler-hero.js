/**
 * Wheeler hero — template-slotted (Step 2b). Dark jobsite hero with a promo
 * ribbon, the page <h1>, a lede and two CTAs.
 *
 * Authoring (one cell, flat siblings — any row split also works):
 *   - optional <picture>           background photo (ink + scrim when absent)
 *   - <p> before the <h1>, no link  ribbon tag      e.g. "Demo Days '26"
 *   - <p> before the <h1>, w/ link  ribbon message  (<strong> date, text, bare <a>)
 *   - <h1>                          headline — <em> marks the yellow word
 *   - <p> after the <h1>, no link   lede
 *   - <p><strong><a></p>            primary CTA   (yellow)
 *   - <p><em><a></p>                secondary CTA (ghost-light)
 */

// ── Experience Workspace helpers (EW1–EW4) ──
function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

/**
 * Flatten every cell into its authored element nodes (DA flattened contract, #62/#104).
 * @param {Element} block
 * @returns {Element[]}
 */
function collectNodes(block) {
  const out = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    let kids = [...cell.children];
    if (kids.length === 1 && kids[0].tagName === 'P' && kids[0].children.length
      && kids[0].querySelector('picture, img')) {
      kids = [...kids[0].childNodes].map((n) => {
        if (n.nodeType === 1) return n;
        // HARNESS-ONLY fallback (EW5): bare text beside a picture; never fires on DA content.
        if (n.textContent.trim()) {
          const p = document.createElement('p');
          p.append(n);
          return p;
        }
        return null;
      }).filter(Boolean);
    }
    if (kids.length) out.push(...kids);
    else if (cell.textContent.trim()) {
      // HARNESS-ONLY fallback (EW5): bare text cell; move the text nodes, never copy them.
      const p = document.createElement('p');
      p.append(...cell.childNodes);
      out.push(p);
    }
  });
  return out;
}

export default function decorate(block) {
  const nodes = collectNodes(block);
  const h1 = nodes.find((n) => /^H[1-6]$/.test(n.tagName));
  const h1Index = h1 ? nodes.indexOf(h1) : nodes.length;

  const media = document.createElement('div');
  media.className = 'hero-media';
  const scrim = document.createElement('div');
  scrim.className = 'hero-scrim';
  const inner = document.createElement('div');
  inner.className = 'hero-inner';

  const ribbon = document.createElement('div');
  ribbon.className = 'promo-ribbon';
  const headline = document.createElement('div');
  headline.className = 'headline';
  const lede = document.createElement('div');
  lede.className = 'lede';
  const actions = document.createElement('div');
  actions.className = 'actions';

  nodes.forEach((node, i) => {
    const picture = node.matches('picture, img') ? node : node.querySelector('picture, img');
    if (picture && !node.textContent.trim()) {
      media.append(node);
      return;
    }
    if (node === h1) {
      headline.append(node);
      return;
    }
    const link = node.querySelector('a[href]');
    if (i < h1Index) {
      if (link) ribbon.append(wrapNode(node, 'ribbon-body'));
      else ribbon.prepend(wrapNode(node, 'ribbon-tag'));
      return;
    }
    if (node.classList.contains('button-wrapper') || (link && node.textContent.trim() === link.textContent.trim())) {
      actions.append(node);
      return;
    }
    lede.append(node);
  });

  const img = media.querySelector('img');
  if (img) {
    img.loading = 'eager';
    img.fetchPriority = 'high';
  } else {
    block.classList.add('no-media');
  }

  if (ribbon.children.length) inner.append(ribbon);
  inner.append(headline);
  if (lede.children.length) inner.append(lede);
  if (actions.children.length) inner.append(actions);

  block.replaceChildren(media, scrim, inner);
}
