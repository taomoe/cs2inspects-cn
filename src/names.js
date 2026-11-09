import { CN_NAMES, TAIL_RULES } from './data/names.js';

const TAIL_NAME_RE = /^(?:[^|]{1,90} \| ){1,2}(?:Phase \d|Black Pearl|Sapphire|Ruby|Emerald|Vanilla)$/i;

const NAME_PREFIXES = [
  ['StatTrak™ ', 'StatTrak™ '],
  ['StatTrak ', 'StatTrak™ '],
  ['Souvenir ', '纪念品 '],
];

const ATTRS = ['title', 'aria-label', 'alt'];

const CATALOG_PATH = '/api/catalog/items';

function stripDecoration(text) {
  for (const [from] of NAME_PREFIXES) {
    if (text.startsWith(from)) return text.slice(from.length);
  }
  return text;
}

function isItemName(text) {
  const name = text.trim();
  if (!name) return false;
  if (CN_NAMES[name]) return true;

  const base = stripDecoration(name);
  if (base !== name) {
    return !!CN_NAMES[base] || TAIL_NAME_RE.test(base);
  }
  return TAIL_NAME_RE.test(name);
}

function translate(raw) {
  if (typeof raw !== 'string' || !raw) return raw;

  let name = raw;
  let prefix = '';
  for (const [from, to] of NAME_PREFIXES) {
    if (name.startsWith(from)) {
      prefix = to;
      name = name.slice(from.length);
      break;
    }
  }

  let translated = CN_NAMES[name];
  if (!translated) {
    let patched = name;
    for (const [re, replacement] of TAIL_RULES) {
      patched = patched.replace(re, replacement);
    }
    if (patched !== name) translated = patched;
  }

  return translated ? prefix + translated : raw;
}

export function installFetchHook() {
  const nativeFetch = window.fetch;
  if (typeof nativeFetch !== 'function') return;

  window.fetch = function (input, init) {
    const url = typeof input === 'string' ? input : ((input && input.url) || String(input));
    const pending = nativeFetch.apply(this, arguments);
    if (!url.includes(CATALOG_PATH)) return pending;

    return pending.then(async (response) => {
      if (!response.ok) return response;
      try {
        const data = await response.clone().json();
        if (!Array.isArray(data)) return response;

        let changed = false;
        for (const item of data) {
          if (!item) continue;
          if (typeof item.skin_fullname === 'string') {
            const next = translate(item.skin_fullname);
            if (next !== item.skin_fullname) {
              item.skin_fullname = next;
              changed = true;
            }
          }
          if (!item.skin_fullname && typeof item.item_name === 'string') {
            const next = translate(item.item_name);
            if (next !== item.item_name) {
              item.skin_fullname = next;
              changed = true;
            }
          }
        }
        if (!changed) return response;

        const headers = new Headers(response.headers);
        headers.delete('content-length');
        headers.delete('content-encoding');
        headers.set('content-type', 'application/json');
        return new Response(JSON.stringify(data), {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      } catch (error) {
        return response;
      }
    });
  };
}

function translateTextNode(node) {
  const value = node.nodeValue;
  if (!value || value.length > 200 || !/[A-Za-z]/.test(value)) return;

  const name = value.trim();
  if (!isItemName(name)) return;

  const translated = translate(name);
  if (translated !== name) node.nodeValue = value.replace(name, translated);
}

function translateAttrs(el) {
  for (const attr of ATTRS) {
    const value = el.getAttribute(attr);
    if (!value || value.length > 200 || !isItemName(value)) continue;
    const translated = translate(value);
    if (translated !== value) el.setAttribute(attr, translated);
  }
}

export function processRoot(root) {
  if (!root) return;
  if (root.nodeType === Node.TEXT_NODE) {
    translateTextNode(root);
    return;
  }
  if (root.nodeType !== Node.ELEMENT_NODE) return;
  if (root.tagName === 'SCRIPT' || root.tagName === 'STYLE' || root.tagName === 'NOSCRIPT') return;

  translateAttrs(root);

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (node.nodeType === Node.ELEMENT_NODE &&
          (node.tagName === 'SCRIPT' || node.tagName === 'STYLE' || node.tagName === 'NOSCRIPT')) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let node;
  while ((node = walker.nextNode())) {
    if (node.nodeType === Node.TEXT_NODE) translateTextNode(node);
    else translateAttrs(node);
  }
}
