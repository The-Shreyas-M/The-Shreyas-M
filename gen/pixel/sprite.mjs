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

// Uneven frame timeline: seq = [[frameIndex, seconds], ...] played in order and looped.
// Each frame holds for its seconds (steps(1) between keyframes). Reduced motion rests on frame `rest`.
// Returns { css, total } — total is the loop length in seconds, for syncing other effects.
export function spriteTimeline(cls, fw, seq, { rest = seq[0][0] } = {}) {
  const total = seq.reduce((s, [, t]) => s + t, 0);
  const pct = (t) => +((t / total) * 100).toFixed(3);
  let t = 0;
  const keys = seq.map(([f, d]) => { const k = `${pct(t)}%{transform:translateX(-${f * fw}px)}`; t += d; return k; });
  keys.push(`100%{transform:translateX(-${seq[seq.length - 1][0] * fw}px)}`);
  const css = `.${cls}{animation:${cls}-tl ${+total.toFixed(3)}s steps(1,end) infinite}@keyframes ${cls}-tl{${keys.join('')}}`;
  return { css, total };
}

// Return the CSS steps() animation for a sprite sheet, with reduced-motion fallback.
export function spriteCss(cls, fw, frames, dur = 0.8) {
  return `.${cls}{animation:${cls}-run ${dur}s steps(${frames}) infinite}@keyframes ${cls}-run{from{transform:translateX(0)}to{transform:translateX(-${fw * frames}px)}}`;
}
