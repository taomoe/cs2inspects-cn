# 编写的代码不需要任何注释

# CS2 Inspects 汉化脚本修改笔记

> 目标站点：https://cs2inspects.com/zh-CN  
> 脚本文件：`cs2inspects-cn.user.js`  
> 映射源数据：`collected/mapping.json`  
> 数据快照：2026-11-09，网站目录共 2231 条，其中 408 条英文名称需要汉化。

---

## 1. 产物与作用域

| 项目 | 说明 |
| --- | --- |
| 构建产物 | `dist/cs2inspects-cn.user.js`，Vite 打包后的单文件油猴脚本 |
| 主逻辑 | `src/main.js`（启动、调度、MutationObserver） |
| 汇率常量 | `src/config.js`（`CNY_RATE`，默认 6.7） |
| 中文数据入口 | `src/data/names.js`，直接导入 `collected/mapping.json` |
| 功能模块 | `src/names.js` 汉化与接口拦截、`src/prices.js` 人民币价格、`src/wearSelect.js` 磨损下拉、`src/persistence.js` 选择持久化、`src/loadout.js` 槽位读取、`src/styles.js` 样式注入、`src/wearState.js` 磨损状态 |
| 匹配 | `https://cs2inspects.com/zh-CN*`、`https://www.cs2inspects.com/zh-CN*` |
| 运行时机 | `@run-at document-start` |
| 权限 | `@grant none`（必须运行在页面上下文，才能改写 `window.fetch`） |

只在简体中文路由 `/zh-CN` 生效；英文首页 `/`、繁体 `/zh-TW` 不生效。

---

## 2. 网站关键机制（修改前必须知道）

### 2.1 目录数据流

网站是 Next.js App Router + React 客户端组件，皮肤目录由客户端请求：

```
GET https://cs2inspects.com/api/catalog/items?lang=zh-CN
```

返回数组，约 2231 条，关键字段：

| 字段 | 含义 | 备注 |
| --- | --- | --- |
| `skin_fullname` | 展示用的完整名称 | 汉化主要改这个字段 |
| `item_name` | 物品名称 | 已汉化条目这里是中文；未汉化条目是英文 |
| `skin_name` | 英文皮肤短名（如 `Sultan`） | 不要拿它做展示替换 |
| `item_id` / `skin_id` | ID | 组合、Gencode 等逻辑依赖 |
| `prices` / `prices_wear` | 各平台价格和链接 | 链接由服务端预生成，通常是英文 |

客户端映射逻辑（压缩代码中）：

```js
name: item.skin_fullname ? item.skin_fullname : item.item_name
```

所以：**改 `skin_fullname` 就能同时改变页面显示和搜索用的 `name`。**

截至 2026-11-09：

- 1823 条已经有中文名，不需要脚本处理；
- 408 条仍是英文，脚本内置映射只覆盖这 408 条。

目录请求前面会有一个预加载标签：

```html
<link rel="preload" as="fetch" href="https://cs2inspects.com/api/catalog/items?lang=zh-CN">
```

真正的数据读取仍然是页面脚本里的 `fetch()`，所以在 `document-start` 改写 `window.fetch` 可以拦截到。

`/api/catalog/*` 的请求函数内部还有一个模块级 `Map` 缓存：同一 URL 只请求一次。因此必须在页面 JS 执行前完成 hook。

### 2.2 搜索机制（最重要）

反编译后的过滤逻辑大致是：

```js
let tokens = query.toLowerCase().trim().split(" ");
list = list.filter(item => {
  if (!item.name) return false;
  const name = item.name.toLowerCase();
  return tokens.every(token => name.includes(token));
});
```

结论：

- 搜索**只匹配 `name` 字段**（即 `skin_fullname` / `item_name`）；
- 不匹配 `skin_name`、ID、系列名等其他字段；
- 大小写不敏感，按空格拆分，要求每个词都包含；
- 因此：**只有让目录数据中的 `name` 本身变成中文，网站自带搜索才支持中文**；
- 单纯替换 DOM 文本无法让搜索支持中文。

### 2.3 价格链接与跳转

卡片上的购买链接形如：

```html
<a href="/ext/price?item=Tec-9+%7C+Sultan&market=lisskins&to=<英文市场链接>">
```

- `to` 参数是服务端预生成的英文市场链接，脚本不改；
- `item` 参数即使变成中文（如 `Tec-9 | 苏丹`）也能正常工作；
- 已实测：`/ext/price?item=中文&to=有效市场链接` 会正常重定向。

