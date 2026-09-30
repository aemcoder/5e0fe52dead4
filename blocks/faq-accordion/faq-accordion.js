/**
 * loads and decorates the FAQ accordion block
 * @param {Element} block The faq-accordion block element
 */
export default async function decorate(block) {
  const rows = [...block.children];
  if (rows.length === 0) return;

  // Create container with border-top
  const container = document.createElement('div');
  container.className = 'faq-accordion-container';

  // Process rows in pairs (question, answer)
  for (let i = 0; i < rows.length; i += 2) {
    const qRow = rows[i];
    const aRow = rows[i + 1];

    if (!qRow || !aRow) continue;

    const qCell = qRow.querySelector(':scope > div');
    const aCell = aRow.querySelector(':scope > div');

    // Create accordion item
    const item = document.createElement('div');
    item.className = 'accordion-item';

    // Create button header
    const button = document.createElement('button');
    button.className = 'accordion-button';
    button.setAttribute('type', 'button');
    button.setAttribute('aria-expanded', i === 0 ? 'true' : 'false');

    // Number span
    const numSpan = document.createElement('span');
    numSpan.className = 'acc-num';
    numSpan.textContent = String(Math.floor(i / 2) + 1).padStart(2, '0');

    // Title span
    const titleSpan = document.createElement('span');
    titleSpan.className = 'acc-title';
    if (qCell) {
      titleSpan.innerHTML = qCell.innerHTML;
    }

    // Icon span with +/x symbol
    const iconSpan = document.createElement('span');
    iconSpan.className = 'acc-icon';
    iconSpan.setAttribute('aria-hidden', 'true');

    button.append(numSpan, titleSpan, iconSpan);

    // Create panel (initially hidden)
    const panel = document.createElement('div');
    panel.className = 'acc-panel';
    if (i === 0) {
      panel.classList.add('acc-open');
    }

    // Inner wrapper with answer content
    const inner = document.createElement('div');
    inner.className = 'acc-inner';
    if (aCell) {
      inner.innerHTML = aCell.innerHTML;
    }

    panel.append(inner);

    // Create toggle handler
    button.addEventListener('click', () => {
      const isOpen = panel.classList.contains('acc-open');
      button.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');

      if (isOpen) {
        panel.classList.remove('acc-open');
      } else {
        // Close all other panels
        container.querySelectorAll('.acc-panel.acc-open').forEach((otherPanel) => {
          otherPanel.classList.remove('acc-open');
          otherPanel.previousElementSibling.setAttribute('aria-expanded', 'false');
        });
        // Open this panel
        panel.classList.add('acc-open');
      }
    });

    item.append(button, panel);
    container.append(item);
  }

  // Clear block and add container
  block.innerHTML = '';
  block.append(container);
}
