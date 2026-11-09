import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

const banner = `// ==UserScript==
// @name         CS2 Inspects 中文皮肤名 / 中文搜索 / 磨损价格
// @namespace    https://cs2inspects.com/
// @version      ${pkg.version}
// @description  ${pkg.description}
// @author       taomoe
// @license      GPL-3.0-or-later
// @homepageURL  https://github.com/taomoe/cs2inspects-cn
// @supportURL   https://github.com/taomoe/cs2inspects-cn/issues
// @downloadURL  https://raw.githubusercontent.com/taomoe/cs2inspects-cn/main/dist/cs2inspects-cn.user.js
// @updateURL    https://raw.githubusercontent.com/taomoe/cs2inspects-cn/main/dist/cs2inspects-cn.user.js
// @match        https://cs2inspects.com/zh-CN*
// @match        https://www.cs2inspects.com/zh-CN*
// @run-at       document-start
// @grant        none
// ==/UserScript==

`;

function userscriptBanner() {
  return {
    name: 'userscript-banner',
    generateBundle(_options, bundle) {
      for (const output of Object.values(bundle)) {
        if (output.type === 'chunk' && output.fileName.endsWith('.user.js')) {
          output.code = banner + output.code;
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [userscriptBanner()],
  build: {
    target: 'es2020',
    outDir: 'dist',
    emptyOutDir: true,
    minify: false,
    lib: {
      entry: 'src/main.js',
      formats: ['iife'],
      name: 'CS2InspectsCN',
      fileName: () => 'cs2inspects-cn.user.js',
    },
  },
});
