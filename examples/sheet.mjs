import { writeFileSync } from 'node:fs';
import { renderAvatarSvg } from '../src/index.mjs';

const row = [
  ['cloud', 'orange'],
  ['teardrop', 'violet'],
  ['blob', 'black'],
  ['hex', 'green'],
  ['squircle', 'blue'],
];

writeFileSync(new URL('../assets/avatars-row.svg', import.meta.url), sheet(row, '#f6f4f1', 'light'));
writeFileSync(new URL('../assets/avatars-row-dark.svg', import.meta.url), sheet(row, '#111111', 'light'));

const shapes = [
  ['blob', 'blue'], ['pebble', 'brown'], ['bean', 'red'], ['egg', 'orange'], ['squircle', 'yellow'],
  ['tablet', 'green'], ['capsule', 'cyan'], ['cylinder', 'blue'], ['hex', 'violet'], ['gem', 'magenta'],
  ['crystal', 'black'], ['wedge', 'orange'], ['shield', 'red'], ['dome', 'cyan'], ['arch', 'brown'],
  ['cloud', 'orange'], ['teardrop', 'violet'], ['leaf', 'green'], ['square', 'blue'], ['sparkle', 'yellow'],
  ['clover', 'magenta'], ['flower', 'red'], ['heart', 'magenta'], ['house', 'brown'], ['star', 'violet'],
];
writeFileSync(new URL('../assets/shapes.svg', import.meta.url), sheet(shapes, '#f6f4f1', 'light', 5));

function sheet(items, background, theme, columns = items.length) {
  const cell = 128;
  const rows = Math.ceil(items.length / columns);
  const width = columns * cell;
  const height = rows * cell;
  const bodies = items.map(([shape, color], index) => {
    const svg = renderAvatarSvg({
      shape,
      color,
      theme,
      state: 'idle',
      time: 0,
      size: 96,
      id: `s${index}`,
    });
    const inner = svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
    const x = (index % columns) * cell + (cell - 96) / 2;
    const y = Math.floor(index / columns) * cell + (cell - 96) / 2;
    return `<g transform="translate(${x} ${y})">${inner}</g>`;
  }).join('');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">\n<rect width="${width}" height="${height}" fill="${background}"/>\n${bodies}\n</svg>\n`;
}