因此只改 `skin_fullname`、保留 `item_name` 英文，是相对安全的做法。

### 2.4 名称出现的位置

- 目录卡片名称；
- 价格弹层标题（`title` 属性）；
- 选中物品 / 组合面板；
- “我的库存”“我的搭配”“社区搭配”等位置的展示名称。

脚本对 API 的改写覆盖前两类的主要来源；DOM 兜底覆盖其余位置。

---

## 3. 当前脚本实现

### 3.1 内置映射

`CN_NAMES` 由 `src/data/names.js` 从 `collected/mapping.json` 导入，共 408 条，不再手写进主脚本，数据源为：

- ByMykel/CSGO-API 的官方中文名称快照；
- 网站自身已有中文名的前缀风格（见 4.12）。

示例：

```js
"Tec-9 | Sultan": "Tec-9 | 苏丹",
"AWP | Printstream": "AWP | 印花集",
"★ Sport Gloves | Occult": "运动手套（★） | 隐知",
```

### 3.2 尾部英文处理

```js
TAIL_RULES = [
  [/\s*\|\s*Phase\s*(\d)\s*$/i, '（阶段 $1）'],
  [/\s*\|\s*Black Pearl\s*$/i, '（黑珍珠）'],
  [/\s*\|\s*Sapphire\s*$/i, '（蓝宝石）'],
  [/\s*\|\s*Ruby\s*$/i, '（红宝石）'],
  [/\s*\|\s*Emerald\s*$/i, '（翡翠）'],
  [/\s*\|\s*Vanilla\s*$/i, ' | 原版'],
];
```

用于处理两类情况：

1. 英文全名里的多普勒相位，如 `★ Nomad Knife | Doppler | Phase 1`；
2. 网站已经汉化了武器名、但尾部仍是英文，如 `锯齿爪刀（★） | 多普勒 | Phase 4`、`廓尔喀刀（★） | Vanilla`。

### 3.3 API 拦截

在 `document-start` 保存原生 `fetch`，然后包装 `window.fetch`：

1. URL 包含 `/api/catalog/items` 才处理；
2. 用 `response.clone().json()` 读取数据；
3. 遍历数组，只改 `skin_fullname`；
4. 重新构造 `Response`，并删除 `content-length`、`content-encoding`；
5. 任何异常都退回原始响应，保证不影响网站。

### 3.4 DOM 兜底

MutationObserver 监听 `childList`、`characterData`、`title/aria-label/alt` 属性，替换文本节点和属性中的英文名。

为避免误伤界面文案，替换前必须通过 `isItemName()`：

- 整段文字是 `CN_NAMES` 的 key；或
- 带 `StatTrak™` / `Souvenir` 前缀，去掉前缀后能命中；或
- 符合“最多两段 `|` + 已知英文尾部”的格式，例如：
  `xxx | yyy | Phase 4`。

**不要放宽这个判断。** 曾因正则转义错误，把筛选按钮里的 “Vanilla / Emerald / Sapphire / StatTrak™” 连成一串替换，导致按钮文案损坏。

---

## 4. 修改时的坑与规则

### 4.1 必须 `document-start` + `@grant none`

- `@grant none` 才会在页面上下文执行，才能改写页面的 `window.fetch`；
- 目录请求发生在页面 JS 初始化阶段，`document-start` 是最稳妥的时机；
- 改成 `DOMContentLoaded` 或 `@grant` 带权限的沙箱模式，可能导致拦截不到目录请求。

### 4.2 只改 `skin_fullname`，慎改 `item_name`

- `item_name` 可能被服务端、组合、库存、价格逻辑使用；
- 价格链接 `to` 是预生成的英文链接，保留英文名称可避免市场搜索失效；
- 如果未来必须改 `item_name`，先检查组合保存、分享、库存导入等逻辑。

### 4.3 重新构造 Response 的细节

```js
const headers = new Headers(response.headers);
headers.delete('content-length');
headers.delete('content-encoding');
headers.set('content-type', 'application/json');
return new Response(JSON.stringify(data), {
  status: response.status,
  statusText: response.statusText,
  headers,
});
```

- 必须 `clone()` 后再读，否则原响应 body 被消费；
- 删除长度和压缩头，避免新 body 与旧头部不一致；
- 捕获异常并返回原响应，防止接口偶发格式变化导致页面白屏。

