<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/avatars-row-dark.png" />
    <img src="assets/avatars-row.png" alt="五个 Grok Bot 头像：橙色的云、紫色的水滴、黑色的圆、绿色的六边形、蓝色的方圆形。" width="640" height="92" />
  </picture>
</p>

<h1 align="center">grok-bot-avatar-engine</h1>

<p align="center"><strong>Grok Bot 头像引擎</strong></p>
<p align="center"><em>客户端渲染器移植 · 26 个形体 · 53 个状态 · 眼睛是挖空的 · 南瓜带柄</em></p>
<p align="center"><a href="https://ronglecat.github.io/grok-bot-avatar-engine/zh/">https://ronglecat.github.io/grok-bot-avatar-engine/zh/</a></p>

<p align="center">
  <a href="./README_ZH.md">中文</a> ·
  <a href="./README.md">English</a>
</p>

<p align="center">
  <a href="https://ronglecat.github.io/grok-bot-avatar-engine/zh/"><img src="https://img.shields.io/badge/docs-指南%20%2B%20接口-0ea5e9" alt="文档" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
  <a href="https://github.com/RongleCat/grok-bot-avatar-engine/stargazers"><img src="https://img.shields.io/github/stars/RongleCat/grok-bot-avatar-engine?style=social" alt="GitHub stars" /></a>
  <img src="https://img.shields.io/badge/node-%3E%3D22.13-339933?logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/client-Grok%20Bot%200.78.1-lightgrey" alt="Grok Bot 0.78.1" />
  <img src="https://img.shields.io/badge/note-unofficial-yellow" alt="非官方" />
</p>

<p align="center">
  <a href="https://x.com/cgnot996"><img src="https://img.shields.io/badge/X-铁柱AGI%20%40cgnot996-black?logo=x&logoColor=white" alt="X 铁柱AGI" /></a>
  <img src="https://img.shields.io/badge/WeChat-铁柱AGI-07C160?logo=wechat&logoColor=white" alt="微信 铁柱AGI" />
  <a href="https://bot.tiezhu.si/"><img src="https://img.shields.io/badge/learn-bot.tiezhu.si-111111" alt="Grok Bot 学习站" /></a>
</p>

<p align="center">
  <img src="assets/wechat/mp-search-scan.png" alt="微信搜索铁柱AGI，扫码关注公众号" width="420" />
  &nbsp;&nbsp;
  <img src="assets/wechat/community-group-qr.png" alt="作者微信二维码，加上后可申请付费社群" width="200" />
</p>

<p align="center"><sub>左：微信公众号 <strong>铁柱AGI</strong>。右：作者个人微信。付费社群需要邀请，加上这个微信后再申请。</sub></p>

---

