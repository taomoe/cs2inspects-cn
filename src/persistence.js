import { GENCODE_FIELD, VALUE_FIELDS, currentSlots, getSlot } from './loadout.js';

const STORE_KEY = 'cs2inspects-cn:loadout';

let ready = false;
let started = false;

const attempts = new WeakMap();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function isRealCode(value) {
  const code = String(value || '').trim();
  if (!code) return false;
  if (/^!\s*g\s+\d/i.test(code)) return true;
  if (/^(steam:|csgo_econ)/i.test(code)) return true;
  return code.length >= 24;
}

function findTopInput() {
  return [...document.querySelectorAll('input')].find(
    (input) => input.placeholder && input.placeholder.includes('Gencode') && input.offsetParent !== null
  );
}

function findApplyButton() {
  return [...document.querySelectorAll('button')].find(
    (button) => button.textContent.trim() === '应用' && button.offsetParent !== null
  );
}

function isHydrated(el) {
  if (!el) return false;
  return Object.keys(el).some(
    (key) => key.startsWith('__reactProps$') || key.startsWith('__reactFiber$')
  );
}

function composerReady() {
  const input = findTopInput();
  return (input && isHydrated(input)) || currentSlots().length > 0;
}

function waitFor(check, timeout, interval) {
  return new Promise((resolve) => {
    const start = Date.now();
    const tick = () => {
      let value = null;
      try {
        value = check();
      } catch (error) {
        value = null;
      }
      if (value) return resolve(value);
      if (Date.now() - start >= timeout) return resolve(null);
      setTimeout(tick, interval);
    };
    tick();
  });
}

function setNativeValue(input, value) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
  setter.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

function saveSlots(slots) {
  const data = slots.map((slot) => ({
    heading: slot.heading,
    name: slot.name,
    code: slot.code,
    values: slot.values,
  }));
  const json = JSON.stringify(data);
  try {
    if (localStorage.getItem(STORE_KEY) !== json) localStorage.setItem(STORE_KEY, json);
  } catch (error) {
    void error;
  }
}

function clearStore() {
  try {
    if (localStorage.getItem(STORE_KEY) !== '[]') localStorage.setItem(STORE_KEY, '[]');
  } catch (error) {
    void error;
  }
}

function loadStore() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
    if (!Array.isArray(raw)) return [];
    return raw
      .map((entry) => {
        if (typeof entry === 'string') return { heading: '', name: '', code: entry, values: {} };
        if (!entry || typeof entry !== 'object') return null;
        return {
          heading: entry.heading || '',
          name: entry.name || '',
          code: entry.code || '',
          values: entry.values && typeof entry.values === 'object' ? entry.values : {},
        };
      })
      .filter((entry) => entry && isRealCode(entry.code));
  } catch (error) {
    return [];
  }
}

function triggerGenerate(field) {
  if (isRealCode(field.value)) return;
  const wrapper = field.closest('.flex-1.min-w-0.cursor-pointer');
  if (!wrapper) return;

  const now = Date.now();
  const record = attempts.get(field) || { count: 0, time: 0 };
  if (record.count >= 5 || now - record.time < 15000) return;

  attempts.set(field, { count: record.count + 1, time: now });
  wrapper.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

export function scanPersistence() {
  if (!ready || !composerReady()) return;

  const slots = currentSlots();
  if (!slots.length) {
    clearStore();
    return;
  }

  if (slots.some((slot) => !isRealCode(slot.code))) {
    for (const field of document.querySelectorAll(GENCODE_FIELD)) {
      if (getSlot(field) && !isRealCode(field.value)) triggerGenerate(field);
    }
    return;
  }

  saveSlots(slots);
}

async function applyCode(item) {
  const expectedName = item.name;

  for (let attempt = 0; attempt < 2; attempt++) {
    const input = findTopInput();
    const button = findApplyButton();
    if (!input || !button) return false;

    const before = currentSlots().length;
    setNativeValue(input, item.code);
    await sleep(150);
    button.click();

    const done = await waitFor(() => {
      const slots = currentSlots();
      const matched = expectedName && slots.some((slot) => slot.name === expectedName);
      return matched || slots.length > before;
    }, 10000, 300);

    if (done) return true;
    await sleep(600);
  }

  return false;
}

async function applyValues(savedSlots) {
  const occurrence = new Map();

  for (const item of savedSlots) {
    const index = occurrence.get(item.name) || 0;
    occurrence.set(item.name, index + 1);

    const matches = currentSlots().filter((slot) => slot.name === item.name);
    const match = matches[index];
    if (!match) continue;

    for (const key of VALUE_FIELDS) {
      const value = item.values && item.values[key];
      if (value === undefined || value === null) continue;

      const container = match.container.isConnected ? match.container : null;
      const input = container && container.querySelector(`input[aria-label="${key}"]`);
      if (!input || input.value === String(value)) continue;

      setNativeValue(input, String(value));
      await sleep(200);
    }
  }
}

async function restore(savedSlots) {
  const input = await waitFor(() => {
    const candidate = findTopInput();
    return candidate && isHydrated(candidate) ? candidate : null;
  }, 25000, 400);

  if (!input) return;
  await sleep(900);
  if (currentSlots().length) return;

  let applied = 0;
  for (const item of savedSlots) {
    if (!isRealCode(item.code)) continue;
    if (await applyCode(item)) applied += 1;
    await sleep(400);
  }

  if (!applied) return;
  await waitFor(() => currentSlots().length >= applied, 6000, 300);
  await applyValues(savedSlots);
}

export function startPersistence() {
  if (started) return;
  started = true;

  const saved = loadStore();
  const finish = () => {
    ready = true;
    scanPersistence();
  };

  if (!saved.length) {
    ready = true;
  } else {
    restore(saved).then(finish, finish);
  }
}
