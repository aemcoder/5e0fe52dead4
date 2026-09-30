/**
 * Loads and decorates the field hero block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  // Collect all nodes from the block cells (flat collector)
  const nodes = [];
  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      [...cell.children].forEach((node) => {
        nodes.push(node);
      });
    });
  });

  // Find h1, paragraphs, and action items
  let h1 = null;
  const bodyParagraphs = [];
  const actionParagraphs = [];

  nodes.forEach((node) => {
    if (node.tagName === 'H1') {
      h1 = node;
    } else if (node.tagName === 'P') {
      // Check if paragraph has anchor links (CTA paragraphs)
      if (node.querySelector('a')) {
        actionParagraphs.push(node);
      } else {
        bodyParagraphs.push(node);
      }
    }
  });

  // Build the structure
  const wrap = document.createElement('div');
  wrap.className = 'field-hero-wrap';

  // Create headline wrapper
  if (h1) {
    const headline = document.createElement('div');
    headline.className = 'field-hero-headline';
    headline.append(h1);
    wrap.append(headline);
  }

  // Create layout grid container
  const layoutGrid = document.createElement('div');
  layoutGrid.className = 'field-hero-layout';

  // Left column: text
  const textCol = document.createElement('div');
  textCol.className = 'field-hero-text';

  // Create lede wrapper
  const lede = document.createElement('div');
  lede.className = 'field-hero-lede';
  bodyParagraphs.forEach((p) => {
    lede.append(p);
  });
  textCol.append(lede);
  layoutGrid.append(textCol);

  // Right column: actions
  const actionsCol = document.createElement('div');
  actionsCol.className = 'field-hero-actions-col';

  const actions = document.createElement('div');
  actions.className = 'field-hero-actions';
  actionParagraphs.forEach((p) => {
    actions.append(p);
  });
  actionsCol.append(actions);
  layoutGrid.append(actionsCol);

  wrap.append(layoutGrid);

  // Replace block children with wrap
  block.replaceChildren(wrap);
}
