# API

画面里的一切都出自客户端渲染器。下面几个函数只是它的绑定，不加几何、不加配色计算、不加动作。

```js
import {
  resolveAvatar,
  renderAvatarSvg,
  createAvatar,
  SHAPES,
  BODIES,
  COLORS,
  STATES,
  COMPACT_SIZE,
  bodyFor,
  colorValue,
  pinnedColor,
  paintOf,
  client,
} from 'grok-bot-avatar-engine';
```

## `renderAvatarSvg(options)`

返回一段 `<svg>` 字符串。选项名就是客户端组件自己的 prop 名，`shape` / `color` 是 `body` / `appearance` 的可读写法。

| 选项 | 默认 | 含义 |
|---|---|---|
| `shape` | | `SHAPES` 里的名字，经 `bodyFor` 解析成渲染体 |
| `agentId` | | 没给 `shape` 时用它推形状和颜色 |
| `avatarShape`、`avatarColor` | | 客户端原本的覆盖字段 |
| `color` | | `COLORS` 的 id，或任意 CSS 颜色 |
| `state` | `'idle'` | `STATES` 的键 |
| `time` | 静帧 | 秒。省略就取客户端落到的那一帧，给数值就把驱动推到那一刻，和播放循环一致 |
| `size` | `96` | CSS 像素 |
| `seed` | 用 `id` | 片段洗牌与入场相位 |
| `id` | `avatar-<shape>` | 给 defs 加命名空间，页面上每个实例一个 |
| `fill` | `.6` | 精灵图在画框里的占比 |
| `resolution` | 由 `fill` 推 | 直接指定精灵尺寸 |
| `isStatic`、`isPlaying`、`maxFrameRate` | 客户端默认 | 动效开关，`isStatic` 走静帧那条路 |
| `isProof` | `false` | 客户端的着色网格调试视图 |

既没有形状也没有 agent id 时抛错；既没有颜色也没有 agent id 时同样抛错。锁色的形状会保住自己的颜色：给南瓜指定蓝色，出来的还是橙色。

## `createAvatar(element, options)`

把客户端的组件挂到 `element` 上，返回 `{ update, setState, setBody, setPlaying, setExpression, blink, look, restart, poke, gaze, destroy }`。限帧、标签页隐藏时跳过、离屏暂停、指针注视，都是这个组件自己的行为，不是照着复刻的。省略 `size` 就交给元素的盒子决定，客户端在自适应槽位里就是这么用的。

## `resolveAvatar(agentId | input)`

走客户端带实验开关的解析器，返回 `{ shape, color }`，所以显式的 `avatarShape: 'pumpkin'` 会保留，不会被推导出的形状顶掉。图片头像不归这个函数管：应用在渲染器之上换照片，那段代码不在头像引擎里。

## 表与辅助函数

| 导出 | 客户端来源 |
|---|---|
| `SHAPES` | `ln`，26 个选择器名字，顺序一致 |
| `BODIES` | `ei`，渲染器实际接受的 26 个名字 |
| `COLORS` | `nn`，`{ id, label, value }` |
| `STATES` | `lo` 的键 |
| `COMPACT_SIZE` | `s_`（48），低于它改用紧凑片段 |
| `bodyFor(shape)` | `i_`：blob 到 sphere、flower 到 starFlower、heart 到 heartChubby、star 到 star6 |
| `colorValue(id)` | 查 `nn` |
| `pinnedColor(shape)` | 查 `cn`；0.78.1 里只有南瓜，锁 `orange` |
| `paintOf(ink, spot?)` | `o_`；一个参数把眼睛挖空，两个参数改为把眼睛画出来 |

## `client`

剥掉封装的移植引擎。`client.eo`、`client.go`、`client.Xg`、`client.hp`、`client.p_` 和那些表都保留 bundle 原名，`data/extracted/avatar-engine.json` 记录每一条的偏移、长度和 sha1。上面的绑定不够用时再用它；有稳定形状的那几个在 `index.d.mts` 里有类型。

## 还没移植

角色外面的背板、环、堆叠、状态角标和首字母，符号和偏移都记在 `data/extracted/manifest.json`（`mark-svg`、`stack-layout`、`indicator-geometry`、`initials-*`），但还没暴露出来。主 Bot 的橙色星标在 0.78.1 的渲染器里根本不存在。
