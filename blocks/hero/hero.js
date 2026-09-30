/**
 * Hero — Wheeler homepage lead band.
 *
 * Authoring (one row, one cell — flat siblings, order-tolerant):
 *   - optional <picture>/<img>: background photo (rendered behind a scrim)
 *   - <p><strong>Tag</strong></p> BEFORE the heading: promo-ribbon tag
 *   - any other <p> BEFORE the heading: promo-ribbon body (its link makes the
 *     whole ribbon clickable)
 *   - <h1> headline — wrap the accent word in <em> (renders yellow)
 *   - first plain <p> AFTER the heading: lede
 *   - CTA paragraphs: <strong><a> = primary (yellow), <em><a> = secondary
 *
 * Every authored element is MOVED into the layout (Experience Workspace EW1).
 */

// ── Experience Workspace helpers (EW1–EW4) ──
function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

function collectNodes(block) {
  const out = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    let kids = [...cell.children];
    // wrapTextNodes folds a media-led cell into ONE <p> — expand it back.
    if (kids.length === 1 && kids[0].tagName === 'P' && kids[0].children.length
      && kids[0].querySelector('picture, img')) {
      kids = [...kids[0].childNodes].map((n) => {
        if (n.nodeType === 1) return n;
        // HARNESS-ONLY fallback: move a bare text node into a <p>.
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
      // HARNESS-ONLY fallback: wrap existing text nodes, never synthesize.
      const p = document.createElement('p');
      p.append(...cell.childNodes);
      out.push(p);
    }
  });
  return out;
}

const isStrongOnly = (p) => p.tagName === 'P'
  && p.children.length === 1
  && p.firstElementChild.tagName === 'STRONG'
  && !p.querySelector('a')
  && p.textContent.trim() === p.firstElementChild.textContent.trim();

export default function decorate(block) {
  const nodes = collectNodes(block);
  const heading = nodes.find((n) => /^H[1-6]$/.test(n.tagName));
  const headingIndex = heading ? nodes.indexOf(heading) : -1;

  const media = [];
  const ribbonTag = [];
  const ribbonBody = [];
  const lede = [];
  const ctas = [];

  nodes.forEach((n, i) => {
    if (n === heading) return;
    const pictureOnly = n.matches('picture, img')
      || (n.tagName === 'P' && n.querySelector('picture, img') && !n.textContent.trim());
    if (pictureOnly) {
      media.push(n);
    } else if (n.classList.contains('button-wrapper')) {
      ctas.push(n);
    } else if (headingIndex > -1 && i < headingIndex) {
      if (isStrongOnly(n)) ribbonTag.push(n);
      else ribbonBody.push(n);
    } else {
      lede.push(n);
    }
  });

  const frag = [];

  // background photo layer + scrim
  if (media.length) {
    const bg = document.createElement('div');
    bg.className = 'hero-media';
    bg.append(media[0]);
    const img = bg.querySelector('img');
    if (img) {
      img.loading = 'eager';
      img.fetchPriority = 'high';
    }
    frag.push(bg);
  }
  const scrim = document.createElement('div');
  scrim.className = 'scrim';
  frag.push(scrim);

  const wrap = document.createElement('div');
  wrap.className = 'wrap';

  if (ribbonTag.length || ribbonBody.length) {
    const ribbon = document.createElement('div');
    ribbon.className = 'promo-ribbon';
    if (ribbonTag.length) {
      const tag = document.createElement('div');
      tag.className = 'tag';
      tag.append(...ribbonTag);
      ribbon.append(tag);
    }
    if (ribbonBody.length) {
      const body = document.createElement('div');
      body.className = 'body';
      body.append(...ribbonBody);
      if (body.querySelector('a')) ribbon.classList.add('is-linked');
      ribbon.append(body);
    }
    wrap.append(ribbon);
  }

  if (heading) wrap.append(wrapNode(heading, 'headline'));

  if (lede.length) {
    const l = document.createElement('div');
    l.className = 'lede';
    l.append(...lede);
    wrap.append(l);
  }

  if (ctas.length) {
    const actions = document.createElement('div');
    actions.className = 'actions';
    actions.append(...ctas);
    wrap.append(actions);
  }

  frag.push(wrap);
  block.replaceChildren(...frag);
}
