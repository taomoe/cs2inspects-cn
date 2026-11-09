export const GENCODE_FIELD = 'input[aria-label="GenCode"]';
export const SLOT_GRID = '.grid.grid-cols-2.gap-x-2';
export const VALUE_FIELDS = ['StatTrak', 'Pattern', 'Wear', 'Name Tag'];

export function getSlot(field) {
  let node = field.parentElement;
  while (node && !node.querySelector('button[aria-label^="复制名称"]')) {
    node = node.parentElement;
  }
  if (!node || !node.closest(SLOT_GRID)) return null;
  return node;
}

export function readSlot(field) {
  const container = getSlot(field);
  if (!container) return null;

  const nameButton = container.querySelector('button[aria-label^="复制名称"]');
  const headingEl = container.querySelector('span.bg-interactive');
  const values = {};

  for (const key of VALUE_FIELDS) {
    const input = container.querySelector(`input[aria-label="${key}"]`);
    if (input) values[key] = input.value;
  }

  return {
    container,
    heading: headingEl ? headingEl.textContent.trim() : '',
    name: nameButton ? nameButton.getAttribute('aria-label').replace(/^复制名称:\s*/, '') : '',
    code: String(field.value || '').trim(),
    values,
  };
}

export function currentSlots() {
  const fields = [...document.querySelectorAll(GENCODE_FIELD)].filter((field) => getSlot(field));
  return fields.map(readSlot).filter(Boolean);
}
