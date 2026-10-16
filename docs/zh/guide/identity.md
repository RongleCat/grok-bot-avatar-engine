# 用 agent id 算头像

传入你保存的那个云端 agent id 字符串。不要去掉连字符，不要 trim，不要改大小写。`33cf1aae-…` 和 `33CF1AAE-…` 是两个角色。数字 id 按那串数字的文本来哈希，不按整数。

```js
import { resolveAvatar } from 'grok-bot-avatar-engine';

const avatar = resolveAvatar('33cf1aae-3a51-452d-b761-34a6ccb62201');
// 形状 cloud，颜色 brown，种类 character
```

算法版本是 `grok-bot-0.70.2`：

1. 对 UTF-16 码元做 32 位 FNV-1a，乘法用 `Math.imul`。
2. 再混合一次哈希得到形状：`shapeHash % 8`，顺序是 `blob`、`pebble`、`squircle`、`tablet`、`wedge`、`hex`、`cloud`、`teardrop`。
3. 一次 Mulberry32 抽样得到颜色：`floor(random * 10)`，顺序是 brown、red、orange、yellow、green、cyan、blue、violet、magenta、gray。黑色只能显式指定。

空字符串会抛错。`hashBotId` 抛 `AVATAR_KEY_REQUIRED`，`resolveAvatar` 抛 `AVATAR_AGENT_ID_REQUIRED`。

## 覆盖

形状和颜色各自覆盖。不认识的形状或不认识的颜色会被忽略，这一项仍由 id 决定。

```js
resolveAvatar({
  agentId: '33cf1aae-3a51-452d-b761-34a6ccb62201',
  avatarShape: 'hex',
  avatarColor: 'black',
});
```

非空的 `avatarUrl` 或 `avatarDataUrl`，或者非空的 `avatarVersion`，会把 `kind` 设为 `picture`。`renderAvatarSvg` 在有 URL 时画这张图。只有 `avatarVersion` 时不会凭空造一个地址。已经有 URL 仍想画角色时，传 `forceCharacter: true`。

`renderAvatarSvg({ shape: 'hex', color: 'green' })` 不经过 id，直接画这个角色。没有 id 时的默认是蓝色 blob，那只是演示用的默认值。
