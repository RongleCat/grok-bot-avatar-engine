# 开始

需要 Node.js 22.13 或更新版本。只提供 ESM。运行时没有 npm 依赖。

包从 GitHub 安装，不在 npm 注册表上。

```sh
npm install github:RongleCat/grok-bot-avatar-engine
```

画一帧静止图：

```js
import { renderAvatarSvg } from 'grok-bot-avatar-engine';

const svg = renderAvatarSvg({
  agentId: '33cf1aae-3a51-452d-b761-34a6ccb62201',
  state: 'idle',
  time: 0,
  size: 120,
  main: true,
});
```

这个 id 是棕色的云。`main: true` 加上橙色星标，并在身体上挖一个孔，让星星落在轮廓里面。`time` 是这个状态开始后的秒数。

在浏览器里挂一个会动的头像：

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

`createAvatar` 需要 `requestAnimationFrame`。在 Node 里用 `renderAvatarSvg`，自己推进 `time`。

在本仓库里：

```sh
node examples/render-svg.mjs <agent-id> idle 0 > /tmp/bot.svg
node examples/preview.mjs
```

预览页是 `http://127.0.0.1:4174`，会播放全部形状。用 HTTP 打开。`file://` 页面无法加载动作数据。

## 里面有什么

| 部分 | 行为 |
|---|---|
| 身份 | 对 agent id 字符串做 FNV-1a，再取 8 个形状之一和 10 个颜色之一 |
| 轮廓 | 拟合后的 SVG 路径。其中 22 条与 Grok Bot 0.70.2 的轮廓构建器一致 |
| 眼睛 | 深色胶囊，一小块白色高光，眼位按 0.70.2 的眼表缩放 |
| 动作 | 28 条片段和完整状态表，包括 blocked 停留 120 秒 |
| 星标 | 在 60 的 viewBox 上，圆盘直径 16，挖孔再加 2.7。橙色 `#f59312`，白星，发丝描边 `#1c1c1c` |

## 这不是什么

Grok Bot 桌面客户端把这些身体画成三维网格：旋转体、放样或挤出，再投影眼睛胶囊。这个库画的是正面轮廓，并用同一套片段做 SVG 动画。正面、没有大角度转身时，剪影是同一个。这里的偏航是横向压扁，客户端里是网格转向。云的体积和星星的厚度在这里是平的。

这个包不包含桌面客户端的渲染器，也不登录，也不访问网络。

它是 [铁柱AGI](https://x.com/cgnot996) 的独立库。不是 xAI 的产品，不是 Cursor 的产品，也不是 [Grok App](https://github.com/RongleCat/grok-app) 的一部分。
