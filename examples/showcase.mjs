/**
 * Generate examples/showcase.html: the client's avatar renderer, running in a
 * browser page, with nothing of mine in the picture.
 *
 *   node examples/showcase.mjs
 *
 * The engine is data/extracted/src/avatar-engine.js — the client's own
 * declarations, byte for byte, cut out of the app bundle by
 * tools/extract/closure.py. This script inlines it into a module script and
 * drops the trailing export list, because the page code lives in the same
 * scope and calls the declarations by their bundle names. Shapes, colours,
 * states, the pumpkin's pinned colour and the reduced-motion behaviour all come
 * out of the client's own tables; the page only arranges them and redraws.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(join(root, 'data/extracted/src/avatar-engine.js'), 'utf8');
const engine = source.replace(/\nexport \{[^}]*\};\n?$/, '\n');
if (engine === source) {
  throw new Error('avatar-engine.js has no export list to strip; regenerate it');
}
if (/^\s*export /m.test(engine)) {
  throw new Error('avatar-engine.js still contains an export statement');
}


const PAGE = String.raw`<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Grok Bot 头像引擎 · 客户端渲染器移植</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 28px 24px 56px;
    background: #f4f2ee; color: #1f1d1a;
    font: 14px/1.5 -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
  }
  .wrap { max-width: 1040px; margin: 0 auto; }
  h1 { font-size: 20px; margin: 0 0 4px; letter-spacing: .01em; }
  .sub { margin: 0 0 22px; color: #6f6a62; font-size: 13px; }
  .stage {
    display: grid; grid-template-columns: 224px 1fr; gap: 24px;
    background: #fff; border-radius: 20px; padding: 22px;
  }
  .plate {
    width: 224px; height: 224px; border-radius: 18px; background: #f4f2ee;
    display: grid; place-items: center; overflow: hidden;
  }
  .plate svg { width: 190px; height: 190px; }
  fieldset { border: 0; margin: 0 0 16px; padding: 0; }
  legend { font-size: 12px; color: #6f6a62; margin-bottom: 8px; padding: 0; }
  .row { display: flex; flex-wrap: wrap; gap: 8px; }
  button {
    font: inherit; cursor: pointer; border: 1px solid transparent; background: none;
    border-radius: 12px; padding: 0; color: inherit;
  }
  button:disabled { cursor: default; opacity: .38; }
  .shape { width: 56px; height: 56px; background: #f4f2ee; display: grid; place-items: center; }
  .shape svg { width: 44px; height: 44px; }
  .shape[aria-pressed="true"] { border-color: #1f1d1a; }
  .swatch { width: 30px; height: 30px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 0 1px #d8d3cb; }
  .swatch[aria-pressed="true"] { box-shadow: 0 0 0 2px #1f1d1a; }
  .state { padding: 4px 10px; border-radius: 999px; background: #f4f2ee; font-size: 12px; }
  .state[aria-pressed="true"] { background: #1f1d1a; color: #f4f2ee; }
  .note { color: #6f6a62; font-size: 12px; margin: 10px 0 0; }
  .grid { margin-top: 26px; display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 12px; }
  .cell { background: #fff; border-radius: 16px; padding: 10px 6px 8px; text-align: center; }
  .cell svg { width: 68px; height: 68px; }
  .cell b { display: block; font-weight: 500; font-size: 11px; color: #6f6a62; margin-top: 2px; }
  input { font: inherit; padding: 6px 10px; border: 1px solid #d8d3cb; border-radius: 10px; background: #fff; width: 220px; }
  @media (max-width: 720px) { .stage { grid-template-columns: 1fr; } .plate { margin: 0 auto; } }
</style>
</head>
<body>
<div class="wrap">
  <h1>Grok Bot 头像引擎</h1>
  <p class="sub">页面里的每一个像素都出自 <code>data/extracted/src/avatar-engine.js</code>：客户端渲染器原样移植，无重写、无改名、无补图。</p>

  <div class="stage">
    <div class="plate" id="plate"></div>
    <div>
      <fieldset>
        <legend>形状 · <code>ln</code> 客户端形状池</legend>
        <div class="row" id="shapes"></div>
      </fieldset>
      <fieldset id="colorField">
        <legend>颜色 · <code>nn</code> 客户端色表</legend>
        <div class="row" id="colors"></div>
      </fieldset>
      <fieldset>
        <legend>联动状态 · <code>lo</code> 客户端状态表</legend>
        <div class="row" id="states"></div>
      </fieldset>
      <fieldset style="margin-bottom:0">
        <legend>agent id · 决定默认形状与颜色</legend>
        <input id="agent" value="agent_01" spellcheck="false">
        <p class="note" id="identity"></p>
      </fieldset>
    </div>
  </div>

  <div class="grid" id="roster"></div>
</div>

<script type="module">
%ENGINE%

// ---- 页面装配：只调用上面的客户端声明，不产生任何图形 --------------------
const plate = document.getElementById('plate');
const shapesBox = document.getElementById('shapes');
const colorsBox = document.getElementById('colors');
const colorField = document.getElementById('colorField');
const statesBox = document.getElementById('states');
const rosterBox = document.getElementById('roster');
const agentBox = document.getElementById('agent');
const identityLine = document.getElementById('identity');

const FILL = f_({}).fill;
const reducedMotion = d_();
const pinned = new Map(cn.map((entry) => [entry.shape, entry.pickerColor]));
const hexOf = (id) => nn.find((entry) => entry.id === id)?.value ?? nn[0].value;

// id 是 Xg 给 <svg>、<g id="x-body">、<mask id="x-holes"> 用的前缀，一个实例
// 一个，撞了就会跨实例解析 use/mask——客户端自己也是每个组件传自己的 t.id。
// eo() 要的是渲染体名，形状池里是选择器名（blob/flower/heart/star 是别名）。
const makeAvatar = (name, colorId, size, id) => {
  const driver = eo({ body: i_(name) });
  return {
    name,
    id,
    colorId,
    size,
    driver,
    machine: go(driver, 'idle', { seed: u_(name), isCompact: false, isResting: reducedMotion }),
    paint: o_(hexOf(colorId)),
    resolution: Math.round(size * no(FILL) * 100) / 100,
  };
};

const svgOf = (avatar) => hp(Xg(avatar.driver.frame(), avatar.paint, avatar.resolution, avatar.id, {
  isProof: false,
  displaySize: avatar.size,
  extent: '100%',
}));

// 客户端在 reduced-motion / 静态模式下就是这么定帧的（c_ 步，每步 l_ 秒）。
const settle = (avatar) => {
  avatar.driver.pause();
  avatar.driver.seek(0);
  for (let index = 0; index < c_; index++) avatar.driver.advance(l_);
};

const selected = { shape: ln[0], colorId: 'yellow', state: 'idle' };
let hero = null;
const roster = [];
const rosterArt = [];

const isPinned = (name) => pinned.has(name);

function buildHero() {
  hero = makeAvatar(selected.shape, isPinned(selected.shape) ? pinned.get(selected.shape) : selected.colorId, 224, 'hero');
  if (reducedMotion) settle(hero);
  plate.innerHTML = svgOf(hero);
}

function buildControls() {
  shapesBox.innerHTML = '';
  for (const name of ln) {
    const thumb = makeAvatar(name, isPinned(name) ? pinned.get(name) : selected.colorId, 56, 'chip-' + name);
    if (reducedMotion) settle(thumb);
    const button = document.createElement('button');
    button.className = 'shape';
    button.title = name;
    button.setAttribute('aria-pressed', String(name === selected.shape));
    button.innerHTML = svgOf(thumb);
    button.addEventListener('click', () => {
      selected.shape = name;
      buildHero();
      buildControls();
      colorField.hidden = isPinned(name);
    });
    shapesBox.append(button);
  }
  colorField.hidden = isPinned(selected.shape);
  colorsBox.innerHTML = '';
  for (const entry of nn) {
    const button = document.createElement('button');
    button.className = 'swatch';
    button.title = entry.label;
    button.style.background = entry.value;
    button.setAttribute('aria-pressed', String(entry.id === selected.colorId));
    button.addEventListener('click', () => {
      selected.colorId = entry.id;
      buildHero();
      buildControls();
    });
    colorsBox.append(button);
  }
  statesBox.innerHTML = '';
  for (const state of Object.keys(lo)) {
    const button = document.createElement('button');
    button.className = 'state';
    button.textContent = state;
    button.setAttribute('aria-pressed', String(state === selected.state));
    button.addEventListener('click', () => {
      selected.state = state;
      hero.machine.setState(state);
      for (const cell of roster) cell.machine.setState(state);
      statesBox.querySelectorAll('button').forEach((node) => {
        node.setAttribute('aria-pressed', String(node.textContent === state));
      });
    });
    statesBox.append(button);
  }
}

function buildRoster() {
  rosterBox.innerHTML = '';
  roster.length = 0;
  rosterArt.length = 0;
  const identity = An({ agentId: agentBox.value || 'agent_01' });
  identityLine.textContent = 'An({agentId}) → ' + identity.shape + ' / ' + identity.color
    + (isPinned(identity.shape) ? '（该形状锁定颜色，客户端不显示色板）' : '');
  for (const name of ln) {
    const colorId = isPinned(name) ? pinned.get(name) : identity.color;
    const avatar = makeAvatar(name, colorId, 96, 'roster-' + roster.length + '-' + name);
    if (reducedMotion) settle(avatar);
    const cell = document.createElement('div');
    cell.className = 'cell';
    const art = document.createElement('div');
    art.innerHTML = svgOf(avatar);
    cell.append(art, Object.assign(document.createElement('b'), { textContent: name }));
    rosterBox.append(cell);
    roster.push(avatar);
    rosterArt.push(art);
  }
}

buildHero();
buildControls();
buildRoster();

let last = performance.now();
let beat = 0;

// 头像一多，逐帧全量重投影会掉帧：主头像逐帧，花名册隔帧。选择器小图保持静帧，
// 和客户端一致——它们只在换色时重画。
function tick(now) {
  const delta = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!reducedMotion) {
    for (const avatar of [hero, ...roster]) {
      avatar.driver.advance(delta);
      avatar.machine.advance(delta);
    }
    plate.innerHTML = svgOf(hero);
    if ((beat++ & 1) === 0) {
      rosterArt.forEach((art, index) => { art.innerHTML = svgOf(roster[index]); });
    }
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

agentBox.addEventListener('input', () => { buildRoster(); });
plate.addEventListener('pointermove', (event) => {
  const box = plate.getBoundingClientRect();
  hero.driver.setGazeAlways(true);
  hero.driver.setGaze(fa(box, { x: event.clientX, y: event.clientY }));
});
plate.addEventListener('pointerleave', () => {
  hero.driver.setGazeAlways(false);
  hero.driver.setGaze({ x: 0, y: 0 });
});
</script>
</body>
</html>
`;

// A string replacement would interpret `$&` and friends in the bundle text,
// which is full of `$`-prefixed names, so the engine goes in through a function.
writeFileSync(join(root, 'examples/showcase.html'), PAGE.replace('%ENGINE%', () => engine));
const report = JSON.parse(readFileSync(join(root, 'data/extracted/avatar-engine.json'), 'utf8'));
console.log('examples/showcase.html — %d declarations, %s, app %s',
  report.declarations.length, report.sha1, report.appVersion);
