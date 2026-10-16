import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const port = Number(process.env.PORT ?? 4174);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
};

const page = `<!doctype html>
<meta charset="utf-8" />
<title>Grok Bot Avatar Engine</title>
<style>
  body { margin: 0; font: 15px/1.4 ui-sans-serif, system-ui, sans-serif; background: #f6f5f3; color: #161616; }
  header { display: flex; justify-content: space-between; gap: 16px; align-items: end; padding: 28px 32px 8px; }
  h1 { margin: 0; font-size: 28px; letter-spacing: -0.03em; }
  p { margin: 4px 0 0; color: #5c5852; }
  main { display: grid; grid-template-columns: repeat(auto-fill, minmax(148px, 1fr)); gap: 12px; padding: 20px 32px 48px; }
  figure { margin: 0; background: white; border-radius: 18px; padding: 12px 12px 8px; }
  figcaption { display: flex; justify-content: space-between; font-size: 12px; color: #6d6862; }
  select, button { font: inherit; }
</style>
<header>
  <div>
    <h1>Grok Bot Avatar Engine</h1>
    <p>Same agent id, 25 shapes, 28 clips. Pick a state and watch the row.</p>
  </div>
  <label>State <select id="state"></select></label>
</header>
<main id="grid"></main>
<script type="module">
  import { SHAPES, STATES, createAvatar, renderAvatarSvg } from './src/index.mjs';
  const state = document.querySelector('#state');
  for (const name of Object.keys(STATES)) {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    state.append(option);
  }
  const handles = [];
  const grid = document.querySelector('#grid');
  const colors = ['orange', 'violet', 'black', 'green', 'blue', 'brown', 'red', 'yellow', 'cyan', 'magenta', 'gray'];
  SHAPES.forEach((shape, index) => {
    const figure = document.createElement('figure');
    const host = document.createElement('div');
    const caption = document.createElement('figcaption');
    caption.innerHTML = '<span></span><span></span>';
    caption.firstElementChild.textContent = shape;
    caption.lastElementChild.textContent = colors[index % colors.length];
    figure.append(host, caption);
    grid.append(figure);
    host.innerHTML = renderAvatarSvg({ shape, color: colors[index % colors.length], size: 120, id: 'boot-' + shape });
    handles.push(createAvatar(host, { shape, color: colors[index % colors.length], state: 'idle', size: 120, id: 'live-' + shape }));
  });
  state.addEventListener('change', () => {
    for (const handle of handles) handle.setState(state.value);
  });
</script>
`;

createServer((request, response) => {
  const url = new URL(request.url ?? '/', 'http://127.0.0.1');
  if (url.pathname === '/') {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(page);
    return;
  }
  const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '');
  if (relative.split('/').includes('..')) {
    response.writeHead(403).end();
    return;
  }
  const file = join(root, relative);
  try {
    const body = readFileSync(file);
    response.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
    response.end(body);
  } catch {
    response.writeHead(404).end();
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`http://127.0.0.1:${port}`);
});