> [!NOTE]
> **这是什么。** grok-bot-avatar-engine 是 **Grok Bot 客户端自带头像渲染器的移植**，不是照葫芦画瓢的另一套实现。画形状、眼睛和动作的那套渲染器就在 `data/extracted/src/avatar-engine.js` 里：六百多个声明，从解包后的应用 bundle 里逐字节取出，每一个都由 `tools/extract/closure.py` 打上 bundle 偏移和 sha1。`src/` 下面是它下层（四元数数学、网格构建）的可读转写，对应测试直接执行 bundle 原文做差分，转写一旦跑偏就红。
>
> **不是 xAI 的产品，不是 Cursor 的产品，也不是 Grok Bot 应用本身**——这是别人的代码，由 [铁柱AGI](https://x.com/cgnot996) 以移植形式保留。见 [LICENSE](LICENSE) 与 [SECURITY.md](SECURITY.md)。
>
> 同一位作者还做了 [Grok App](https://github.com/RongleCat/grok-app)（本机 Grok Build CLI 的桌面工作台）和 [grok-bot-sdk](https://github.com/RongleCat/grok-bot-sdk)（协议客户端）。它们是不同的程序。

---

## 安装

Node.js **22.13 或更新**。只有 ESM。运行时没有 npm 依赖。

```sh
npm install github:RongleCat/grok-bot-avatar-engine
```

```js
import { renderAvatarSvg } from 'grok-bot-avatar-engine';

document.querySelector('#bot').innerHTML = renderAvatarSvg({
  agentId: '33cf1aae-3a51-452d-b761-34a6ccb62201',
  state: 'working',
  size: 96,
});
```

这就是客户端的渲染器：网格投影、挖空的眼睛、南瓜的棱和柄。`renderAvatarSvg` 和 `createAvatar` 只是它的绑定，自己一个像素都不画；`resolveAvatar`、`SHAPES`、`COLORS`、`STATES` 这些读的都是客户端自己的表。

这层绑定不是墙。`grok-bot-avatar-engine/engine` 是保留 bundle 原名的移植引擎，绑定不够用时直接从那里调：

```js
import { client } from 'grok-bot-avatar-engine';

const driver = client.eo({ body: 'pumpkin' });
client.go(driver, 'working', { seed: 20261101, isCompact: false, isResting: false });
driver.advance(1.2);
client.hp(client.Xg(driver.frame(), client.o_('#FF6700'), 96, 'bot', { displaySize: 96, extent: '100%' }));
```

省略 `time` 就是客户端给静止头像落定的那一帧；给了秒数，就按播放循环的方式把驱动推到那一刻。锁色的形状认自己的颜色：给南瓜指定蓝色，出来的还是橙色。

在浏览器里，`createAvatar(element, options)` 挂的就是客户端自己的组件，所以限帧、标签页隐藏时跳过、离屏暂停和指针注视全都自带。

```sh
node examples/preview.mjs
node examples/showcase.mjs
```

展示页是一个文件，不是服务：`examples/showcase.html` 打开就能看，引擎直接内联在页面里。页面里每个像素都来自 `avatar-engine.js`，形状表、颜色表、固定色规则和状态表都从客户端自己的表里读（`ln`、`nn`、`cn`、`lo`）。

## 移植覆盖到哪

- **渲染器。** 客户端的网格管线在这里跑通：`Xg` → `Dp` → `Fp`/`Rp`/`Lp` → 投影（`nl`、`ol`、`rl`）、奇偶多边形并集（`ru`）、南瓜的距离场（`Ff`）和柄（`Lf`），最后 `kp`/`hp` 出 SVG。眼睛是挖出来的，不是画上去的：网格路径用 SVG mask 打孔，轮廓路径把眼睛接进外形。
- **形体。** 客户端 `ei` 表里的 26 个全在内，包括 `ln` 的 25 个选择器形状和 `i_` 那几个别名（blob→sphere、flower→starFlower、heart→heartChubby、star→star6）。
- **动作。** 客户端的有状态驱动 `eo`（弹簧、注视、眨眼、戳、morph、静置）和它在 `lo` 状态表上的片段机 `go`——53 个状态。姿态按精灵图分辨率量化，和客户端一致，这也是它缓存能命中的原因。
- **身份。** `An`/`jn`/`Mn` 把 agent id 解成形状和颜色；`cn`/`ti` 让南瓜锁在 `orange`，并且不提供色板。
- **来源。** `data/extracted/manifest.json` 记录每个符号、数据表和字面量的 bundle、偏移、长度与 sha1。`tools/extract/closure.py` 按 `closure-seeds.txt` 重建引擎；`tools/extract/loop.py` 只用渲染时真正抛出的 ReferenceError 来长这份名单，没有一条是猜的。

这个包早先自带的那套正面轮廓近似已经删掉。大角度偏航现在是真正的网格转向；橙色主 Bot 星标也一起删了——`#f59312` 其实是应用主题色板里的 `yellow/0`，0.78.1 的渲染器里根本没有那颗星。

## 联动的头像

角色对 agent 状态的反应走客户端自己的机器：

```js
import { eo, go, Xg, hp, o_, no } from 'grok-bot-avatar-engine/engine';

const driver = eo({ body: 'cloud' });
const machine = go(driver, 'working', { seed: 20261101, isCompact: false, isResting: false });
driver.advance(1 / 60);
machine.advance(1 / 60);
const svg = hp(Xg(driver.frame(), o_('#FF309B'), 96, 'cloud', { displaySize: 96, extent: '100%' }));
```

`setState('finished')` 放完一次性片段再转到 `next`；`setCompact(true)` 切到小槽位片段；`setGaze(rect, point)` 让头转向指针；`d_()` 在 prefers-reduced-motion 下按客户端那套定帧流程落回静止帧。这些都是客户端的行为，不是照着复刻的。

角色外面的背板、环、堆叠、角标和首字母那一层，符号已经连同偏移记在 manifest 里（`mark-svg`、`stack-layout`、`indicator-geometry`、`initials-*`），但还没移植。

以下是同一次提取里还值得记的细节：

- id 字符串按 UTF-16 哈希，连字符和大小写保持原样，全大写是另一个角色。身份算法从 0.70.2 到 0.78.1 没变。
- `avatarShape` 和 `avatarColor` 各自覆盖一个字段；有图片地址时改画图片。
- 客户端没有球体和南瓜的眼位行，这两个都用同一个兜底。
- 片段播放顺序是客户端的带种子洗牌，不是声明顺序；一次性状态（`finished`、`failed`、`approving`）把片段各放一遍再转到它的 `next`。
- 客户端把南瓜收在 `sand_pumpkin_2026` 实验开关后面，这个包对所有调用方直接放开。

## 文档

指南和接口，中英两份：

- 中文：https://ronglecat.github.io/grok-bot-avatar-engine/zh/
- English：https://ronglecat.github.io/grok-bot-avatar-engine/

```sh
npm install
npm test
npm run docs:dev
```

## 相关项目

| 项目 | 是什么 |
|---|---|
| [grok-bot-sdk](https://github.com/RongleCat/grok-bot-sdk) | Grok Bot 0.78.1 桌面协议的客户端。它算出头像参数，不负责画。 |
| [Grok App](https://github.com/RongleCat/grok-app) | 本机 Grok Build CLI 的开源桌面工作台。[grok-app.com](https://grok-app.com) |
| [awesome-grok-bot](https://github.com/RongleCat/awesome-grok-bot) | Grok Bot 社区索引 |
| [Grok Bot 学习站](https://bot.tiezhu.si/) | 从安装到组一个 bot 团队：例程、案例、用法 |

## 作者和社区

| 渠道 | 哪里 |
|---|---|
| X | [@cgnot996（铁柱AGI）](https://x.com/cgnot996) |
| 微信公众号 | 搜索 **铁柱AGI**，或扫上面左边的码 |
| 付费社群 | 扫右边的码加上作者微信，再申请加入 |
| 学习站 | [bot.tiezhu.si](https://bot.tiezhu.si/) |

页首那一排是这个包自己画的：橙色的云、紫色的水滴、黑色的圆、绿色的六边形、蓝色的方圆。它不是 xAI 的标志。

MIT 许可证。Copyright 2026 RongleCat.
