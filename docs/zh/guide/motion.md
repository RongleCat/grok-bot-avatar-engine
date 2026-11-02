# 动画

动作是客户端自己的，不是照着重新对时间的。干活的是两条声明：

```js
import { client, STATES } from 'grok-bot-avatar-engine';

const driver = client.eo({ body: 'cloud' });
const machine = client.go(driver, 'working', {
  seed: 20261101,
  isCompact: false,
  isResting: false,
});

for (let frame = 0; frame < 120; frame++) {
  machine.advance(1 / 60);
  driver.advance(1 / 60);
}
driver.frame(); // { body, quat, zoom, offset, squash, squashAnchor, eyes, glow, ... }
```

`eo` 是有状态驱动：弹簧、指针注视、眨眼、戳、morph 和一个静置姿态。`go` 是跑在客户端 `lo` 表上的片段机。`frame()` 就是 `Xg` 要画的那个东西。`createAvatar` 把这三样连同客户端自己的组件循环一起接好了，所以多数调用方根本碰不到这段。

## 姿态是量化过的

在画任何东西之前，驱动的姿态会被吸附到一个取决于精灵图尺寸的步长上，偏航也会从 ±90° 的万向节位置挪开。这是客户端的 `jp`/`Mp`/`Np`/`Pp`，也是同一个头像在同一时刻两次产出同样路径的原因——网格缓存就是以它作键。因此同一个形状在两个不同尺寸下不会共用一条缓存。

## 状态

`STATES` 是 `lo` 的 53 个键。每项给出片段，另外可选地给出一个表情、一个 morph、一个 `next` 状态和一个 `holdSeconds`：

| 状态 | 片段 | 说明 |
|---|---|---|
| `idle` | Idle_B, Idle_B, Idle_D, Idle_B, Idle_A | 紧凑：只有 Idle_B |
| `blocked` | Blocked_A | 停留 120 秒，然后 `drowsy` |
| `finished` | Done_B, Done_A | 表情 happy，然后 `idle` |
| `failed` | Blocked_B | 然后 `idle` |
| `approving` | Rotation_C | 然后 `idle` |
| `waking` | Idle_B | 表情 surprised，1.6 秒后 `idle` |
| `streaming` | Streaming_A/B/C | |
| `reading`, `working`, `coding`, `running`, `computing`, `controlling` | Working 那一组 | |
| `logo` | Logo_A, Logo_B | |
| `showcase` | 那四条 Marketing | |
| `turntable` | Rotation_B | 转满一圈，最接近预览的那一条 |
| `orbit`, `radar`, `progress`, `spawning`, `dictating`, `sending`, `receiving`, `uploading`, `writing`, `alerting`, `bouncing`, `powering-down` | Idle_B | 各带一个同名的 morph |

带 `next` 但没有 `holdSeconds` 的状态是一次性的：`finished`、`failed` 和 `approving` 把各自的片段播一遍就往下走。其余的都循环。不认识的状态名就是客户端处理它的样子——`lo[name]` 是 undefined，片段机会抛错——所以请先对着 `STATES` 校验。

## 顺序

片段机不按声明的顺序播。它按你以 `seed` 传进去的数字种子建一个随机源，把该状态的片段列表洗一遍，再从队列里往外取，抽干就重洗一次，保证下一段不是刚播过的那段。开场那段片段从一个随机相位起（传 `firstPhase: 0` 可以钉住），之后每段片段再播都从相位 0 起。这就是两个停在 `idle` 的 bot 永远对不齐的原因，也是同一个种子传两次会得到同一次运行的原因。

## 眼睛和表情

眨眼关键帧不是一只闭住的眼。客户端把它展开成一条眼睑斜坡——在 0.26 秒窗口里的一部分时间合上、其余时间睁开——重新睁开时还带一点过冲。这些时长记在 manifest 里的 `blink-dur`、`close-full`、`close-blink` 和 `reopen-peak`，由 `eo` 施加；这个包不重新推导它们。

表情取自客户端的 `ni` 表，再经 `ai` 别名，所以一条按实验室拼法写的片段也能落在正确的脸上。改它有三条路：驱动的 `holdFace`、`setExpression` 和 `setEmphasis`。

## 静帧

`renderAvatarSvg` 不带 `time` 时走的是客户端自己的静帧流程：暂停、倒回，然后按 `l_` 秒一步走 `c_` 步。带 `time` 时按 `1 / maxFrameRate` 把驱动和片段机推到那一刻。

`d_()` 报告系统的减弱动态效果偏好，客户端对减弱动态的头像处理得和静帧完全一样。`createAvatar` 从组件那里继承了这条行为，你不需要自己实现。
