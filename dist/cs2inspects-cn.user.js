// ==UserScript==
// @name         CS2 Inspects 中文皮肤名 / 中文搜索 / 磨损价格
// @namespace    https://cs2inspects.com/
// @version      1.0.0
// @description  CS2 Inspects 中文皮肤名、中文搜索、磨损价格下拉、人民币价格与已选饰品持久化
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

(function() {
  "use strict";
  const CNY_RATE = 6.7;
  const STYLE_ID = "cs2cn-style";
  const CSS = [
    'button[aria-label="查看各磨损等级的价格"] { display: none !important; }',
    'div.inline-flex:has(> button[aria-label="查看各磨损等级的价格"]) { display: none !important; }',
    '.catalog-card-price-anchor [role="img"] { display: none !important; }',
    '.catalog-card-price-anchor a > div:has(> [role="img"]) { display: none !important; }',
    ".catalog-card-price-anchor > div > div { padding-left: 0 !important; padding-right: 0 !important; }",
    ".catalog-card-price-anchor a { padding-left: 4px !important; padding-right: 4px !important; }",
    'a[href*="/ext/container"] > div:has(> [role="img"]) { display: none !important; }',
    'a[href*="/ext/container"] { padding-left: 4px !important; padding-right: 4px !important; }',
    'a[href^="/ext/top"] { display: none !important; }'
  ].join("\n");
  function injectStyle() {
    if (document.getElementById(STYLE_ID) || !document.documentElement) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = CSS;
    document.documentElement.appendChild(style);
  }
  const map = /* @__PURE__ */ JSON.parse(`{"T Agent (Default)":"T 阵营探员（默认）","CT Agent (Default)":"CT 阵营探员（默认）","C4 Explosive":"C4 炸药","Tec-9 | Sultan":"Tec-9 | 苏丹","SCAR-20 | Sirocco Script":"SCAR-20 | 风蚀铭沙","Sawed-Off | Lunar Wyrm":"截短霰弹枪 | 月虬","P250 | Lotus Imprint":"P250 | 莲花印","Nova | Morning Sun":"新星 | 晨谕","MP9 | Dune Asp":"MP9 | 沙蝰","MAC-10 | Arabesque Mosaic":"MAC-10 | 阿拉伯式马赛克","M4A4 | Falak":"M4A4 | 吞天巨蛇","Glock-18 | Ifrit Lattice":"格洛克 18 型 | 火灵纹阵","Five-SeveN | Desert Seal":"FN57 | 沙漠封印","FAMAS | Snake Song":"法玛斯 | 蛇吟","Dual Berettas | Mystic Conjunction":"双持贝瑞塔 | 流金契目","Desert Eagle | Eastern Enigma":"沙漠之鹰 | 东方之谜","PP-Bizon | Traitor":"PP-野牛 | 叛徒","AWP | Sovereign Flame":"AWP | 无上之焰","AUG | Lapis Lazuli":"AUG | 星点天青","AK-47 | Consequence of the Jinn":"AK-47 | 精灵之噬","XM1014 | Black Site":"XM1014 | 暗域","USP-S | Spiral Glitch":"USP 消音版 | 眩流","Tec-9 | Perimeter":"Tec-9 | 边界","SCAR-20 | Arctic Camo Panels":"SCAR-20 | 冰原迷彩","R8 Revolver | Monarch":"R8 左轮手枪 | 帝王蝶","Nova | Smart Gun":"新星 | 枪工智能","MP9 | Spy Prototype":"MP9 | 特工原型","MP7 | Base-2":"MP7 | 二进制","MAC-10 | Video Cam":"MAC-10 | 射向头","M4A1-S | Fatal Glitch":"M4A1 消音型 | 致命故障","M4A4 | Dark Operative":"M4A4 | 暗影特工","Glock-18 | Ghost Protocol":"格洛克 18 型 | 幽灵协议","FAMAS | Corp Defense":"法玛斯 | 精英护卫","CZ75-Auto | Hydraulics":"CZ75 | 液压","AWP | Black Box":"AWP | 黑匣子","AUG | Signal Scanner":"AUG | 侦测仪","AK-47 | AUTOEXEC":"AK-47 | AUTOEXEC","USP-S | Silent Shot":"USP 消音版 | 无声一击","UMP-45 | Fragment":"UMP-45 | 击杀时刻","Sawed-Off | Fusion":"截短霰弹枪 | 融合","P90 | Deathgaze":"P90 | 美杜莎之视","P250 | Kintsugi":"P250 | 金缮","MP9 | Urban Sovereign":"MP9 | 都市霸王","MP7 | Amberline":"MP7 | 琥珀流光","M4A1-S | Electrum":"M4A1 消音型 | 翠珀金","M4A4 | Zubastick":"M4A4 | 犬牙交错","M249 | Bock Blocks":"M249 | 博客积木","Glock-18 | Fully Tuned":"格洛克 18 型 | 巅峰状态","Galil AR | Galigator":"加利尔 AR | 加利鳄","Five-SeveN | Dark Polymer":"FN57 | 暗夜聚合","Desert Eagle | Firebreathing":"沙漠之鹰 | 霜寒之焰","PP-Bizon | RMX":"PP-野牛 | 混音","AWP | Queen's Gambit":"AWP | 后翼弃兵","AK-47 | Crane Flight":"AK-47 | 翔鹤","★ Sport Gloves | Occult":"运动手套（★） | 隐知","★ Sport Gloves | Ultra Violent":"运动手套（★） | 紫外狂潮","★ Sport Gloves | Red Racer":"运动手套（★） | 赤色追风","★ Sport Gloves | Creme Pinstripe":"运动手套（★） | 奶油细条纹","★ Sport Gloves | Blaze":"运动手套（★） | 炽烈之炎","★ Sport Gloves | Frosty":"运动手套（★） | 寒霜","★ Sport Gloves | Violet Beadwork":"运动手套（★） | 紫罗兰珠绣","★ Specialist Gloves | Big Swell":"专业手套（★） | 狂澜","★ Specialist Gloves | Sunburst":"专业手套（★） | 日芒","★ Specialist Gloves | Pillow Punchers":"专业手套（★） | 羽袭","★ Specialist Gloves | Chocolate Chesterfield":"专业手套（★） | 可可伯爵","★ Specialist Gloves | Blackbook":"专业手套（★） | 黑皮书","★ Specialist Gloves | Cloud Chaser":"专业手套（★） | 青云狩","★ Specialist Gloves | Lime Polycam":"专业手套（★） | 青柠迷彩","★ Driver Gloves | Wave Chaser":"驾驶手套（★） | 逐沧浪","★ Driver Gloves | Seigaiha":"驾驶手套（★） | 青海波","★ Driver Gloves | Plum Quill":"驾驶手套（★） | 蓝紫点子","★ Driver Gloves | Hand Sweaters":"驾驶手套（★） | 针织手套","★ Driver Gloves | Garden":"驾驶手套（★） | 花园","★ Driver Gloves | Dragon Fists":"驾驶手套（★） | 龙拳","★ Driver Gloves | Brocade Flowers":"驾驶手套（★） | 繁花似锦","★ Driver Gloves | Brocade Crane":"驾驶手套（★） | 深红鹤服","XM1014 | XoooM":"XM1014 | 电光明黄","USP-S | Sleeping Potion":"USP 消音版 | 一颗入眠","UMP-45 | Warm Blooded":"UMP-45 | 热血斑纹","Tec-9 | Banana Leaf":"Tec-9 | 芭蕉叶","Zeus x27 | Earth Mandala":"宙斯 X27 电击枪 | 大地曼陀罗","SSG 08 | Sans Comic":"SSG 08 | 无漫风格","SSG 08 | Calligrafaux":"SSG 08 | 仿书法","SG 553 | Safari Print":"SG 553 | 狩猎印花","SCAR-20 | Zinc":"SCAR-20 | 锌元素","Sawed-Off | Crimson Batik":"截短霰弹枪 | 赤红蜡染","R8 Revolver | Dark Chamber":"R8 左轮手枪 | 暗室","R8 Revolver | Mauve Aside":"R8 左轮手枪 | 淡紫旁白","P90 | Aeolian Light":"P90 | 风蚀流光","P250 | Sleet":"P250 | 冻雨","Nova | Currents":"新星 | 气流","MP9 | Bee-Tron":"MP9 | 创世蜂鸣","MP9 | Dizzy":"MP9 | 眩晕","MP7 | Coral Paisley":"MP7 | 珊瑚佩斯利","MP5-SD | Picnic":"MP5-SD | 野餐","MP5-SD | Snow Splash":"MP5-SD | 雪溅","MAC-10 | Snow Splash":"MAC-10 | 雪溅","M4A1-S | Party Animal":"M4A1 消音型 | 夜店王子","M4A4 | Aeolian Dark":"M4A4 | 风蚀幽冥","M249 | Sleet":"M249 | 冻雨","P2000 | Grip Tape":"P2000 | 防滑胶带","Glock-18 | Trace Lock":"格洛克 18 型 | 追踪锁定","Galil AR | Sky Mandala":"加利尔 AR | 天空曼陀罗","Five-SeveN | Fraise Crane":"FN57 | 鹤吻莓","FAMAS | Vendetta":"法玛斯 | 复仇","FAMAS | Byproduct":"法玛斯 | 副产品","Dual Berettas | Silver Pour":"双持贝瑞塔 | 银流","Desert Eagle | The Daily Deagle":"沙漠之鹰 | 每日鹰爆","CZ75-Auto | Honey Paisley":"CZ75 | 蜜金佩斯利","PP-Bizon | Thermal Currents":"PP-野牛 | 热气流","PP-Bizon | Bizoom":"PP-野牛 | 变焦","AWP | The End":"AWP | 剧终","AWP | Exothermic":"AWP | 热释放","AUG | Creep":"AUG | 蔓延","AK-47 | Breakthrough":"AK-47 | 突破","AK-47 | Aphrodite":"AK-47 | 爱神","AK-47 | The Oligarch":"AK-47 | 流金王朝","M4A4 | Full Throttle":"M4A4 | 破浪狂飙","Glock-18 | Mirror Mosaic":"格洛克 18 型 | 镜面马赛克","MP7 | Smoking Kills":"MP7 | 吸烟有害健康","AWP | Ice Coaled":"AWP | 可燃冰","UMP-45 | Continuum":"UMP-45 | 连续体","MAC-10 | Cat Fight":"MAC-10 | 纸老虎","Dual Berettas | Angel Eyes":"双持贝瑞塔 | 天矢之眼","M4A1-S | Liquidation":"M4A1 消音型 | 液化","Nova | Ocular":"新星 | 目镜","MP5-SD | Focus":"MP5-SD | 专注","MAG-7 | MAGnitude":"MAG-7 | 震级","P250 | Bullfrog":"P250 | 牛蛙","MP9 | Broken Record":"MP9 | 打口碟","P2000 | Red Wing":"P2000 | 红翼","AUG | Trigger Discipline":"AUG | 后发制人","SCAR-20 | Caged":"SCAR-20 | 牢笼","M4A1-S | Solitude":"M4A1 消音型 | 幽独","XM1014 | Mockingbird":"XM1014 | 知更鸟","XM1014 | Run Run Run":"XM1014 | 跑跑跑","XM1014 | Solitude":"XM1014 | 幽独","XM1014 | Canvas Cloud":"XM1014 | 画布云斑","XM1014 | Gum Wall Camo":"XM1014 | 口香糖迷彩","XM1014 | Copperflage":"XM1014 | 铜斑迷彩","USP-S | PC-GRN":"USP 消音版 | PC-GRN","USP-S | Tropical Breeze":"USP 消音版 | 椰风花语","USP-S | Royal Guard":"USP 消音版 | 皇家卫队","USP-S | Bleeding Edge":"USP 消音版 | 血刃","UMP-45 | Late Night Transit":"UMP-45 | 深夜通勤","UMP-45 | K.O. Factory":"UMP-45 | K.O.工厂","UMP-45 | Green Swirl":"UMP-45 | 碧漩","Tec-9 | Whiteout":"Tec-9 | 银装素裹","Tec-9 | Blue Blast":"Tec-9 | 蓝爆","Tec-9 | Raw Ceramic":"Tec-9 | 生瓷","Tec-9 | Citric Acid":"Tec-9 | 柠檬酸","Tec-9 | Garter-9":"Tec-9 | 束带-9","Zeus x27 | Tosai":"宙斯 X27 电击枪 | 当岁鱼","Zeus x27 | Charged Up":"宙斯 X27 电击枪 | 充电宝","Zeus x27 | Electric Blue":"宙斯 X27 电击枪 | 电光幽蓝","Zeus x27 | Swamp DDPAT":"宙斯 X27 电击枪 | 沼泽DDPAT","SSG 08 | Memorial":"SSG 08 | 纪念碑","SSG 08 | Green Ceramic":"SSG 08 | 绿陶","SSG 08 | Blush Pour":"SSG 08 | 霞坠","SSG 08 | Grey Smoke":"SSG 08 | 灰色烟幕","SSG 08 | Tiger Tear":"SSG 08 | 虎噬","SG 553 | Night Camo":"SG 553 | 暗夜迷彩","SG 553 | Basket Halftone":"SG 553 | 篮纹半调","SCAR-20 | Short Ochre":"SCAR-20 | 赭石短调","Sawed-Off | Runoff":"截短霰弹枪 | 径流","R8 Revolver | Cobalt Grip":"R8 左轮手枪 | 钴蓝握把","R8 Revolver | Leafhopper":"R8 左轮手枪 | 叶蝉","P90 | Straight Dimes":"P90 | 满昏作品","P90 | Wave Breaker":"P90 | 破浪者","P90 | Blue Tac":"P90 | 海蓝战术","P90 | Mustard Gas":"P90 | 芥子气","P90 | Reef Grief":"P90 | 珊瑚挽歌","P90 | Desert Halftone":"P90 | 沙漠半调","P250 | Plum Netting":"P250 | 绛络","P250 | Copper Oxide":"P250 | 氧化铜","P250 | Sedimentary":"P250 | 沉积","P250 | Red Tide":"P250 | 赤色潮汐","P250 | Constructivist":"P250 | 建构主义者","Nova | Rain Station":"新星 | 夜雨月台","Nova | Marsh Grass":"新星 | 沼泽草","Nova | Turquoise Pour":"新星 | 松石流彩","Nova | Rising Sun":"新星 | 初升之樱","Negev | Raw Ceramic":"内格夫 | 生瓷","Negev | Sour Grapes":"内格夫 | 酸葡萄","MP9 | Pine":"MP9 | 松","MP9 | Nexus":"MP9 | 中枢","MP9 | Multi-Terrain":"MP9 | 多地形迷彩","MP9 | Shredded":"MP9 | 噬裂","MP9 | Cobalt Paisley":"MP9 | 钴蓝佩斯利","MP9 | Buff Blue":"MP9 | 褪色蓝痕","MP9 | Latte Rush":"MP9 | 首冲拿铁","MP7 | Short Ochre":"MP7 | 赭石短调","MP5-SD | Lime Hex":"MP5-SD | 青柠蜂巢","MP5-SD | Gold Leaf":"MP5-SD | 黄金榕","MAG-7 | Copper Oxide":"MAG-7 | 氧化铜","MAG-7 | Resupply":"MAG-7 | 重新补给","MAC-10 | Bronzer":"MAC-10 | 古铜","MAC-10 | Storm Camo":"MAC-10 | 风暴迷彩","MAC-10 | Derailment":"MAC-10 | 脱轨","MAC-10 | Poplar Thicket":"MAC-10 | 白杨丛","MAC-10 | Acid Hex":"MAC-10 | 酸蚀蜂巢","M4A4 | Sheet Lightning":"M4A4 | 轰天闪","M4A1-S | Rose Hex":"M4A1 消音型 | 玫瑰蜂巢","M4A1-S | Glitched Paint":"M4A1 消音型 | 故障艺术","M4A1-S | Stratosphere":"M4A1 消音型 | 平流层巡航","M4A4 | Choppa":"M4A4 | 战鹰","M4A4 | Naval Shred Camo":"M4A4 | 海军虎纹迷彩","M4A4 | Steel Work":"M4A4 | 钢铁红流","M4A4 | Hellish":"M4A4 | 炼狱之火","M249 | Sage Camo":"M249 | 鼠尾草迷彩","★ Skeleton Knife | Ultraviolet":"骷髅匕首（★） | 致命紫罗兰","★ Skeleton Knife | Rust Coat":"骷髅匕首（★） | 外表生锈","★ Skeleton Knife | Damascus Steel":"骷髅匕首（★） | 大马士革钢","★ Skeleton Knife | Tiger Tooth":"骷髅匕首（★） | 虎牙","★ Skeleton Knife | Doppler | Sapphire":"骷髅匕首（★） | 多普勒（蓝宝石）","★ Skeleton Knife | Doppler | Ruby":"骷髅匕首（★） | 多普勒（红宝石）","★ Skeleton Knife | Marble Fade":"骷髅匕首（★） | 渐变大理石","★ Skeleton Knife | Doppler | Phase 4":"骷髅匕首（★） | 多普勒（T4）","★ Skeleton Knife | Doppler | Phase 3":"骷髅匕首（★） | 多普勒（T3）","★ Skeleton Knife | Doppler | Phase 2":"骷髅匕首（★） | 多普勒（T2）","★ Skeleton Knife | Doppler | Phase 1":"骷髅匕首（★） | 多普勒（T1）","★ Skeleton Knife | Doppler | Black Pearl":"骷髅匕首（★） | 多普勒（黑珍珠）","★ Nomad Knife | Ultraviolet":"流浪者匕首（★） | 致命紫罗兰","★ Nomad Knife | Rust Coat":"流浪者匕首（★） | 外表生锈","★ Nomad Knife | Damascus Steel":"流浪者匕首（★） | 大马士革钢","★ Nomad Knife | Tiger Tooth":"流浪者匕首（★） | 虎牙","★ Nomad Knife | Doppler | Sapphire":"流浪者匕首（★） | 多普勒（蓝宝石）","★ Nomad Knife | Doppler | Ruby":"流浪者匕首（★） | 多普勒（红宝石）","★ Nomad Knife | Marble Fade":"流浪者匕首（★） | 渐变大理石","★ Nomad Knife | Doppler | Phase 4":"流浪者匕首（★） | 多普勒（T4）","★ Nomad Knife | Doppler | Phase 3":"流浪者匕首（★） | 多普勒（T3）","★ Nomad Knife | Doppler | Phase 2":"流浪者匕首（★） | 多普勒（T2）","★ Nomad Knife | Doppler | Phase 1":"流浪者匕首（★） | 多普勒（T1）","★ Nomad Knife | Doppler | Black Pearl":"流浪者匕首（★） | 多普勒（黑珍珠）","★ Paracord Knife | Ultraviolet":"系绳匕首（★） | 致命紫罗兰","★ Paracord Knife | Rust Coat":"系绳匕首（★） | 外表生锈","★ Paracord Knife | Damascus Steel":"系绳匕首（★） | 大马士革钢","★ Paracord Knife | Tiger Tooth":"系绳匕首（★） | 虎牙","★ Paracord Knife | Doppler | Sapphire":"系绳匕首（★） | 多普勒（蓝宝石）","★ Paracord Knife | Doppler | Ruby":"系绳匕首（★） | 多普勒（红宝石）","★ Paracord Knife | Marble Fade":"系绳匕首（★） | 渐变大理石","★ Paracord Knife | Doppler | Phase 4":"系绳匕首（★） | 多普勒（T4）","★ Paracord Knife | Doppler | Phase 3":"系绳匕首（★） | 多普勒（T3）","★ Paracord Knife | Doppler | Phase 2":"系绳匕首（★） | 多普勒（T2）","★ Paracord Knife | Doppler | Phase 1":"系绳匕首（★） | 多普勒（T1）","★ Paracord Knife | Doppler | Black Pearl":"系绳匕首（★） | 多普勒（黑珍珠）","★ Survival Knife | Ultraviolet":"求生匕首（★） | 致命紫罗兰","★ Survival Knife | Rust Coat":"求生匕首（★） | 外表生锈","★ Survival Knife | Damascus Steel":"求生匕首（★） | 大马士革钢","★ Survival Knife | Tiger Tooth":"求生匕首（★） | 虎牙","★ Survival Knife | Doppler | Sapphire":"求生匕首（★） | 多普勒（蓝宝石）","★ Survival Knife | Doppler | Ruby":"求生匕首（★） | 多普勒（红宝石）","★ Survival Knife | Marble Fade":"求生匕首（★） | 渐变大理石","★ Survival Knife | Doppler | Phase 4":"求生匕首（★） | 多普勒（T4）","★ Survival Knife | Doppler | Phase 3":"求生匕首（★） | 多普勒（T3）","★ Survival Knife | Doppler | Phase 2":"求生匕首（★） | 多普勒（T2）","★ Survival Knife | Doppler | Phase 1":"求生匕首（★） | 多普勒（T1）","★ Survival Knife | Doppler | Black Pearl":"求生匕首（★） | 多普勒（黑珍珠）","P2000 | Royal Baroque":"P2000 | 皇家巴洛克","P2000 | Marsh":"P2000 | 草泽","P2000 | Sure Grip":"P2000 | 防滑握把","Glock-18 | Glockingbird":"格洛克 18 型 | 格更鸟","Glock-18 | Coral Bloom":"格洛克 18 型 | 珊红花汛","Glock-18 | Ocean Topo":"格洛克 18 型 | 深海地貌","Glock-18 | Green Line":"格洛克 18 型 | 格林线","Glock-18 | Shinobu":"格洛克 18 型 | 忍瞳","Galil AR | Green Apple":"加利尔 AR | 绿苹果","Galil AR | Robin's Egg":"加利尔 AR | 鸲珠","Galil AR | O-Ranger":"加利尔 AR | 血橙游骑兵","Galil AR | Grey Smoke":"加利尔 AR | 灰色烟幕","Galil AR | Acid Dart":"加利尔 AR | 酸蚀镖","Galil AR | Control":"加利尔 AR | 控制","G3SG1 | Green Cell":"G3SG1 | 绿色细胞","G3SG1 | Red Jasper":"G3SG1 | 红碧玉","Five-SeveN | Autumn Thicket":"FN57 | 秋日灌木","Five-SeveN | Sky Blue":"FN57 | 青空","FAMAS | Palm":"法玛斯 | 棕榈色","FAMAS | Grey Ghost":"法玛斯 | 灰色幽灵","FAMAS | Yeti Camo":"法玛斯 | 雪怪迷彩","FAMAS | 2A2F":"法玛斯 | 2A2F","FAMAS | Bad Trip":"法玛斯 | 幻灭之旅","Dual Berettas | Rose Nacre":"双持贝瑞塔 | 蔷薇珠母","Dual Berettas | Polished Malachite":"双持贝瑞塔 | 精琢孔雀石","Dual Berettas | BorDeux":"双持贝瑞塔 | 第二边界","Desert Eagle | Mulberry":"沙漠之鹰 | 玛珀丽","Desert Eagle | Mint Fan":"沙漠之鹰 | 薄荷折扇","Desert Eagle | Serpent Strike":"沙漠之鹰 | 巨蟒冲击","CZ75-Auto | Pink Pearl":"CZ75 | 粉玑","CZ75-Auto | Copper Fiber":"CZ75 | 铜芯纤维","PP-Bizon | Wood Block Camo":"PP-野牛 | 木纹迷彩","AWP | Arsenic Spill":"AWP | 砷化污染","AWP | Green Energy":"AWP | 一击碧命","AWP | Printstream":"AWP | 印花集","AWP | LongDog":"AWP | 灵缇","AUG | Commando Company":"AUG | 特种兵连","AUG | Steel Sentinel":"AUG | 钢铁哨兵","AK-47 | VariCamo Grey":"AK-47 | 灰变迷彩","AK-47 | Wintergreen":"AK-47 | 寒翠","AK-47 | Midnight Laminate":"AK-47 | 午夜层压板","AK-47 | Nouveau Rouge":"AK-47 | 新红浪潮","AK-47 | Searing Rage":"AK-47 | 灼心怒焰","R8 Revolver | Tango":"R8 左轮手枪 | 探戈","CZ75-Auto | Slalom":"CZ75 | 回转","USP-S | Alpine Camo":"USP 消音版 | 阿尔卑斯迷彩","USP-S | 27":"USP 消音版 | 27","M4A1-S | Fade":"M4A1 消音型 | 渐变之色","M4A1-S | Wash me plz":"M4A1 消音型 | 请擦擦","M4A1-S | Vaporwave":"M4A1 消音型 | 蒸汽波","SSG 08 | Halftone Whorl":"SSG 08 | 半调轮纹","SSG 08 | Zeno":"SSG 08 | 芝诺悖论","SSG 08 | Rapid Transit":"SSG 08 | 致命站点","SG 553 | Berry Gel Coat":"SG 553 | 浆果胶衣","SCAR-20 | Wild Berry":"SCAR-20 | 野莓","SCAR-20 | Trail Blazer":"SCAR-20 | 开拓者","P250 | Small Game":"P250 | 随便玩玩","P250 | Epicenter":"P250 | 震中","Nova | Yorkshire":"新星 | 约克夏","Nova | Wurst Hölle":"新星 | 香肠地狱","MP9 | Arctic Tri-Tone":"MP9 | 极寒三色","MP7 | Astrolabe":"MP7 | 星盘","P2000 | Coral Halftone":"P2000 | 珊瑚半调","Zeus x27 | Dragon Snore":"宙斯 X27 电击枪 | 鼾龙传说","Tec-9 | Tiger Stencil":"Tec-9 | 虎纹模板","Negev | Wall Bang":"内格夫 | 墙临弹雨","MAG-7 | Wildwood":"MAG-7 | 野树林","PP-Bizon | Cold Cell":"PP-野牛 | 冷室","XM1014 | Halftone Shift":"XM1014 | 半调转换","XM1014 | Monster Melt":"XM1014 | 怪物汰换","UMP-45 | Crimson Foil":"UMP-45 | 深红箔","UMP-45 | Neo-Noir":"UMP-45 | 黑色魅影","MP5-SD | Statics":"MP5-SD | 静态学","MP5-SD | Savannah Halftone":"MP5-SD | 萨凡纳半调","MP5-SD | Neon Squeezer":"MP5-SD | 霓虹榨汁机","P90 | Attack Vector":"P90 | 攻击向量","P90 | Wash me":"P90 | 擦擦","P90 | Randy Rush":"P90 | 兰迪快冲","MAC-10 | Pipsqueak":"MAC-10 | 鼠鼠我呀","MAC-10 | Saibā Oni":"MAC-10 | 赛博恶魔","M4A4 | Polysoup":"M4A4 | 多边形编辑","M4A4 | Turbine":"M4A4 | 涡轮","M249 | Spectrogram":"M249 | 时频谱","M249 | Hypnosis":"M249 | 催眠术","Galil AR | Rainbow Spoon":"加利尔 AR | 彩虹勺","Galil AR | NV":"加利尔 AR | NV","Galil AR | Metallic Squeezer":"加利尔 AR | 金属榨汁机","FAMAS | Halftone Wash":"法玛斯 | 半调水洗","FAMAS | Half Sleeve":"法玛斯 | 半袖式","AWP | CMYK":"AWP | CMYK","AWP | Crakow!":"AWP | 克拉考","AUG | Lil' Pig":"AUG | 小猪猪","AUG | Eye of Zapems":"AUG | 扎佩姆斯之眼","AUG | Luxe Trim":"AUG | 豪华装饰","AK-47 | Olive Polycam":"AK-47 | 橄榄迷彩","AK-47 | Crossfade":"AK-47 | 交叉渐变","AK-47 | B the Monster":"AK-47 | 怪兽在B","AK-47 | The Outsiders":"AK-47 | 局外人","Glock-18 | AXIA":"格洛克 18 型 | AXIA","Glock-18 | Teal Graf":"格洛克 18 型 | 凫色涂鸦","Glock-18 | Gold Toof":"格洛克 18 型 | 大金牙","Five-SeveN | Midnight Paintover":"FN57 | 午夜喷涂","Five-SeveN | Heat Treated":"FN57 | 热处理","Dual Berettas | Sweet Little Angels":"双持贝瑞塔 | 小甜使","Dual Berettas | Hydro Strike":"双持贝瑞塔 | 水枪冲击","Desert Eagle | Heat Treated":"沙漠之鹰 | 热处理","Desert Eagle | Starcade":"沙漠之鹰 | 星尘拱廊","Desert Eagle | Tilted":"沙漠之鹰 | 跷跷板","Desert Eagle | Calligraffiti":"沙漠之鹰 | 书法涂鸦","★ Gloves CT (Default)":"CT 默认手套","★ Gloves T (Default)":"T 默认手套","MAG-7 | SWAG-7":"MAG-7 | SWAG-7","M249 | O.S.I.P.R.":"M249 | O.S.I.P.R.","R8 Revolver (Default)":"R8 左轮手枪（默认）","CZ75-Auto (Default)":"CZ75（默认）","Zeus x27 (Default)":"宙斯 X27 电击枪（默认）","MP5-SD (Default)":"MP5-SD（默认）","USP-S (Default)":"USP 消音版（默认）","M4A1-S (Default)":"M4A1 消音型（默认）","SSG 08 (Default)":"SSG 08（默认）","SG 553 (Default)":"SG 553（默认）","SCAR-20 (Default)":"SCAR-20（默认）","P250 (Default)":"P250（默认）","Nova (Default)":"新星（默认）","MP9 (Default)":"MP9（默认）","MP7 (Default)":"MP7（默认）","P2000 (Default)":"P2000（默认）","Tec-9 (Default)":"Tec-9（默认）","Sawed-Off (Default)":"截短霰弹枪（默认）","Negev (Default)":"内格夫（默认）","MAG-7 (Default)":"MAG-7（默认）","PP-Bizon (Default)":"PP-野牛（默认）","XM1014 (Default)":"XM1014（默认）","UMP-45 (Default)":"UMP-45（默认）","P90 (Default)":"P90（默认）","MAC-10 (Default)":"MAC-10（默认）","M4A4 (Default)":"M4A4（默认）","M249 (Default)":"M249（默认）","Galil AR (Default)":"加利尔 AR（默认）","G3SG1 (Default)":"G3SG1（默认）","FAMAS (Default)":"法玛斯（默认）","AWP (Default)":"AWP（默认）","AUG (Default)":"AUG（默认）","AK-47 (Default)":"AK-47（默认）","Glock-18 (Default)":"格洛克 18 型（默认）","Five-SeveN (Default)":"FN57（默认）","Dual Berettas (Default)":"双持贝瑞塔（默认）","Desert Eagle (Default)":"沙漠之鹰（默认）","Knife T (Default)":"T 默认匕首","Knife CT (Default)":"CT 默认匕首"}`);
  const mapping = {
    map
  };
  const CN_NAMES = mapping.map;
  const TAIL_RULES = [
    [/\s*\|\s*Phase\s*(\d)\s*$/i, "（T$1）"],
    [/\s*\|\s*Black Pearl\s*$/i, "（黑珍珠）"],
    [/\s*\|\s*Sapphire\s*$/i, "（蓝宝石）"],
    [/\s*\|\s*Ruby\s*$/i, "（红宝石）"],
    [/\s*\|\s*Emerald\s*$/i, "（翡翠）"],
    [/\s*\|\s*Vanilla\s*$/i, " | 原皮"]
  ];
  const TAIL_NAME_RE = /^(?:[^|]{1,90} \| ){1,2}(?:Phase \d|Black Pearl|Sapphire|Ruby|Emerald|Vanilla)$/i;
  const NAME_PREFIXES = [
    ["StatTrak™ ", "StatTrak™ "],
    ["StatTrak ", "StatTrak™ "],
    ["Souvenir ", "纪念品 "]
  ];
  const ATTRS = ["title", "aria-label", "alt"];
  const CATALOG_PATH = "/api/catalog/items";
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
    if (typeof raw !== "string" || !raw) return raw;
    let name = raw;
    let prefix = "";
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
  function installFetchHook() {
    const nativeFetch = window.fetch;
    if (typeof nativeFetch !== "function") return;
    window.fetch = function(input, init) {
      const url = typeof input === "string" ? input : input && input.url || String(input);
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
            if (typeof item.skin_fullname === "string") {
              const next = translate(item.skin_fullname);
              if (next !== item.skin_fullname) {
                item.skin_fullname = next;
                changed = true;
              }
            }
            if (!item.skin_fullname && typeof item.item_name === "string") {
              const next = translate(item.item_name);
              if (next !== item.item_name) {
                item.skin_fullname = next;
                changed = true;
              }
            }
          }
          if (!changed) return response;
          const headers = new Headers(response.headers);
          headers.delete("content-length");
          headers.delete("content-encoding");
          headers.set("content-type", "application/json");
          return new Response(JSON.stringify(data), {
            status: response.status,
            statusText: response.statusText,
            headers
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
  function processRoot(root) {
    if (!root) return;
    if (root.nodeType === Node.TEXT_NODE) {
      translateTextNode(root);
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE) return;
    if (root.tagName === "SCRIPT" || root.tagName === "STYLE" || root.tagName === "NOSCRIPT") return;
    translateAttrs(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode(node2) {
        if (node2.nodeType === Node.ELEMENT_NODE && (node2.tagName === "SCRIPT" || node2.tagName === "STYLE" || node2.tagName === "NOSCRIPT")) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    let node;
    while (node = walker.nextNode()) {
      if (node.nodeType === Node.TEXT_NODE) translateTextNode(node);
      else translateAttrs(node);
    }
  }
  const WEAR_STORE_KEY = "cs2inspects-cn:wear";
  const WEAR_OPTIONS = [
    ["", "磨损：全部"],
    ["Factory New", "磨损：崭新出厂"],
    ["Minimal Wear", "磨损：略有磨损"],
    ["Field-Tested", "磨损：久经沙场"],
    ["Well-Worn", "磨损：破损不堪"],
    ["Battle-Scarred", "磨损：战痕累累"]
  ];
  const wearState = {
    selected: ""
  };
  try {
    const saved = localStorage.getItem(WEAR_STORE_KEY);
    if (saved && WEAR_OPTIONS.some(([value]) => value === saved)) wearState.selected = saved;
  } catch (error) {
    wearState.selected = "";
  }
  function setSelectedWear(value) {
    wearState.selected = value;
    try {
      localStorage.setItem(WEAR_STORE_KEY, value);
    } catch (error) {
    }
  }
  const USD_RE = /^\$\s*([\d.,]+)$/;
  function parseUsd(text) {
    const match = USD_RE.exec(String(text).trim());
    if (!match) return null;
    const value = Number(match[1].replace(/,/g, ""));
    return Number.isFinite(value) ? value : null;
  }
  function formatCny(usd) {
    const value = usd * CNY_RATE;
    return `¥${value >= 100 ? Math.round(value) : value.toFixed(2)}`;
  }
  function findPriceElement(anchor) {
    for (const el of anchor.querySelectorAll("div")) {
      const text = el.textContent.trim();
      if (parseUsd(text) !== null || text.startsWith("¥")) return el;
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
      const href = link.getAttribute("href") || "";
      const index = href.indexOf("?");
      const params = new URLSearchParams(index === -1 ? "" : href.slice(index + 1));
      if (params.get("wear") !== wear) continue;
      const usd = parseUsd(link.textContent);
      if (usd === null) continue;
      return { usd, href };
    }
    return null;
  }
  function applyBadge(badge) {
    const anchors = [...badge.querySelectorAll("a")];
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
    const currentHref = visible.getAttribute("href") || "";
    if (!currentHref.includes("pricewear")) visible.dataset.baseHref = currentHref;
    const wearPrice = wearState.selected ? getWearPrice(badge, wearState.selected) : null;
    const nextText = formatCny(wearPrice ? wearPrice.usd : baseUsd);
    if (priceEl.textContent !== nextText) priceEl.textContent = nextText;
    const nextHref = wearPrice ? wearPrice.href : visible.dataset.baseHref || currentHref;
    if (nextHref && visible.getAttribute("href") !== nextHref) visible.setAttribute("href", nextHref);
  }
  function applySlotTag(anchor) {
    const priceEl = findPriceElement(anchor);
    if (!priceEl) return;
    const usd = readBaseUsd(priceEl);
    if (usd === null) return;
    const next = formatCny(usd);
    if (priceEl.textContent !== next) priceEl.textContent = next;
  }
  function refreshPrices() {
    for (const badge of document.querySelectorAll(".catalog-card-price-anchor")) {
      applyBadge(badge);
    }
    for (const tag of document.querySelectorAll('a[href*="/ext/container"]')) {
      applySlotTag(tag);
    }
  }
  const SELECT_WRAP_ATTR = "data-cs2cn-wear";
  function createWearSelect() {
    const wrap = document.createElement("span");
    wrap.className = "inline-flex";
    wrap.setAttribute(SELECT_WRAP_ATTR, "");
    const select = document.createElement("select");
    select.id = "cs2cn-wear-select";
    select.setAttribute("aria-label", "磨损价格");
    select.title = "选择磨损等级后，卡片显示对应磨损的价格";
    select.style.height = "28px";
    select.style.borderRadius = "4px";
    select.style.border = "1px solid rgba(71, 85, 105, 0.5)";
    select.style.background = "rgba(30, 41, 59, 0.35)";
    select.style.color = "#94a3b8";
    select.style.fontSize = "10px";
    select.style.fontWeight = "500";
    select.style.padding = "0 2px";
    select.style.outline = "none";
    select.style.cursor = "pointer";
    for (const [value, label] of WEAR_OPTIONS) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      option.style.background = "#0f172a";
      option.style.color = "#e2e8f0";
      select.appendChild(option);
    }
    select.value = wearState.selected;
    select.addEventListener("change", () => {
      setSelectedWear(select.value);
      refreshPrices();
    });
    wrap.appendChild(select);
    return wrap;
  }
  function ensureWearSelect() {
    const reset = [...document.querySelectorAll("button")].find(
      (button) => button.textContent.trim() === "重置" && !button.closest(`[${SELECT_WRAP_ATTR}]`)
    );
    if (!reset) return;
    const resetWrap = reset.parentElement;
    const container = resetWrap && resetWrap.parentElement;
    if (!container) return;
    let scope = container;
    while (scope && !scope.querySelector('button[aria-label="价格筛选"]')) {
      scope = scope.parentElement;
    }
    if (!scope) return;
    let wrap = document.querySelector(`[${SELECT_WRAP_ATTR}]`);
    if (!wrap) wrap = createWearSelect();
    if (wrap.parentElement !== container || wrap.nextElementSibling !== resetWrap) {
      container.insertBefore(wrap, resetWrap);
    }
  }
  const GENCODE_FIELD = 'input[aria-label="GenCode"]';
  const SLOT_GRID = ".grid.grid-cols-2.gap-x-2";
  const VALUE_FIELDS = ["StatTrak", "Pattern", "Wear", "Name Tag"];
  function getSlot(field) {
    let node = field.parentElement;
    while (node && !node.querySelector('button[aria-label^="复制名称"]')) {
      node = node.parentElement;
    }
    if (!node || !node.closest(SLOT_GRID)) return null;
    return node;
  }
  function readSlot(field) {
    const container = getSlot(field);
    if (!container) return null;
    const nameButton = container.querySelector('button[aria-label^="复制名称"]');
    const headingEl = container.querySelector("span.bg-interactive");
    const values = {};
    for (const key of VALUE_FIELDS) {
      const input = container.querySelector(`input[aria-label="${key}"]`);
      if (input) values[key] = input.value;
    }
    return {
      container,
      heading: headingEl ? headingEl.textContent.trim() : "",
      name: nameButton ? nameButton.getAttribute("aria-label").replace(/^复制名称:\s*/, "") : "",
      code: String(field.value || "").trim(),
      values
    };
  }
  function currentSlots() {
    const fields = [...document.querySelectorAll(GENCODE_FIELD)].filter((field) => getSlot(field));
    return fields.map(readSlot).filter(Boolean);
  }
  const STORE_KEY = "cs2inspects-cn:loadout";
  let ready = false;
  let started = false;
  const attempts = /* @__PURE__ */ new WeakMap();
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  function isRealCode(value) {
    const code = String(value || "").trim();
    if (!code) return false;
    if (/^!\s*g\s+\d/i.test(code)) return true;
    if (/^(steam:|csgo_econ)/i.test(code)) return true;
    return code.length >= 24;
  }
  function findTopInput() {
    return [...document.querySelectorAll("input")].find(
      (input) => input.placeholder && input.placeholder.includes("Gencode") && input.offsetParent !== null
    );
  }
  function findApplyButton() {
    return [...document.querySelectorAll("button")].find(
      (button) => button.textContent.trim() === "应用" && button.offsetParent !== null
    );
  }
  function isHydrated(el) {
    if (!el) return false;
    return Object.keys(el).some(
      (key) => key.startsWith("__reactProps$") || key.startsWith("__reactFiber$")
    );
  }
  function composerReady() {
    const input = findTopInput();
    return input && isHydrated(input) || currentSlots().length > 0;
  }
  function waitFor(check, timeout, interval) {
    return new Promise((resolve) => {
      const start2 = Date.now();
      const tick = () => {
        let value = null;
        try {
          value = check();
        } catch (error) {
          value = null;
        }
        if (value) return resolve(value);
        if (Date.now() - start2 >= timeout) return resolve(null);
        setTimeout(tick, interval);
      };
      tick();
    });
  }
  function setNativeValue(input, value) {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    setter.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }
  function saveSlots(slots) {
    const data = slots.map((slot) => ({
      heading: slot.heading,
      name: slot.name,
      code: slot.code,
      values: slot.values
    }));
    const json = JSON.stringify(data);
    try {
      if (localStorage.getItem(STORE_KEY) !== json) localStorage.setItem(STORE_KEY, json);
    } catch (error) {
    }
  }
  function clearStore() {
    try {
      if (localStorage.getItem(STORE_KEY) !== "[]") localStorage.setItem(STORE_KEY, "[]");
    } catch (error) {
    }
  }
  function loadStore() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
      if (!Array.isArray(raw)) return [];
      return raw.map((entry) => {
        if (typeof entry === "string") return { heading: "", name: "", code: entry, values: {} };
        if (!entry || typeof entry !== "object") return null;
        return {
          heading: entry.heading || "",
          name: entry.name || "",
          code: entry.code || "",
          values: entry.values && typeof entry.values === "object" ? entry.values : {}
        };
      }).filter((entry) => entry && isRealCode(entry.code));
    } catch (error) {
      return [];
    }
  }
  function triggerGenerate(field) {
    if (isRealCode(field.value)) return;
    const wrapper = field.closest(".flex-1.min-w-0.cursor-pointer");
    if (!wrapper) return;
    const now = Date.now();
    const record = attempts.get(field) || { count: 0, time: 0 };
    if (record.count >= 5 || now - record.time < 15e3) return;
    attempts.set(field, { count: record.count + 1, time: now });
    wrapper.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  }
  function scanPersistence() {
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
      }, 1e4, 300);
      if (done) return true;
      await sleep(600);
    }
    return false;
  }
  async function applyValues(savedSlots) {
    const occurrence = /* @__PURE__ */ new Map();
    for (const item of savedSlots) {
      const index = occurrence.get(item.name) || 0;
      occurrence.set(item.name, index + 1);
      const matches = currentSlots().filter((slot) => slot.name === item.name);
      const match = matches[index];
      if (!match) continue;
      for (const key of VALUE_FIELDS) {
        const value = item.values && item.values[key];
        if (value === void 0 || value === null) continue;
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
    }, 25e3, 400);
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
    await waitFor(() => currentSlots().length >= applied, 6e3, 300);
    await applyValues(savedSlots);
  }
  function startPersistence() {
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
      for (const root2 of roots) {
        if (root2 && root2.isConnected) processRoot(root2);
      }
      ensureWearSelect();
      refreshPrices();
      scanPersistence();
    };
    if (typeof requestAnimationFrame === "function") requestAnimationFrame(run);
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
    }, 2e3);
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
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
      attributeFilter: ["title", "aria-label", "alt"]
    });
    setTimeout(() => schedule(document.body), 1e3);
    setTimeout(() => schedule(document.body), 3e3);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
