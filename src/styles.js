const STYLE_ID = 'cs2cn-style';

const CSS = [
  'button[aria-label="查看各磨损等级的价格"] { display: none !important; }',
  'div.inline-flex:has(> button[aria-label="查看各磨损等级的价格"]) { display: none !important; }',
  '.catalog-card-price-anchor [role="img"] { display: none !important; }',
  '.catalog-card-price-anchor a > div:has(> [role="img"]) { display: none !important; }',
  '.catalog-card-price-anchor > div > div { padding-left: 0 !important; padding-right: 0 !important; }',
  '.catalog-card-price-anchor a { padding-left: 4px !important; padding-right: 4px !important; }',
  'a[href*="/ext/container"] > div:has(> [role="img"]) { display: none !important; }',
  'a[href*="/ext/container"] { padding-left: 4px !important; padding-right: 4px !important; }',
  'a[href^="/ext/top"] { display: none !important; }',
].join('\n');

export function injectStyle() {
  if (document.getElementById(STYLE_ID) || !document.documentElement) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = CSS;
  document.documentElement.appendChild(style);
}