### 4.4 幂等性

- `CN_NAMES` 的 key 是英文全名，中文结果不会再次命中 key；
- 尾部规则都锚定 `$`，处理过的中文尾部不会再次匹配；
- DOM 二次替换结果为同一字符串，不会触发无限循环。

### 4.5 DOM 误伤防护

- 只处理长度 ≤ 200、包含字母的文本节点；
- 跳过 `SCRIPT`、`STYLE`、`NOSCRIPT`；
- 不处理输入框的 `value`；
- 不要用“包含 `|` 就替换”这种宽泛条件；
- 修改替换规则后，务必检查筛选、排序、图案菜单等按钮文案。

### 4.6 生成脚本时的正则转义

用 Node 模板字符串生成脚本时，`\s` 可能被当成转义而丢失，导致正则变成 `s*` 并误伤页面。已踩过这个坑。

建议：

- 直接用编辑器改 `.user.js` 文件；
- 或使用 `String.raw`；
- 生成后执行 `node --check cs2inspects-cn.user.js`；
- 在页面中实际检查筛选按钮文案是否正常。

### 4.7 MutationObserver 性能与循环

- 变更通过 `requestAnimationFrame` 合并，避免每次 DOM 变动都全量扫描；
- 属性监听只监听 `title`、`aria-label`、`alt`；
- 替换后再次触发 observer 是正常的，第二遍不会产生新变更；
- 不要监听整个 `attributes`（不加过滤），否则 React 大量属性更新会造成性能问题。

### 4.8 不翻译的范围

按需求只翻译皮肤名称，以下内容保持原样：

- 磨损等级：`Factory New`、`Field-Tested` 等；
- 价格、浮点、描述、系列名；
- 图案模板编号；
- 极少数官方保留英文缩写的名称，如 `AUTOEXEC`、`CMYK`、`SWAG-7`、`O.S.I.P.R.`、`DDPAT`、`FBI`。

### 4.9 路由限制

- 只在 `/zh-CN` 路径生效；
- 切换到英文时站点会跳到 `/`，脚本不生效，这是预期行为；
- 如果以后增加繁体支持，需要另外准备 `zh-TW` 映射，不要直接复用简体数据。

### 4.10 新皮肤与数据更新

脚本是静态快照，网站新增皮肤不会自动翻译。更新步骤：

1. 重新拉取站点目录：
   `GET /api/catalog/items?lang=zh-CN`
2. 找出 `skin_fullname` 不含中文的条目；
3. 用 ByMykel/CSGO-API 的 `en` + `zh-CN` 数据集按 `id` 关联补全；
4. 更新 `collected/mapping.json`；
5. 重新生成脚本中的 `CN_NAMES`；
6. 验证。

数据集地址（浏览器里可直接访问；部分命令行环境可能被网络策略拦截）：

```
https://cdn.jsdelivr.net/gh/ByMykel/CSGO-API@main/public/api/en/skins.json
https://cdn.jsdelivr.net/gh/ByMykel/CSGO-API@main/public/api/zh-CN/skins.json
```

### 4.11 其他数据源的搜索限制

脚本只改写了 `/api/catalog/items`：

- 目录、“全部武器”等主目录搜索：支持中文；
- “我的库存”（Steam 库存）、“社区搭配”等如果名称来自其他接口，展示可由 DOM 兜底翻译，但对应搜索框仍可能按英文匹配；
- 如果后续要覆盖这些搜索，需要单独拦截对应接口并改写其 `name` 字段，先确认接口和字段结构。

### 4.12 中文命名风格必须统一

站点已有中文名使用官方 CS2 风格，ByMykel 的部分武器前缀是紧凑写法，需要统一：

| ByMykel | 站点风格 |
| --- | --- |
| `CZ75自动型` | `CZ75` |
| `M4A1消音型` / `M4A1消音版` | `M4A1 消音型` |
| `R8左轮手枪` | `R8 左轮手枪` |
| `USP消音版` | `USP 消音版` |
| `加利尔AR` | `加利尔 AR` |
| `宙斯x27电击枪` | `宙斯 X27 电击枪` |
| `格洛克18型` | `格洛克 18 型` |

新增翻译时先对照站点已有同类物品的名称风格，避免同一个武器出现两种写法。

### 4.13 搜索习惯与别名

网站搜索是纯子串匹配，不支持拼音、别名、简称：

