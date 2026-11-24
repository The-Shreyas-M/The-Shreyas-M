// Neura: liquid-glass tower with terminal-HUD crown and holographic frames scrolling down its facade.
import { Layer, rgb, mix, rng, bayer, glow, FONT, text, textWidth } from '../px.mjs';
import { sheet, spriteSvg, spriteTimeline } from '../sprite.mjs';

const C = {
  sky: ['#07041a', '#120836', '#230b4f', '#3d0f5e', '#661466', '#9c1d6c', '#c8306f'],
  far: '#2b1756', farRim: '#4a2a86', fog: '#c8306f',
  mid: '#150b31', midRim: '#36206e', midDark: '#0c0620',
  near: '#05030c', rim: '#ff3fa4',
  pink: '#ff2e88', cyan: '#3ff0e6', yellow: '#ffd84a', orange: '#ff8a3d', red: '#ff3355',
  core: '#ffe6f4', white: '#f4ecff', rain: '#a9b6ff',
};
const METAL = ['#1b1430', '#2e2350', '#4a3a7a', '#7a6ab0', '#b8aee0'];

const W = 72, H = 124;

const base = new Layer(W, H);

// 1. Glass shaft
{
  for (let y = 22; y <= 115; y++) {
    const t = (y - 22) / 93;
    for (let x = 16; x <= 55; x++) {
      if (bayer(x, y) < t) base.px(x, y, '#0a1030');
      else base.px(x, y, '#14204a');
    }
  }
  // reflection streaks
  for (let y = 22; y <= 115; y++) {
    const x1 = 77 - y;
    if (x1 >= 16 && x1 <= 55) base.px(x1, y, C.cyan, 0.35);
    const x2 = 69 - y;
    if (x2 >= 16 && x2 <= 55) base.px(x2, y, C.cyan, 0.35);
  }
  // transoms
  for (let y = 32; y <= 112; y += 10) base.rect(16, y, 40, 1, METAL[2]);
  // mullions
  for (const mx of [24, 32, 40, 48]) base.rect(mx, 22, 1, 94, METAL[3]);
  // left shadow columns
  for (let y = 22; y <= 115; y++) for (let d = 0; d < 3; d++) base.px(16 + d, y, '#0a1030', 0.55);
  // right edge
  base.rect(54, 22, 1, 94, METAL[3]);
  base.rect(55, 22, 1, 94, C.rim);
  // outline
  for (let y = 22; y <= 115; y++) { base.px(13, y, '#05030c'); base.px(58, y, '#05030c'); }
  for (let x = 14; x <= 57; x++) base.px(x, 21, '#05030c');
}

// 6. Side fins
{
  base.rect(14, 22, 2, 94, METAL[2]);
  base.rect(56, 22, 2, 94, METAL[2]);
  for (let k = 0; 22 + 12 * k <= 115; k++) base.px(57, 22 + 12 * k, C.pink);
}

// 2. Holo panel
{
  base.rect(25, 41, 22, 38, '#060a1e');
  base.rect(24, 40, 24, 1, C.cyan, 0.8);
  base.rect(24, 79, 24, 1, C.cyan, 0.8);
  base.rect(24, 40, 1, 40, C.cyan, 0.8);
  base.rect(47, 40, 1, 40, C.cyan, 0.8);
}

// 3. HUD crown
{
  base.rect(10, 6, 52, 16, METAL[1]);
  base.rect(10, 6, 3, 16, METAL[0]);
  base.rect(60, 6, 1, 16, METAL[3]);
  base.rect(61, 6, 1, 16, C.rim);
  base.rect(13, 9, 46, 10, '#05030c');
  text(base, 'NEURA', 14, 10, C.cyan, 1);
  base.rect(14, 17, 31, 1, C.pink);
  base.rect(45, 17, 14, 1, METAL[2]);
  // outline
  for (let y = 6; y <= 21; y++) base.px(9, y, '#05030c');
  for (let x = 10; x <= 61; x++) { base.px(x, 5, '#05030c'); base.px(x, 22, '#05030c'); }
}

// 4. Spire
{
  base.rect(35, 0, 2, 6, METAL[3]);
  base.rect(35, 0, 2, 1, C.red);
  for (let y = 0; y <= 5; y++) { base.px(34, y, '#05030c'); base.px(37, y, '#05030c'); }
}

// 5. Base lobby
{
  base.rect(12, 116, 48, 8, METAL[2]);
  base.rect(12, 116, 3, 8, METAL[1]);
  base.rect(58, 116, 1, 8, METAL[3]);
  base.rect(59, 116, 1, 8, C.rim);
  base.rect(28, 118, 16, 6, C.cyan, 0.45);
  base.rect(28, 118, 16, 1, C.core);
  base.px(14, 122, C.pink);
  base.px(57, 122, C.pink);
  // outline
  for (let y = 116; y <= 123; y++) { base.px(11, y, '#05030c'); base.px(60, y, '#05030c'); }
  for (let x = 12; x <= 59; x++) base.px(x, 115, '#05030c');
  // dither bottom
  for (let y = 116; y <= 123; y++) {
    const thr = (y - 104) / 20;
    for (let x = 12; x <= 59; x++) {
      const p = base.get(x, y);
      if (!p || p[3] === 0) continue;
      const t = rgb(METAL[2]);
      if (p[0] === t[0] && p[1] === t[1] && p[2] === t[2] && bayer(x, y) < thr) base.px(x, y, METAL[1]);
    }
  }
}

// Animation frames
function circlePixels() {
  const out = [];
  for (let y = 0; y < 10; y++) for (let x = 0; x < 22; x++) {
    const d = Math.round(Math.hypot(x - 11, y - 5));
    if (d === 4) out.push([x, y]);
  }
  return out;
}
function trianglePixels() {
  const out = [];
  for (let y = 1; y <= 8; y++) {
    const half = y - 1;
    for (let x = 11 - half; x <= 11 + half; x++) if (x >= 0 && x < 22) out.push([x, y]);
  }
  return out;
}
function barsPixels() {
  const out = [];
  const bars = [{ x: 4, h: 6 }, { x: 9, h: 9 }, { x: 14, h: 4 }];
  for (const b of bars) for (let i = 0; i < b.h; i++) for (let dx = 0; dx < 3; dx++) out.push([b.x + dx, 9 - i]);
  return out;
}
function sinePixels() {
  const out = [];
  for (let x = 0; x < 22; x++) {
    const y = 5 + Math.round(2 * Math.sin(x / 2.5));
    if (y >= 0 && y < 10) out.push([x, y]);
  }
  return out;
}

const glyphPixels = [circlePixels(), trianglePixels(), barsPixels(), sinePixels()];
const glyphColors = [C.cyan, C.pink, C.cyan, C.pink];
const shifts = [0, 3, 6, 9];

const frames = shifts.map((shift, fi) => {
  const L = new Layer(22, 38);
  const pixels = glyphPixels[fi];
  const color = glyphColors[fi];
  for (const baseY of [0, 13, 26]) {
    const y0 = (baseY + shift) % 38;
    for (const [gx, gy] of pixels) L.px(gx, (y0 + gy) % 38, color, 0.85);
  }
  // scanline
  for (let x = 0; x < 22; x++) L.px(x, 2 + 9 * fi, C.core, 1);
  return L;
});

export default {
  label: 'NEURA',
  aria: 'Pixel-art glass skyscraper with a terminal readout crown and holographic frames scrolling down its facade: NEURA',
  h: 124, base,
  anim: { frames, x: 25, y: 41, fw: 22, fh: 38, seq: [[0, 0.75], [1, 0.75], [2, 0.75], [3, 0.75]] },
};
