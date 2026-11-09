import { CNY_RATE } from './config.js';
import { wearState } from './wearState.js';

const USD_RE = /^\$\s*([\d.,]+)$/;

function parseUsd(text) {
  const match = USD_RE.exec(String(text).trim());
  if (!match) return null;
  const value = Number(match[1].replace(/,/g, ''));
  return Number.isFinite(value) ? value : null;
}

function formatCny(usd) {
  const value = usd * CNY_RATE;
  return `¥${value >= 100 ? Math.round(value) : value.toFixed(2)}`;
}

function findPriceElement(anchor) {
  for (const el of anchor.querySelectorAll('div')) {
    const text = el.textContent.trim();
    if (parseUsd(text) !== null || text.startsWith('¥')) return el;
  }
  const last = anchor.lastElementChild;
  return last && last.nodeType === Node.ELEMENT_NODE ? last : null;
}

function readBaseUsd(el) {
  const current = parseUsd(el.textContent);
  if (current !== null) {
    el.dataset.usd = String(current);
    return current;
  }
  return el.dataset.usd ? Number(el.dataset.usd) : null;
}

function getWearPrice(badge, wear) {
  const root = badge.closest('div[class*="preserve-3d"]');
  if (!root) return null;

  for (const link of root.querySelectorAll('a[href*="pricewear"]')) {
    const href = link.getAttribute('href') || '';
    const index = href.indexOf('?');
    const params = new URLSearchParams(index === -1 ? '' : href.slice(index + 1));
    if (params.get('wear') !== wear) continue;
    const usd = parseUsd(link.textContent);
    if (usd === null) continue;
    return { usd, href };
  }
  return null;
}

function applyBadge(badge) {
  const anchors = [...badge.querySelectorAll('a')];
  if (!anchors.length) return;

  const visible = anchors[anchors.length - 1];

  for (const anchor of anchors) {
    if (anchor === visible) continue;
    const el = findPriceElement(anchor);
    if (!el) continue;
    const usd = readBaseUsd(el);
    if (usd === null) continue;
    const next = formatCny(usd);
    if (el.textContent !== next) el.textContent = next;
  }

  const priceEl = findPriceElement(visible);
  if (!priceEl) return;
  const baseUsd = readBaseUsd(priceEl);
  if (baseUsd === null) return;

  const currentHref = visible.getAttribute('href') || '';
  if (!currentHref.includes('pricewear')) visible.dataset.baseHref = currentHref;

  const wearPrice = wearState.selected ? getWearPrice(badge, wearState.selected) : null;
  const nextText = formatCny(wearPrice ? wearPrice.usd : baseUsd);
  if (priceEl.textContent !== nextText) priceEl.textContent = nextText;

  const nextHref = wearPrice ? wearPrice.href : (visible.dataset.baseHref || currentHref);
  if (nextHref && visible.getAttribute('href') !== nextHref) visible.setAttribute('href', nextHref);
}

function applySlotTag(anchor) {
  const priceEl = findPriceElement(anchor);
  if (!priceEl) return;
  const usd = readBaseUsd(priceEl);
  if (usd === null) return;
  const next = formatCny(usd);
  if (priceEl.textContent !== next) priceEl.textContent = next;
}

export function refreshPrices() {
  for (const badge of document.querySelectorAll('.catalog-card-price-anchor')) {
    applyBadge(badge);
  }
  for (const tag of document.querySelectorAll('a[href*="/ext/container"]')) {
    applySlotTag(tag);
  }
}
