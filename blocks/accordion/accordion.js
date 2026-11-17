/**
 * accordion — Block Collection accordion ("Notes", chapter 07).
 *
 * Authoring rows (one per item): question cell | answer cell.
 * The section's default content directly before the block (eyebrow <p> +
 * <h3>) is reabsorbed as the left-hand head of the two-column layout.
 * One item open at a time; the first is open by default.
 */

const pad = (n) => String(n).padStart(2, '0');
let uid = 0;

function wrap(className, ...nodes) {
  const el = document.createElement('div');
  el.className = className;
  el.append(...nodes);
  return el;
}

export default async function decorate(block) {
  uid += 1;
  const layout = wrap('accordion-layout');

  // reabsorb the section head (default content right before the block wrapper)
  const prev = block.parentElement && block.parentElement.previousElementSibling;
  if (prev && prev.classList.contains('default-content-wrapper')) {
    const head = wrap('accordion-head');
    const heading = prev.querySelector('h1, h2, h3, h4, h5, h6');
    [...prev.children].forEach((el) => {
      if (el === heading) head.append(wrap('accordion-head-title', el));
      else head.append(wrap('accordion-head-eyebrow', el));
    });
    prev.remove();
    layout.append(head);
  }

  const list = wrap('accordion-list');
  const items = [];
  [...block.children].forEach((row, i) => {
    const [qCell, aCell] = row.children;
    const item = wrap('accordion-item');
    const panelId = `accordion-${uid}-panel-${i}`;

    const header = wrap('accordion-row');
    const num = document.createElement('span');
    num.className = 'accordion-num';
    num.textContent = pad(i + 1);
    const title = wrap('accordion-question');
    if (qCell) title.append(...qCell.childNodes);
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'accordion-toggle';
    toggle.setAttribute('aria-controls', panelId);
    toggle.setAttribute('aria-label', `Toggle: ${title.textContent.trim()}`);
    const icon = document.createElement('span');
    icon.className = 'accordion-icon';
    icon.setAttribute('aria-hidden', 'true');
    toggle.append(icon);
    header.append(num, title, toggle);

    const panel = wrap('accordion-panel');
    panel.id = panelId;
    const inner = wrap('accordion-answer');
    if (aCell) inner.append(...aCell.childNodes);
    panel.append(inner);

    item.append(header, panel);
    list.append(item);
    items.push({ item, toggle });
  });

  const setOpen = (index) => {
    items.forEach(({ item, toggle }, i) => {
      const on = i === index;
      item.classList.toggle('is-open', on);
      toggle.setAttribute('aria-expanded', on ? 'true' : 'false');
    });
  };
  let open = items.length ? 0 : -1;
  setOpen(open);
  items.forEach(({ item }, i) => {
    item.querySelector('.accordion-row').addEventListener('click', () => {
      open = open === i ? -1 : i;
      setOpen(open);
    });
  });

  layout.append(list);
  block.replaceChildren(layout);
}
