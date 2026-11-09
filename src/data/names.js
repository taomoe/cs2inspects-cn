import mapping from '../../collected/mapping.json';

export const CN_NAMES = mapping.map;

export const TAIL_RULES = [
  [/\s*\|\s*Phase\s*(\d)\s*$/i, '（T$1）'],
  [/\s*\|\s*Black Pearl\s*$/i, '（黑珍珠）'],
  [/\s*\|\s*Sapphire\s*$/i, '（蓝宝石）'],
  [/\s*\|\s*Ruby\s*$/i, '（红宝石）'],
  [/\s*\|\s*Emerald\s*$/i, '（翡翠）'],
  [/\s*\|\s*Vanilla\s*$/i, ' | 原皮'],
];
