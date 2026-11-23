// Sprite-sheet helpers: parse character maps into layers, combine frames, emit SVG/CSS animation snippets.
import { Layer } from './px.mjs';

// Parse equal-width character rows into a Layer using a char -> '#rrggbb' palette ('.' and ' ' are transparent).
export function parseSprite(rows, paletteMap) {
  const w = rows[0].length, h = rows.length;
  const layer = new Layer(w, h);
  rows.forEach((row, y) => {
    if (row.length !== w) throw new Error(`sprite row ${y} width mismatch`);
    for (let x = 0; x < w; x++) {
      const ch = row[x];
      if (ch === '.' || ch === ' ') continue;
      if (!(ch in paletteMap)) throw new Error(`unknown palette char "${ch}"`);
      layer.px(x, y, paletteMap[ch]);
    }
  });
  return layer;
}

// Combine equally sized frames into one horizontal sheet layer at x offset i*w.
export function sheet(frames) {
  const w = frames[0].w, h = frames[0].h;
  const out = new Layer(w * frames.length, h);
  frames.forEach((frame, i) => {
    if (frame.w !== w || frame.h !== h) throw new Error('frame size mismatch');
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const p = frame.get(x, y);
      if (p && p[3] > 0) out.px(i * w + x, y, [p[0], p[1], p[2]], p[3] / 255);
    }
  });
  return out;
}

// Return an SVG <g> snippet that clips a sprite sheet to one frame at (x, y).
export function spriteSvg(sheetUri, fw, fh, frames, x, y, cls, { dur = 0.8, id = cls } = {}) {
  return `<g transform="translate(${x} ${y})"><clipPath id="${id}-clip"><rect width="${fw}" height="${fh}"/></clipPath><g clip-path="url(#${id}-clip)"><image class="${cls}" href="${sheetUri}" width="${fw * frames}" height="${fh}" style="image-rendering:pixelated"/></g></g>`;
}

// Return the CSS steps() animation for a sprite sheet, with reduced-motion fallback.
export function spriteCss(cls, fw, frames, dur = 0.8) {
  return `.${cls}{animation:${cls}-run ${dur}s steps(${frames}) infinite}@keyframes ${cls}-run{from{transform:translateX(0)}to{transform:translateX(-${fw * frames}px)}}@media (prefers-reduced-motion:reduce){.${cls}{animation:none}}`;
}
