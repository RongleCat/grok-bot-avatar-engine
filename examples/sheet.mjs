import { writeFileSync } from 'node:fs';
import { renderAvatarSvg } from '../src/index.mjs';

const row = [
  ['cloud', 'orange'],
  ['teardrop', 'violet'],
  ['blob', 'black'],
  ['hex', 'green'],
  ['squircle', 'blue'],
];

writeFileSync(new URL('../assets/avatars-row.svg', import.meta.url), sheet(row, '#f6f4f1'));
writeFileSync(new URL('../assets/avatars-row-dark.svg', import.meta.url), sheet(row, '#111111'));

const shapes = [
  ['blob', 'blue'], ['pebble', 'brown'], ['bean', 'red'], ['egg', 'orange'], ['squircle', 'yellow'],
  ['tablet', 'green'], ['capsule', 'cyan'], ['cylinder', 'blue'], ['hex', 'violet'], ['gem', 'magenta'],
  ['crystal', 'black'], ['wedge', 'orange'], ['shield', 'red'], ['dome', 'cyan'], ['arch', 'brown'],
  ['cloud', 'orange'], ['teardrop', 'violet'], ['leaf', 'green'], ['square', 'blue'], ['sparkle', 'yellow'],
  ['clover', 'magenta'], ['flower', 'red'], ['heart', 'magenta'], ['house', 'brown'], ['star', 'violet'],
  ['pumpkin', 'orange'],
];
writeFileSync(new URL('../assets/shapes.svg', import.meta.url), sheet(shapes, '#f6f4f1', 5));

function sheet(items, background, columns = items.length) {
  const cell = 128;
  const rows = Math.ceil(items.length / columns);
  const width = columns * cell;
  const height = rows * cell;
  // Each avatar keeps its own <svg> root: a mask resolves in the user space of
  // the element that carries it, so stripping the root and pasting the body
  // into a foreign coordinate system makes the eye cut-outs land off the body.
  const bodies = items.map(([shape, color], index) => {
    const svg = renderAvatarSvg({
      shape,
      color,
      state: 'idle',
      time: 0,
      size: 96,
      id: `s${index}`,
    });
    const x = (index % columns) * cell + (cell - 96) / 2;
    const y = Math.floor(index / columns) * cell + (cell - 96) / 2;
    // The client emits a fluid root; nested, `100%` would resolve against the
    // whole sheet, so the cell pins its own viewport.
    return svg
      .replace('<svg ', `<svg x="${x}" y="${y}" `)
      .replace('width="100%" height="100%"', 'width="96" height="96"');
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">\n<rect width="${width}" height="${height}" fill="${background}"/>\n${bodies}\n</svg>\n`;
}
