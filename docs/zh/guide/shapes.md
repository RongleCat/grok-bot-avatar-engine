# 形状和颜色

```js
import { SHAPES, BODIES, COLORS, bodyFor, pinnedColor, colorValue } from 'grok-bot-avatar-engine';

SHAPES.length;        // 26, the picker list (ln) in the client's order
BODIES.length;        // 26, what the renderer takes (ei)
bodyFor('flower');    // 'starFlower'
COLORS[3];            // { id: 'orange', label: 'Orange', value: '#FF6700' }
pinnedColor('pumpkin'); // 'orange'
```

四个选择器名字是某个身体的别名：`blob` 是球体，`flower` 是 `starFlower`，`heart` 是 `heartChubby`，`star` 是 `star6`。`bodyFor` 用的就是客户端自己的那张映射（`i_`），不是这里另存的一份名单。

## 身体是怎么画的

客户端把每个身体建成一个实体再投影，这个包跑的就是同一段代码。一个轮廓是客户端 `_l` 表里的某一种构造——旋转、放样、挤出、圆角板、胶囊、内切小球、晶体，或者一个距离场——投影把它变成你看到的那条轮廓，所以大角度偏航是网格转向，不是压扁。

有两个数决定每条轮廓：拟合把轮廓的中心对到 `L`，再按目标半径缩放，并把倍数夹在一个区间里。两个数都从 bundle 里读，它们的偏移记在 `data/extracted/manifest.json` 的 `canvas-centre`、`fit-params` 和 `fit-apply` 里。

`crystal` 是一簇小球，所以它的轮廓是好几条环，由客户端的并集流程（`ru`，一次奇偶合并）收成一条带多个子路径的 `<path>`。`cloud` 和 `clover` 同样是并集。身体始终只有一条 `<path>`；输出里多出来的那几条，是 mask 携带的眼睛，外加南瓜的柄。

`pumpkin` 是唯一一个客户端不从轮廓建出来的身体。它步进一个带棱的超椭球距离场，在若干倾斜带里取最宽的表面点，再加一套独立的柄网格，用它自己的双色表上色。这条路径上的每个常量都在 manifest 里：`pumpkin-radius`、`pumpkin-silhouette`、`pumpkin-contours`、`pumpkin-contour-walk`、`pumpkin-stem` 和 `pumpkin-paints`。南瓜从来不是一条路径，就是因为那根梗。

## 眼睛是挖出来的

没有任何一笔在画眼睛。网格那条路，发射器写一个 `<mask>`——白底矩形减去眼睛形状——身体透过它绘制，于是页面从眼睛里透出来。平面那条路，眼睛的环作为额外的子路径接进身体轮廓。两条都是客户端的代码，区别只是这个身体走哪个渲染器。

眼位取自客户端的 `Oo` 表（manifest 里的 `eye-seats`），基准胶囊是 `Do`。这张表没有球体那一行，也没有南瓜那一行，客户端对这两个改为把眼睛形状投到那些曲面上。

## 颜色

`COLORS` 就是客户端的 `nn` 表：十一个 id，每项一个平面十六进制色。头像身体没有浅色和深色两套——bundle 里那些 `light-dark()` 成对的是界面墨色，不是角色的。

```js
renderAvatarSvg({ shape: 'pumpkin', color: 'blue', size: 96 }); // still orange
```

`pinnedColor` 读客户端的 `cn` 表。0.78.1 里南瓜是唯一一项，它锁 `orange`，并且挂在 `sand_pumpkin_2026` 实验开关后面。头像编辑器遇到锁色的形状会把整行颜色去掉，`showcase.html` 也照这个做。

## 不在这里

橙色主 Bot 星标不是 0.78.1 渲染器的一部分。`#f59312` 是应用主题色板里的 `yellow/0` 令牌，而这个包早先版本画的那颗星是从正面视角近似长出来的，不是客户端的。它随那段代码一起没了。

![二十六种形状](/shapes.png)