- “苏丹”“印花集”“多普勒”“阶段 1”“原版”可以命中；
- “沙鹰”不会命中“沙漠之鹰”；
- “大狙”不会命中“AWP”。

如果需要别名搜索，不能只改翻译表，需要额外拦截搜索输入或在名称中加入可搜索别名（会影响显示），改动前要明确产品取舍。

### 4.14 价格/跳转回归测试

修改名称后至少检查：

- 卡片上的 `title` 是否是中文；
- 价格弹层标题是否中文；
- 点击 `CSFloat` / `Lisskins` 价格链接是否能正常跳转；
- `/ext/price?item=中文&...&to=有效链接` 是否仍会重定向。

### 4.15 测试方式与局限

本次验证方式：

- 在线上页面注入完整脚本，验证 API 改写、DOM 文本、`title` 属性；
- 用 `fetch('/api/catalog/items?lang=zh-CN')` 检查返回名称；
- 用中文在改写后的目录数据上模拟原有过滤逻辑，确认可命中；
- 实测 `/ext/price` 重定向。

局限：

- 应用内浏览器无法模拟 Tampermonkey 的 `document-start` 注入时序；
- 最终仍建议在真实 Tampermonkey/Violentmonkey 环境中刷新页面，搜索一次中文名确认。

---

## 5. 更新数据与构建

项目使用 Vite 打包，中文数据与主逻辑已拆分：

```
collected/mapping.json     英文全名 -> 中文全名（数据源）
src/data/names.js          导入 mapping.json，并定义 TAIL_RULES
src/config.js              CNY_RATE 汇率常量
src/main.js                启动、调度、MutationObserver
src/names.js               名称翻译、目录接口拦截、DOM 兜底
src/prices.js              角标与左侧价格标签的人民币转换
src/wearSelect.js          磨损价格下拉
src/wearState.js           磨损选择状态与 localStorage
src/persistence.js         已选饰品持久化（GenCode 生成与恢复）
src/loadout.js             读取 loadout 槽位与字段
src/styles.js              注入隐藏按钮、图标与间距样式
dist/cs2inspects-cn.user.js 构建产物，安装到油猴
```

修改 `collected/mapping.json` 后无需再手动改写映射表，构建即可：

```bash
npm install
npm run build      # 输出 dist/cs2inspects-cn.user.js
npm run watch      # 开发时持续构建
node --check dist/cs2inspects-cn.user.js
```

安装或更新油猴脚本时使用 `dist/cs2inspects-cn.user.js`。

油猴元数据头由 `vite.config.js` 的 `userscript-banner` 插件注入。构建后确认产物第一行是 `// ==UserScript==`；若没有，油猴会提示“用户脚本无效”。

构建后抽查：

- 映射条目数是否与 `mapping.json` 一致；
- `Phase`、`Vanilla` 等尾部规则是否仍是正确正则；
- 页面筛选按钮文案是否未被误改；
- 卡片角标是否显示 `¥`，磨损下拉是否出现在 `$` 与「重置」之间。

---

## 6. 验证基线（2026-11-09）

- 目录条目：2231
- 原英文条目：408
- 已映射：408
- 未解析：0
- API 改写后：`Tec-9 | Sultan` → `Tec-9 | 苏丹`，`item_name` 仍为英文，`prices` 链接不变
- DOM：卡片、价格弹层 `title`、选中面板均显示中文
- 筛选按钮等非物品文案未被误改
- `/ext/price` 中文 `item` + 有效 `to` 正常重定向
- 角标：`$ 0.27` → `¥1.81`（×6.7）；悬停展开的其他市场同样显示 `¥`
- 磨损价格按钮、胶囊边框、角标平台图标均已隐藏
- 磨损下拉位于 `$` 与「重置」之间；选择「久经沙场」后角标为 `¥3.55`，链接切到 `pricewear&wear=Field-Tested`
- 切回「磨损：全部」后恢复最低价与原始 `price` 链接；选择项写入 `localStorage`
- 左侧已选饰品价签：`$ 0.40` → `¥2.68`，平台图标隐藏，左右内边距 4px
- 持久化：选中饰品后自动生成 GenCode 并写入 `cs2inspects-cn:loadout`；刷新后自动恢复物品、Wear、Pattern、StatTrak、Name Tag
- 恢复的饰品不补价签（站点行为，按需求不处理）
- 源码按功能拆分到 `src/` 下多个模块，Vite 打包为单一油猴脚本

