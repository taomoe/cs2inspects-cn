import { refreshPrices } from './prices.js';
import { WEAR_OPTIONS, wearState, setSelectedWear } from './wearState.js';

const SELECT_WRAP_ATTR = 'data-cs2cn-wear';

function createWearSelect() {
  const wrap = document.createElement('span');
  wrap.className = 'inline-flex';
  wrap.setAttribute(SELECT_WRAP_ATTR, '');

  const select = document.createElement('select');
  select.id = 'cs2cn-wear-select';
  select.setAttribute('aria-label', '磨损价格');
  select.title = '选择磨损等级后，卡片显示对应磨损的价格';
  select.style.height = '28px';
  select.style.borderRadius = '4px';
  select.style.border = '1px solid rgba(71, 85, 105, 0.5)';
  select.style.background = 'rgba(30, 41, 59, 0.35)';
  select.style.color = '#94a3b8';
  select.style.fontSize = '10px';
  select.style.fontWeight = '500';
  select.style.padding = '0 2px';
  select.style.outline = 'none';
  select.style.cursor = 'pointer';

  for (const [value, label] of WEAR_OPTIONS) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    option.style.background = '#0f172a';
    option.style.color = '#e2e8f0';
    select.appendChild(option);
  }

  select.value = wearState.selected;
  select.addEventListener('change', () => {
    setSelectedWear(select.value);
    refreshPrices();
  });

  wrap.appendChild(select);
  return wrap;
}

export function ensureWearSelect() {
  const reset = [...document.querySelectorAll('button')].find(
    (button) => button.textContent.trim() === '重置' && !button.closest(`[${SELECT_WRAP_ATTR}]`)
  );
  if (!reset) return;

  const resetWrap = reset.parentElement;
  const container = resetWrap && resetWrap.parentElement;
  if (!container) return;

  let scope = container;
  while (scope && !scope.querySelector('button[aria-label="价格筛选"]')) {
    scope = scope.parentElement;
  }
  if (!scope) return;

  let wrap = document.querySelector(`[${SELECT_WRAP_ATTR}]`);
  if (!wrap) wrap = createWearSelect();
  if (wrap.parentElement !== container || wrap.nextElementSibling !== resetWrap) {
    container.insertBefore(wrap, resetWrap);
  }
}
