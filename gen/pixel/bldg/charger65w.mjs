// charger65w: power-grid substation with crackling electric arcs (65W fast charger).
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

const W = 72, H = 84;

function line(layer, x0, y0, x1, y1, color) {
  let x = x0, y = y0;
  const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  while (true) {
    layer.px(x, y, color);
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x += sx; }
    if (e2 < dx) { err += dx; y += sy; }
  }
}

const base = new Layer(W, H);

// 1. Concrete yard wall
{
  base.rect(0, 72, 72, 12, METAL[1]);
  for (let x = 0; x < 72; x += 8) base.rect(x, 72, 1, 12, METAL[0]);
  for (let y = 72; y <= 73; y++) {
    for (let x = 0; x < 72; x++) {
      base.px(x, y, ((x + y) % 6 < 3) ? C.yellow : '#05030c');
    }
  }
}

// 2. Main transformer block
{
  // outline
  for (let y = 44; y <= 71; y++) { base.px(21, y, '#05030c'); base.px(50, y, '#05030c'); }
  for (let x = 22; x <= 49; x++) { base.px(x, 43, '#05030c'); base.px(x, 72, '#05030c'); }
  // body
  base.rect(22, 44, 28, 28, METAL[2]);
  base.rect(22, 44, 4, 28, METAL[1]); // shadow side
  base.rect(48, 44, 1, 28, METAL[3]);
  base.rect(49, 44, 1, 28, C.rim);
  // cooling fins on left half
  for (let y = 44; y <= 71; y += 2) {
    const col = (((y - 44) / 2) % 2 === 0) ? METAL[1] : METAL[3];
    base.rect(22, y, 14, 1, col);
  }
  // texture on right half
  base.rect(36, 44, 1, 28, METAL[1]);
  for (let y = 44; y <= 71; y += 8) base.rect(36, y, 13, 1, METAL[1]);
  // warning plate
  for (let x = 33; x <= 38; x++) { base.px(x, 49, '#05030c'); base.px(x, 54, '#05030c'); }
  for (let y = 50; y <= 53; y++) { base.px(32, y, '#05030c'); base.px(39, y, '#05030c'); }
  base.rect(33, 50, 6, 4, C.orange);
  base.rect(35, 50, 2, 2, '#05030c');
  base.rect(35, 53, 2, 1, '#05030c');
}

// 3. Insulator stacks (centred on cap x)
for (const cx of [26, 35, 44]) {
  for (let y = 30; y <= 43; y++) {
    base.px(cx - 2, y, '#05030c');
    base.px(cx + 2, y, '#05030c');
  }
  base.px(cx, 29, '#05030c');
  base.px(cx, 30, C.core);
  for (let y = 31; y <= 43; y++) {
    if ((y - 31) % 2 === 0) base.rect(cx - 1, y, 3, 1, METAL[4]);
    else base.px(cx, y, METAL[2]);
  }
  for (let x = cx - 1; x <= cx + 1; x++) base.px(x, 44, '#05030c');
}

// 4. Lattice pylons
function legX(x0, x1, y) {
  const cx = (x0 + x1) / 2;
  const k = (71 - y) / (71 - 8);
  const leftEdge = Math.round(x0 + (Math.floor(cx) - x0) * k);
  const rightEdge = Math.round(x1 + (Math.ceil(cx) - x1) * k);
  return [leftEdge, rightEdge];
}

function drawPylon(x0, x1) {
  const cx = (x0 + x1) / 2;
  // legs
  for (let y = 8; y <= 71; y++) {
    const [le, re] = legX(x0, x1, y);
    base.px(le, y, METAL[1]);
    base.px(le + 1, y, METAL[2]);
    base.px(re - 1, y, METAL[2]);
    base.px(re, y, METAL[3]);
    base.px(le - 1, y, '#05030c');
    base.px(re + 1, y, '#05030c');
  }
  // cross-bracing X every 8 rows
  for (const yb of [16, 24, 32, 40, 48, 56, 64]) {
    const [le, re] = legX(x0, x1, yb);
    line(base, le, yb - 3, re, yb, METAL[3]);
    line(base, re, yb - 3, le, yb, METAL[3]);
  }
  // cross-arm at y 14
  const armL = x0 - 4, armR = x1 + 4;
  base.rect(armL, 13, armR - armL + 1, 2, METAL[2]);
  base.rect(armL, 13, 1, 2, METAL[1]);
  base.rect(armR, 13, 1, 2, METAL[3]);
  for (let x = armL; x <= armR; x++) { base.px(x, 12, '#05030c'); base.px(x, 15, '#05030c'); }
  base.px(armL - 1, 13, '#05030c'); base.px(armL - 1, 14, '#05030c');
  base.px(armR + 1, 13, '#05030c'); base.px(armR + 1, 14, '#05030c');
  // hanging insulators
  for (const tip of [armL, armR]) {
    base.px(tip, 15, METAL[3]);
    base.px(tip, 16, METAL[4]);
    base.px(tip, 17, METAL[2]);
    base.px(tip, 18, METAL[4]);
  }
  // beacon
  const bx = Math.floor(cx);
  base.rect(bx, 6, 2, 2, C.red);
  base.px(bx - 1, 6, '#05030c'); base.px(bx - 1, 7, '#05030c');
  base.px(bx + 2, 6, '#05030c'); base.px(bx + 2, 7, '#05030c');
  base.px(bx, 5, '#05030c'); base.px(bx + 1, 5, '#05030c');
  base.px(bx, 8, '#05030c'); base.px(bx + 1, 8, '#05030c');
}