---

## 7. 快速排查

| 现象 | 优先检查 |
| --- | --- |
| 页面名称仍是英文 | 是否在 `/zh-CN`；`@grant` 是否为 `none`；`@run-at` 是否为 `document-start`；网络里 `/api/catalog/items` 是否仍存在 |
| 显示中文但搜索不到 | 搜索字段是否仍为 `name`；API 响应是否真的被改写（在控制台 fetch 一次检查） |
| 搜索只能搜英文 | 目录数据是否在 hook 安装前已加载；是否命中了模块缓存 |
| 筛选按钮/其他文案被改坏 | `isItemName()` 是否过宽；尾部正则是否缺少 `$` 或反斜杠被转义丢失 |
| 价格链接失效 | `to` 参数是否被改；`item` 参数是否被下游逻辑当作英文名使用 |
| 新皮肤仍是英文 | 更新 `collected/mapping.json` 后重新执行 `npm run build` |
| 卡片角标仍是 `$` | 是否在目录页并展开了「筛选」；`.catalog-card-price-anchor` 是否存在 |
| 切换磨损后价格不变 | 卡片是否存在 `div[class*="preserve-3d"]`；该磨损是否有 `pricewear` 链接 |
| 磨损价格按钮仍显示 | 浏览器是否支持 `:has()`；按钮 `aria-label` 是否仍为 `查看各磨损等级的价格` |
| 刷新后饰品消失 | 是否有 `localStorage['cs2inspects-cn:loadout']`；页面是否停留在首页；GenCode 是否生成成功 |
| 恢复后没有价签 | 预期行为：GenCode 恢复的饰品站点不生成价签；从目录重新选择后才有 |
| 恢复后数值不符 | 检查 `values` 是否写入；槽位名称是否与保存时一致 |
| GenCode 一直不生成 | 站点 `getFakeInspectLink2` 是否可达；槽位是否在 `.grid.grid-cols-2.gap-x-2` 内 |

---

## 8. 磨损下拉、人民币价格与持久化（v1.0.0）

### 8.1 磨损下拉

- 位置：目录筛选行的 `$`（`aria-label="价格筛选"`）与「重置」之间，不放进价格筛选弹层。
- DOM 结构：筛选行由多个 `div.contents` 分组；`$` 在第二个分组末尾，「重置」在第三个分组的 `span.inline-flex` 内。
  因此实现是“向上找到同时包含 `$` 和「重置」的筛选行，但把下拉插到「重置」所在分组的 `span.inline-flex` 之前”。
- 选项：全部、崭新出厂、略有磨损、久经沙场、破损不堪、战痕累累。
- 选择结果写入 `localStorage['cs2inspects-cn:wear']`，刷新后保留。
- 价格数据来源：每张卡片背面（3D 翻转容器）已经有完整的 `a[href*="pricewear"]` 磨损价格行。
  - 卡片根节点：`badge.closest('div[class*="preserve-3d"]')`。
  - 角标可见价格链接：`.catalog-card-price-anchor` 内的最后一个 `<a>`；其余 `<a>` 是悬停展开的其他市场。
  - 从 `pricewear` 链接解析 `wear` 参数和价格文本，作为该磨损的美元价。
- 行为：选中磨损后，角标价格 = 该磨损美元价 × `CNY_RATE`，链接改为对应 `pricewear` 链接；该卡片没有此磨损价格时回退到原最低价与原始链接。
- 基准值保存在 `dataset.usd` / `dataset.baseHref`；React 重渲染替换节点后会从 `$` 文本重新读取。

### 8.2 移除磨损价格按钮与平台图标

通过注入 CSS 实现，不删除背面磨损面板（它是下拉价格的数据来源）：

```css
button[aria-label="查看各磨损等级的价格"] { display: none !important; }
div.inline-flex:has(> button[aria-label="查看各磨损等级的价格"]) { display: none !important; }
.catalog-card-price-anchor [role="img"] { display: none !important; }
.catalog-card-price-anchor a > div:has(> [role="img"]) { display: none !important; }
.catalog-card-price-anchor > div > div { padding-left: 0 !important; padding-right: 0 !important; }
.catalog-card-price-anchor a { padding-left: 4px !important; padding-right: 4px !important; }
a[href*="/ext/container"] > div:has(> [role="img"]) { display: none !important; }
a[href*="/ext/container"] { padding-left: 4px !important; padding-right: 4px !important; }
```

