export const WEAR_STORE_KEY = 'cs2inspects-cn:wear';

export const WEAR_OPTIONS = [
  ['', '磨损：全部'],
  ['Factory New', '磨损：崭新出厂'],
  ['Minimal Wear', '磨损：略有磨损'],
  ['Field-Tested', '磨损：久经沙场'],
  ['Well-Worn', '磨损：破损不堪'],
  ['Battle-Scarred', '磨损：战痕累累'],
];

export const wearState = {
  selected: '',
};

try {
  const saved = localStorage.getItem(WEAR_STORE_KEY);
  if (saved && WEAR_OPTIONS.some(([value]) => value === saved)) wearState.selected = saved;
} catch (error) {
  wearState.selected = '';
}

export function setSelectedWear(value) {
  wearState.selected = value;
  try {
    localStorage.setItem(WEAR_STORE_KEY, value);
  } catch (error) {
    void error;
  }
}
