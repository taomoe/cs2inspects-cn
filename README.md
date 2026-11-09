# CS2 Inspects 汉化增强

为 [CS2 Inspects](https://cs2inspects.com/zh-CN) 提供中文皮肤名、中文搜索、磨损价格下拉、人民币价格与已选饰品持久化的油猴脚本。

## 功能

- 将目录中的英文皮肤名替换为中文，并让站点搜索支持中文
- 移除卡片上的「磨损价格」按钮，改为价格筛选旁的下拉框
- 卡片与左侧已选饰品的价格按 `CNY_RATE`（默认 6.7）转换为人民币
- 自动保存已选饰品，下次打开页面时自动恢复 Wear / Pattern / StatTrak / Name Tag
- 隐藏价格旁的市场图标并收紧角标间距

## 安装

1. 安装 [Tampermonkey](https://www.tampermonkey.net/) 或 Violentmonkey
2. 打开 [安装脚本](https://raw.githubusercontent.com/taomoe/cs2inspects-cn/main/dist/cs2inspects-cn.user.js)
3. 访问 <https://cs2inspects.com/zh-CN>

## 构建

```bash
npm install
npm run build
```

产物为 `dist/cs2inspects-cn.user.js`，元数据头由 `vite.config.js` 自动注入。

## 目录结构

```
collected/mapping.json   英文 -> 中文名称数据源
src/main.js              启动与调度
src/names.js             名称翻译与目录接口拦截
src/prices.js            人民币价格转换
src/wearSelect.js        磨损价格下拉
src/wearState.js         磨损选择状态
src/persistence.js       已选饰品持久化
src/loadout.js           读取搭配槽位
src/styles.js            样式注入
src/config.js            汇率常量
src/data/names.js        中文数据入口
dist/                    构建产物
```

## 数据更新

网站新增皮肤时，更新 `collected/mapping.json` 后重新执行 `npm run build`。

## 协议

[GPL-3.0-or-later](LICENSE)
