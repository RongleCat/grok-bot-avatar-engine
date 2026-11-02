# 用 agent id 算头像

把你存下来的那个云端 agent id 原样传进来。不要去掉连字符，不要 trim，不要改大小写。`33cf1aae-…` 和 `33CF1AAE-…` 是两个不同的角色，因为哈希走的是 UTF-16 码元。数字 id 按那串数字文本哈希，不按整数。

```js
import { resolveAvatar } from 'grok-bot-avatar-engine';

resolveAvatar('agent_01');            // { shape: 'blob', color: 'yellow' }
resolveAvatar({ agentId: 'x', avatarShape: 'pumpkin' }); // pumpkin survives
```

`resolveAvatar` 就是客户端自己的 `jn`：先从 id 推出两个字段，再让显式的 `avatarShape` 或 `avatarColor` 各自顶掉自己那一项。用 `jn` 而不是 `An`，是因为 `An` 只接受那 25 个普通选择器名字，于是一个显式指定的南瓜——一个受实验开关管控的形状——会被悄悄换回推导出来的那个。

## 推导读了什么

| 字段 | 客户端符号 | 它索引的池子 |
|---|---|---|
| 形状 | `Dn` | `dn`，平面列表里那八个名字：blob、pebble、squircle、tablet、wedge、hex、cloud、teardrop |
| 颜色 | `Tn` | `_n`，十个名字：brown、red、orange、yellow、green、cyan、blue、violet、magenta、gray |
| 网格形状 | `Mn` | `fn`，3D 客户端从中挑的十三个：blob、cloud、square、sparkle、clover、heart、flower、teardrop、tablet、wedge、house、star、hex |

两条路都从同一个 FNV-1a 起步，走的还是那些码元——种子 `2166136261`、乘子 `16777619`、`Math.imul`、无符号右移，也就是 `bn`（以及它的孪生 `u_`）——然后各自再混淆一次才去索引：形状走 `En`，颜色走 `xn`/`Cn`，其中 `Cn` 抽一次 Mulberry32 再按 `_n.length` 取整。所以这两个字段是同一次哈希上的两次独立抽样，不是同一个数读两遍。**`black` 在 `COLORS` 里，但不在 `_n` 里**，而 `Cn` 被夹在这个池子里：id 永远推不出黑色，只有显式 `avatarColor: 'black'` 才行。

一个 bot 侧边栏里那一行是从平面列表抽的、它的 3D 角色却来自网格池，两边可以跟自己不一致。这是客户端的行为，不是一个要抹平的问题。`resolveAvatar` 给的是平面的答案，`client.Mn` 给网格那个。

## 两个池子里都没有南瓜

`cn` 记着它，带 `pickerGate: 'sand_pumpkin_2026'`，应用只有在开关打开且形状是手工指定时才走得到它。这个包没有开关：`resolveAvatar({ agentId, avatarShape: 'pumpkin' })` 对任何调用方都成立，`renderAvatarSvg` 也不管你指定了什么颜色，都保住那枚锁定的橙色。

## 图片地址不在这里

应用在渲染器之上换照片：`avatarUrl`、`avatarDataUrl` 和 `avatarPhoto` 都在它自己的 bundle 里处理，一个都到不了头像引擎。这个包收一个形状和一个颜色，返回一段 SVG。如果你存了图片，那一步在调用之前自己决定。
