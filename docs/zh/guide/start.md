# 开始

需要 Node.js 22.13 或更新版本。只提供 ESM。运行时没有 npm 依赖。

这个包从 GitHub 发布，不在 npm 注册表上。

```sh
npm install github:RongleCat/grok-bot-avatar-engine
```

画一帧：

```js
import { renderAvatarSvg } from 'grok-bot-avatar-engine';

const svg = renderAvatarSvg({
  agentId: '33cf1aae-3a51-452d-b761-34a6ccb62201',
  state: 'idle',
  size: 120,
});
```

省略 `time`，拿到的就是客户端给静止头像落定的那一帧。给 `time: 1.2`，驱动就像播放循环那样被推到那一刻。id 走客户端自己的配方解析，所以形状和颜色就是那个 bot 在应用里的那一套。

挂一个会动的头像：

```js
import { createAvatar } from 'grok-bot-avatar-engine';

const avatar = createAvatar(document.querySelector('#bot'), {
  agentId: '33cf1aae-3a51-452d-b761-34a6ccb62201',
  state: 'working',
  size: 88,
});

avatar.setState('finished');
avatar.destroy();
```

`createAvatar` 挂的是客户端自己的组件，所以限帧、`document.hidden` 时跳过和离屏暂停都跟着来了。省略 `size` 就交给元素的盒子决定。`renderAvatarSvg` 在 Node 里也能用，完全不需要 DOM。

在本仓库里：

```sh
node examples/render-svg.mjs <agent-id> idle 1.2 > /tmp/bot.svg
node examples/sheet.mjs
node examples/showcase.mjs
node examples/preview.mjs
```

`examples/showcase.mjs` 写出 `examples/showcase.html`，一个把引擎内联进去的自包含页面：形状选择器、颜色选择器、状态列表和指针注视。`examples/preview.mjs` 起在 `http://127.0.0.1:4174`，直接 import 你工作树里的 `src/index.mjs`，所以看到的就是你正在改的东西。用 HTTP 打开它；`file://` 页面 import 不了包模块。

## 里面有什么

| 部分 | 来自哪里 |
|---|---|
| 身体 | 客户端 `ei` 表里的 26 个名字，由各自的网格投影出来 |
| 形状 | `ln` 里的 26 个选择器名字，由 `i_` 把 blob、flower、heart 和 star 映射过去 |
| 颜色 | `nn` 的 11 条；南瓜锁 `orange`，也不给它出颜色那一行 |
| 眼睛 | 挖出来的，从来不画：网格那条路是一个 SVG 蒙版，平面那条路是接进轮廓的子路径 |
| 状态 | `lo` 的 53 个键，落在 28 条片段上 |
| 动作 | 客户端的驱动 `eo` 和片段机 `go`，包括带种子的洗牌 |
| 身份 | `jn`，带实验开关的解析器，所以显式指定的南瓜会保留 |
| 南瓜 | 客户端自己的距离场和梗的网格，对所有调用方都能解析 |

## 这不是什么

这是桌面客户端渲染器的移植，不是照着它另画一套。`data/extracted/src/avatar-engine.js` 里的声明就是应用自己的字节，从 bundle 里切出来并记好了偏移。`src/` 里的代码绑定并驱动那个渲染器，它自己什么都不画。

早先文档承诺的两件事，随着它们赖以成立的正面视角近似一起没了。大角度偏航现在是一次真正的网格转向，不再是横向压扁。而橙色主 Bot 星标在 0.78.1 的渲染器里根本不存在——`#f59312` 只是应用主题色板里的 `yellow/0` 令牌——所以这个包不再提供 `main` 选项。

角色外面的背板、环、堆叠、状态角标和首字母是客户端自己的组合层，还没移植；它们的符号记在 `data/extracted/manifest.json` 里。

这个包不登录、不发网络请求，也不读你装的 Grok Bot。图片地址由应用自己在渲染器之上处理，所以这里没有一处接受它。

它由 [铁柱AGI](https://x.com/cgnot996) 维护。不是 xAI 的产品，不是 Cursor 的产品，也不是 [Grok App](https://github.com/RongleCat/grok-app) 的一部分。
