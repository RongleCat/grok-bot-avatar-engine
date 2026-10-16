# 动画

`poseAt(state, timeSeconds, { compact })` 返回采样后的姿态。`renderAvatarSvg` 在你传入 `state` 和 `time` 时使用它。`reducedMotion: true` 会把时间固定在 0。

片段里的缩放静止在 0.6。SVG 播放器除以 0.6，所以闲置从缩放 1 开始，大约在 1.6 秒呼吸到 1.067，再回到 1。偏航变成 `scaleX`，身体最窄不会低于 0.72。滚转（`rotation.z`）会旋转 SVG。位移是片段单位乘 8，落在 60 的 viewBox 里。

眨眼关键帧是 0.16 秒的一次脉冲，不是把眼睛一直闭上。`lids` 轨道从 0 到 1 时，用同样的方式闭上眼睛。状态上的表情名，或片段表情，会改变胶囊：开心更扁，困倦几乎闭上，惊讶更高。`inspect` 对应 inspecting 表情。

## 状态

`STATES` 是 0.70.2 的那张表。

| 状态 | 片段 | 说明 |
|---|---|---|
| idle | Idle_B、Idle_B、Idle_D、Idle_B、Idle_A | 紧凑模式只有 Idle_B |
| listening | Idle_D | 表情 calm |
| thinking | Idle_B | morph thinking |
| streaming | Streaming_A、Streaming_B、Streaming_C | |
| searching | Idle_B | morph radar |
| reading、working、coding、running、computing、controlling | Working_A 到 Working_F | |
| waiting | Idle_B | morph orbit |
| blocked | Blocked_A | 120 秒后进入 drowsy |
| finished | Done_B、Done_A | 表情 happy，然后回到 idle |
| failed | Blocked_B | 然后回到 idle |
| sleeping | Idle_B | 表情 sleepy |
| waking | Idle_B | 表情 surprised，1.6 秒后回到 idle |
| curious | Working_B | 表情 inspecting |
| celebrate | Rotation_A | 表情 happy |
| approving | Rotation_C | 然后回到 idle |
| logo | Logo_A、Logo_B | |
| showcase | Marketing_A 到 Marketing_D | |
| turntable | Rotation_B | |

`loading` 使用 `progress` 这个 morph。`orbit`、`radar`、`progress`、`spawning`、`dictating`、`sending`、`receiving`、`uploading`、`writing`、`alerting`、`bouncing`、`powering-down` 各自播放 Idle_B，并带一个同名 morph。SVG 渲染器把 morph 记在姿态上，不另画一个道具。挤压、位移和表情仍然会播放。

不认识的状态名会退回 idle。

`CLIP_NAMES` 列出 28 条片段：Blocked_A/B/C、Bodymoves_A、Done_A/B/C、Idle_A/B/D、Logo_A/B、Marketing_A 到 D、Rotation_A/B/C、Streaming_A/B/C、Working_A 到 F。
