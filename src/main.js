import { CNY_RATE } from './config.js';
import { injectStyle } from './styles.js';
import { installFetchHook, processRoot } from './names.js';
import { refreshPrices } from './prices.js';
import { ensureWearSelect } from './wearSelect.js';
import { startPersistence, scanPersistence } from './persistence.js';

void CNY_RATE;

installFetchHook();
injectStyle();

let queue = [];
let scheduled = false;

function schedule(root) {
  if (root) queue.push(root);
  if (scheduled) return;
  scheduled = true;

  const run = () => {
    scheduled = false;
    const roots = queue;
    queue = [];
    for (const root of roots) {
      if (root && root.isConnected) processRoot(root);
    }
    ensureWearSelect();
    refreshPrices();
    scanPersistence();
  };

  if (typeof requestAnimationFrame === 'function') requestAnimationFrame(run);
  else setTimeout(run, 16);
}

function start() {
  injectStyle();
  processRoot(document.body || document.documentElement);
  ensureWearSelect();
  refreshPrices();
  startPersistence();

  setInterval(() => {
    ensureWearSelect();
    refreshPrices();
    scanPersistence();
  }, 2000);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        for (const node of mutation.addedNodes) schedule(node);
      } else {
        schedule(mutation.target);
      }
    }
  });

  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['title', 'aria-label', 'alt'],
  });

  setTimeout(() => schedule(document.body), 1000);
  setTimeout(() => schedule(document.body), 3000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start, { once: true });
} else {
  start();
}
