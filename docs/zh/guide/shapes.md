# 形状和颜色

`SHAPES` 是编辑器顺序，共 25 个名字。`DEFAULT_SHAPES` 是 id 能抽到的 8 个。`toBody` 把公开名字映射到轮廓 id：`blob` 到 `sphere`，`flower` 到 `starFlower`，`heart` 到 `heartChubby`，`star` 到 `star6`。

```js
import { SHAPES, bodyPath, PALETTE, inkFor } from 'grok-bot-avatar-engine';

bodyPath('cloud');
inkFor('brown', 'light'); // #A27952
inkFor('brown', 'dark');  // #855C36
```

`inkFor` 遇到 `PALETTE` 以外的名字会抛 `AVATAR_COLOR_UNKNOWN`。黑色在浅色主题下是 `#000000`，在深色主题下是 `#FFFFFF`。

## 轮廓怎么来的

每条目录路径先按公式画出，再拟合进以 114.2705 为中心、边长 228.44 的盒子。拟合把包围盒中心挪到这个点，再把缩放夹在 `[0.9, 1.35]`。`bodyPath(shape)` 返回拟合后的 `d`。

这些构造和 Grok Bot 0.70.2 的轮廓构建器路径对路径一致：

| 身体 | 构造 |
|---|---|
| pebble、bean、egg、leaf | 极坐标闭合采样，再平滑成三次曲线 |
| squircle、gem | 超椭圆 |
| square、hex、house、wedge | 圆角多边形 |
| tablet、capsule、cylinder、dome、arch | 贝塞尔圆弧 |
| shield | 四段三次曲线 |
| cloud、clover | 圆的并集 |
| teardrop | 圆角尖头接到圆弧底部 |
| heart、sparkle、star | 自带矢量，再做同一次拟合 |

`blob` 是半径 108 的圆，再做同一次拟合。桌面客户端画的是旋转球体，正面就是这个圆。

`crystal` 是 14 个分开的正面圆，和客户端网格里那组互不重叠的小球是同一套位置。从中心做并集会在空射线处捏到一点，所以每颗圆各自是一条子路径。`flower` 是六瓣并集，按 240 个角度采样。客户端把这朵花的轮廓挤出，正面就是这个并集。

`bodyPath('nope')` 抛出 `AVATAR_SHAPE_UNKNOWN:nope`。

![二十五种形状的闲置帧](/shapes.png)

## 眼睛

眼表保存的是 0.70.2 的设计比例。六边形是基准：宽 0.26，高 0.57，间距 0.64。其他身体都按这个基准缩放到同一枚 SVG 胶囊（`EYE_UNIT`）。`shiftY` 为正时，眼睛上移。心形和楔形的胶囊更窄（`squashX` 分别是 0.6 和 0.55）。

眼睛是 `#141414`，带一小块白色高光。没有单独的瞳孔。

## 星标

在 60 单位的 viewBox 里，圆盘直径 16，圆心在 `(52, 52)`，贴住右下角。孔的半径是 `8 + 2.7`。圆盘是 `#f59312`，星星是白色，发丝描边是 `#1c1c1c`，线宽 0.6。身体和眼睛被这个孔裁掉。星星本身不被裁。

`size` 只改 SVG 的宽高，不改这些比例。小于 48，或传入 `compact: true` 时，闲置只用紧凑片段。这个开关不改变星星的大小。
