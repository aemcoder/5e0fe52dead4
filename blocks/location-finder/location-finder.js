/**
 * Location Finder block
 *
 * Authored content model (one row, two cells):
 *   Cell 0 — heading (h2) + label paragraph + placeholder paragraph ("Post Code")
 *   Cell 1 — picture/img of the coffee-field landscape
 *
 * Decoration:
 *   - Wraps cell 0 in .lf-content, promotes paragraphs into
 *     .lf-label and replaces the placeholder with a real search form.
 *   - Wraps cell 1 in .lf-image.
 *   - Form submission navigates to /locations with the postcode as a
 *     query parameter (no back-end required).
 */

/**
 * Builds the postcode search form element.
 *
 * @param {string} placeholder - input placeholder text
 * @returns {HTMLFormElement}
 */
function buildSearchForm(placeholder) {
  const form = document.createElement('form');
  form.className = 'lf-search-form';
  form.setAttribute('action', '/locations');
  form.setAttribute('method', 'get');

  const input = document.createElement('input');
  input.type = 'text';
  input.name = 'postcode';
  input.className = 'lf-search-input';
  input.placeholder = placeholder;
  input.setAttribute('aria-label', 'Post code');

  const btn = document.createElement('button');
  btn.type = 'submit';
  btn.className = 'lf-search-btn';
  btn.textContent = 'Search';

  form.append(input, btn);
  return form;
}

/**
 * Loads and decorates the location-finder block.
 *
 * @param {HTMLElement} block - the block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  // Only one row expected
  const row = rows[0];
  const cells = [...row.children];

  // ── Cell 0: content panel ────────────────────────────────────────────
  const contentCell = cells[0];
  if (contentCell) {
    contentCell.classList.add('lf-content');

    // Find paragraphs — first is the label, second is the postcode placeholder
    const paragraphs = [...contentCell.querySelectorAll('p')];
    if (paragraphs[0]) {
      paragraphs[0].classList.add('lf-label');
    }
    if (paragraphs[1]) {
      const placeholder = paragraphs[1].textContent.trim() || 'Post Code';
      const form = buildSearchForm(placeholder);
      paragraphs[1].replaceWith(form);
    }
  }

  // ── Cell 1: image panel ───────────────────────────────────────────────
  const imageCell = cells[1];
  if (imageCell) {
    imageCell.classList.add('lf-image');
  }
}
