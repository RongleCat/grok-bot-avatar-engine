# 接口

```js
import {
  resolveAvatar,
  renderAvatarSvg,
  createAvatar,
  poseAt,
  bodyPath,
  SHAPES,
  PALETTE,
  STATES,
} from 'grok-bot-avatar-engine';
```

## `resolveAvatar(agentId | input)`

返回一个云端 agent id 对应的角色。

| 字段 | 含义 |
|---|---|
| `algorithmVersion` | `'grok-bot-0.70.2'` |
| `kind` | `'character'` 或 `'picture'` |
| `shape`、`color` | 公开 id |
| `baseHex`、`lightHex`、`darkHex` | 调色板 |
| `sources.shape`、`sources.color` | `'explicit'` 或 `'id-default'` |
| `picture` | `{ url, version }` 或 `null` |
| `hash`、`shapeHash`、`shapeIndex`、`colorIndex` | 整数配方 |

id 缺失时抛 `AVATAR_AGENT_ID_REQUIRED`。

## `renderAvatarSvg(options)`

返回一段 SVG。常用选项：

| 选项 | 默认 | 含义 |
|---|---|---|
| `agentId` | | 推导形状和颜色 |
| `shape`、`color` | blob、blue | 没有 id 时使用。设置了就会覆盖 id |
| `avatarShape`、`avatarColor`、`avatarUrl`、`avatarDataUrl`、`avatarVersion` | | 与 `resolveAvatar` 相同的字段 |
| `theme` | `'light'` | 选择 `lightHex` 或 `darkHex` |
| `ink` | 来自颜色 | 任意 SVG 颜色。引号会被转义 |
| `state` | `'idle'` | `STATES` 的一个键 |
| `time` | `0` | 秒 |
| `size` | `120` | 像素宽高 |
| `main` | `false` | 橙色星标和挖孔 |
| `compact` | `size < 48` 时为 true | 闲置只用 Idle_B |
| `reducedMotion` | `false` | 把时间固定在 0 |
| `id` | 自动生成 | mask 和 clip 的 id。手写拼接多段 SVG 时请自己指定 |
| `forceCharacter` | `false` | 即使有 `avatarUrl` 也画角色 |

形状不在目录里时抛 `AVATAR_SHAPE_UNKNOWN:<name>`。颜色不在调色板里时抛 `AVATAR_COLOR_UNKNOWN`。

## `createAvatar(element, options)`

每一帧把 SVG 写进 `element`。返回 `{ setState(name), update(partial), destroy() }`。`setState` 会重新计时。不在浏览器里会抛 `AVATAR_DOM_REQUIRED`。

## `poseAt(state, time, { compact })`

返回 `{ clip, face, morph, x, y, turn, yaw, scale, squashX, squashY, blink, look, eyeScaleX, eyeScaleY, tilt }`。

## `bodyPath(shape)`

228.44 画布上拟合后的轮廓 `d`。`outlineSamples(shape)` 返回用来摆放眼睛的采样点。

## 常量

`SHAPES`、`DEFAULT_SHAPES`、`BODIES`、`FACES`、`STATES`、`PALETTE`、`DEFAULT_COLORS`、`EYE_SEATS`、`EYE_REFERENCE`、`EYE_UNIT`、`CLIP_NAMES`、`BADGE_SPEC`、`VIEWBOX`（60）、`CANVAS`（`{ center: 114.2705, target: 228.44 }`）。