drawPylon(2, 13);
drawPylon(58, 69);

// 5. Power lines
function cable(x1, y1, x2, y2) {
  const steps = Math.abs(x2 - x1);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = Math.round(x1 + (x2 - x1) * t);
    const y = Math.round(y1 + (y2 - y1) * t + 4 * Math.sin(Math.PI * t));
    base.px(x, y, METAL[0]);
  }
}
cable(17, 14, 26, 30);
cable(54, 14, 44, 30);

// 6. USB-C plug sign
{
  // rounded rect 20x8 at x26..45, y20..27
  base.rect(27, 20, 18, 8, C.midDark);
  base.rect(26, 21, 20, 6, C.midDark);
  // outline
  for (let x = 27; x <= 44; x++) { base.px(x, 19, '#05030c'); base.px(x, 28, '#05030c'); }
  for (let y = 21; y <= 26; y++) { base.px(25, y, '#05030c'); base.px(46, y, '#05030c'); }
  base.px(26, 20, '#05030c'); base.px(45, 20, '#05030c');
  base.px(26, 27, '#05030c'); base.px(45, 27, '#05030c');
  // pill 12x3
  base.rect(31, 22, 10, 3, C.cyan);
  base.rect(30, 23, 12, 1, C.cyan);
}

// 7. Control cabinets
function cabinet(x0) {
  for (let y = 60; y <= 71; y++) { base.px(x0 - 1, y, '#05030c'); base.px(x0 + 6, y, '#05030c'); }
  for (let x = x0; x <= x0 + 5; x++) { base.px(x, 59, '#05030c'); base.px(x, 72, '#05030c'); }
  base.rect(x0, 60, 6, 12, METAL[1]);
  base.rect(x0, 60, 1, 12, METAL[0]);
  base.rect(x0 + 5, 60, 1, 12, METAL[3]);
  base.px(x0 + 1, 61, C.cyan);
  base.px(x0 + 4, 61, C.cyan);
}
cabinet(14);
cabinet(52);

// Fence posts
for (let x = 0; x < 72; x += 6) {
  base.rect(x, 69, 1, 3, METAL[2]);
}

// Dither bottom ~20 rows darker
for (let y = 64; y < H; y++) {
  const t = (y - 64) / 19;
  for (let x = 0; x < W; x++) {
    const p = base.get(x, y);
    if (!p || p[3] === 0) continue;
    let idx = -1;
    for (let i = 0; i < METAL.length; i++) {
      const r = rgb(METAL[i]);
      if (p[0] === r[0] && p[1] === r[1] && p[2] === r[2]) { idx = i; break; }
    }
    if (idx > 0 && bayer(x, y) < t) base.px(x, y, METAL[idx - 1]);
  }
}

// Animation frames
const frames = [];
{
  const core0 = [[4, 4], [5, 3], [6, 2], [7, 1], [8, 0], [9, 1], [10, 2], [11, 3], [12, 4], [13, 4]];
  const L = new Layer(28, 10);
  for (const [x, y] of core0) {
    L.px(x, y, C.core);
    if (x - 1 >= 0) L.px(x - 1, y, C.cyan, 0.8);
    if (x + 1 < 28) L.px(x + 1, y, C.cyan, 0.8);
  }
  const mask = new Array(28 * 10).fill(0);
  for (const [x, y] of core0) mask[y * 28 + x] = 1;
  glow(L, mask, 28, 10, 0, 0, C.cyan, 2, 0.5);
  frames.push(L);
}
{
  const core1 = [[13, 4], [14, 3], [15, 1], [16, 2], [17, 0], [18, 2], [19, 1], [20, 3], [21, 4], [22, 4]];
  const L = new Layer(28, 10);
  for (const [x, y] of core1) {
    L.px(x, y, C.core);
    if (x - 1 >= 0) L.px(x - 1, y, C.cyan, 0.8);
    if (x + 1 < 28) L.px(x + 1, y, C.cyan, 0.8);
  }
  const mask = new Array(28 * 10).fill(0);
  for (const [x, y] of core1) mask[y * 28 + x] = 1;
  glow(L, mask, 28, 10, 0, 0, C.cyan, 2, 0.5);
  frames.push(L);
}
{
  const L = new Layer(28, 10);
  for (const [x, y] of [[4, 4], [13, 4], [22, 4]]) L.px(x, y, C.cyan);
  frames.push(L);
}

export default {
  label: 'CHARGER 65W',
  aria: 'Pixel-art power substation with crackling electric arcs and a USB-C plug sign: 65W fast charger',
  h: 84,
  base,
  anim: { frames, x: 22, y: 26, fw: 28, fh: 10, seq: [[0, 0.3], [2, 0.45], [1, 0.3], [2, 0.45]] },
};