- 第一条隐藏按钮，第二条隐藏按钮外层的胶囊边框。
- 第三条隐藏角标内的平台图标（含橙色 Lisskins 图标）。
- 第四条隐藏图标外层 `w-5` 容器，避免留下 20px 空白。
- 第五、六条去掉胶囊外层原有的 `pl-0.5 pr-1.5` 不对称内边距，把价格链接左右统一为 4px，角标两侧对称。
- 第七、八条对左侧已选饰品右上角的价格标签（`/ext/container` 链接）做同样处理。

### 8.3 人民币显示

- 汇率常量：`src/config.js` 的 `CNY_RATE`，默认 `6.7`；构建产物中位于最前面。
- 转换范围：目录角标 `.catalog-card-price-anchor`（含悬停展开的其他市场）、左侧已选饰品右上角标签 `a[href*="/ext/container"]`。
- 磨损面板里的 `$` 价格不转换：它既是下拉的数据源，也只在背面显示。
- 格式：`< 100` 保留两位小数（如 `¥1.81`），`>= 100` 取整（如 `¥1092`）。
- 幂等：写入前比较文本，避免 MutationObserver 反复触发；`dataset.usd` 防止 `$` 被换成 `¥` 后丢失原始值。

### 8.4 左侧已选饰品价格标签

- 选择饰品后，左侧槽位右上有 `<a href="/ext/container?...">` 价格标签，`prices.js` 会把其 `$` 价格换算为 `¥`。
- 该标签的价格与磨损来自站点自身（通常为 Factory New），不会被磨损下拉改写。
- GenCode 恢复的饰品站点不会生成该标签；按需求脚本也不补价签，重新从目录选择后才会出现。

### 8.5 已选饰品持久化

- 存储键：`localStorage['cs2inspects-cn:loadout']`，数组，每项包含 `heading`、`name`、`code`、`values`。
- 生成：脚本发现槽位的 GenCode 输入为「生成 GenCode」时，会自动点击该输入触发生成（每项约 2 秒，站点接口为 `getFakeInspectLink2`）。
- 保存：当前所有槽位都拿到真实 GenCode 后，整体写入 localStorage；删除物品后下一次扫描会同步移除。
- 恢复：页面加载后，若当前搭配为空，则把保存的 GenCode 依次填入顶部「检视链接 / Gencode / 组合」并点击「应用」。
- 精确回填：GenCode 恢复后，再按名称匹配槽位，回填 `StatTrak`、`Pattern`、`Wear`、`Name Tag`，避免 GenCode 生成时随机浮动值造成的偏差。
- 站点已有内容时不覆盖：若打开页面时搭配里已有饰品（例如从组合链接进入），跳过恢复，后续扫描会以当前搭配覆盖存储。
- 恢复的饰品没有站点价签，这是站点行为，脚本不补。

### 8.6 注意事项

- 不要用全局 `$` 文本替换，否则会破坏背面磨损价格解析。
- 后台标签页 `requestAnimationFrame` 会暂停，异步刷新不执行；前台正常。不要据此判断脚本失效。
- 选择器依赖站点现有的 `aria-label="价格筛选"`、`aria-label="查看各磨损等级的价格"`、`.catalog-card-price-anchor`、`div[class*="preserve-3d"]` 和按钮文案「重置」；站点改版后需同步调整。
- 每次调度都会执行 `ensureWearSelect()`、`refreshPrices()` 与 `scanPersistence()`，用于抵抗 React 重渲染；所有写入都做了相等判断，不会形成循环。
- 持久化依赖站点 GenCode：输入框可能显示「生成 GenCode」「Generating...」，必须是 `!g ...` 或长串检查链接才算生成完成。
- 生成与恢复都是异步的（约 2 秒/件）；恢复前必须等 React 水合完成，脚本用 `__reactProps$` / `__reactFiber$` 判断，避免在 SSR DOM 上提前写入。
- 不要在恢复完成前清空存储：`persistence.js` 用 `ready` 标记和 `composerReady()` 双重保护。
- 恢复只在搭配为空时执行；已有饰品时跳过，避免覆盖用户从组合链接打开的内容。
- `localStorage` 键：`cs2inspects-cn:wear`（磨损下拉）、`cs2inspects-cn:loadout`（已选饰品）。
- `@grant none` 与 `document-start` 的要求不变。
