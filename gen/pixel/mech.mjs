// Pixel-art rooftop workshop at night -> assets/mech.svg
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Layer, rgb, mix, rng, bayer, glow, FONT, text, textWidth } from './px.mjs';
import { sheet, spriteTimeline } from './sprite.mjs';
import { FW, FH, REST, TIMELINE, POWER_ON, STAND, FOLD, LOOP, ANCHORS, mechFrames } from './sprites/mech.mjs';

const W = 400, H = 168, TW = 800;
const C = {
  sky: ['#07041a', '#120836', '#230b4f', '#3d0f5e', '#661466', '#9c1d6c', '#c8306f'],
  far: '#2b1756', farRim: '#4a2a86', fog: '#c8306f',
  mid: '#150b31', midRim: '#36206e', midDark: '#0c0620',
  near: '#05030c', rim: '#ff3fa4',
  pink: '#ff2e88', cyan: '#3ff0e6', yellow: '#ffd84a', orange: '#ff8a3d', red: '#ff3355',
  core: '#ffe6f4', white: '#f4ecff', rain: '#a9b6ff',
};
const R = rng(11);
const pick = (arr) => arr[Math.floor(R() * arr.length)];
const ri = (a, b) => a + Math.floor(R() * (b - a + 1));

// ---------- sky (static) ----------
const sky = new Layer(W, H);
for (let y = 0; y < H; y++) {
  const t = Math.min(1, y / (H * 0.82)) * (C.sky.length - 1);
  const i = Math.floor(t), f = t - i;
  for (let x = 0; x < W; x++) {
    const c = f > bayer(x, y) && i + 1 < C.sky.length ? C.sky[i + 1] : C.sky[i];
    sky.px(x, y, c);
  }
}
for (let n = 0; n < 90; n++) {
  const y = Math.floor(Math.pow(R(), 2) * H * 0.5);
  sky.px(ri(0, W - 1), y, R() < 0.8 ? '#8f86d8' : C.white, R() < 0.7 ? 0.6 : 1);
}
for (let n = 0; n < 7; n++) {
  const y = ri(30, 95), x0 = ri(-40, W), len = ri(40, 140);
  for (let x = x0; x < x0 + len; x++) {
    const edge = Math.min(x - x0, x0 + len - x) / 20;
    if (bayer(x, y) < Math.min(0.55, edge)) sky.px(x, y, '#ff7ab8', 0.25);
    if (bayer(x, y + 1) < Math.min(0.3, edge)) sky.px(x, y + 1, '#ff7ab8', 0.15);
  }
}

// ---------- helpers ----------
function windows(L, bx, top, bw, base, { lit, cols, w = 1, h = 1, gx = 3, gy = 3, dim = 0.55 }) {
  const main = pick(cols);
  let floorLit = false, run = 0;
  for (let y = top + 3; y < base - 2; y += gy) {
    if (run-- <= 0) { floorLit = R() < lit * 1.6; run = ri(1, 4); }
    for (let x = bx + 2; x + w <= bx + bw - 1; x += gx) {
      if (floorLit && R() < 0.85) L.rect(x, y, w, h, R() < 0.85 ? main : pick(cols), dim + R() * (1 - dim));
      else if (R() < lit * 0.25) L.rect(x, y, w, h, pick(cols), dim * 0.8);
    }
  }
}
function fog(L, from, amount) {
  const f = rgb(C.fog);
  for (let y = from; y < L.h; y++) {
    const t = ((y - from) / (L.h - from)) * amount;
    for (let x = 0; x < L.w; x++) {
      const p = L.get(x, y);
      if (!p || p[3] === 0) continue;
      const q = Math.floor(t * 3 + bayer(x, y)) / 3;
      if (q > 0) L.px(x, y, mix(p.slice(0, 3), f, Math.min(0.7, q)));
    }
  }
}
function sign(L, sx, sy, sw, sh, col, word) {
  if (!word) word = pick(['BAR', 'OPEN', 'HOTEL', 'ESP', 'VOLT', 'NOODLE', 'CYBER']);
  const mask = [];
  for (let j = -4; j < sh + 4; j++) for (let i = -4; i < sw + 4; i++) mask.push(i >= 0 && j >= 0 && i < sw && j < sh ? 1 : 0);
  glow(L, mask, sw + 8, sh + 8, sx - 4, sy - 4, col, 2, 0.35);
  L.rect(sx, sy, sw, sh, '#14061f');
  L.rect(sx, sy, sw, 1, col); L.rect(sx, sy + sh - 1, sw, 1, col);
  L.rect(sx, sy, 1, sh, col); L.rect(sx + sw - 1, sy, 1, sh, col);
  [...word].slice(0, Math.floor((sh - 3) / 8)).forEach((ch, k) => text(L, ch, sx + 1, sy + 2 + k * 8, col));
}

// ---------- far skyline ----------
const far = new Layer(TW, H, { wrapX: true });
for (let x = 0; x < TW;) {
  const bw = ri(8, 26), bh = ri(48, 108), top = H - bh;
  far.rect(x, top, bw, bh, C.far);
  far.rect(x, top, bw, 1, C.farRim);
  far.rect(x + bw - 1, top, 1, bh, C.farRim, 0.6);
  if (R() < 0.35) { const sw = Math.max(3, bw - ri(4, 8)); far.rect(x + ((bw - sw) >> 1), top - ri(4, 10), sw, 12, C.far); }
  if (R() < 0.4) { const ax = x + ri(2, bw - 2), ah = ri(5, 14); far.rect(ax, top - ah - 6, 1, ah + 6, C.farRim); far.px(ax, top - ah - 7, C.red); }
  windows(far, x, top, bw, H, { lit: 0.1, cols: [C.cyan, C.cyan, C.pink, C.yellow], dim: 0.35 });
  x += bw + (R() < 0.25 ? ri(1, 3) : 0);
}
fog(far, H - 70, 0.9);

// ---------- mid skyline ----------
const mid = new Layer(TW, H, { wrapX: true });
for (let x = 0; x < TW;) {
  const bw = ri(20, 50), bh = ri(48, 108), top = H - bh;
  mid.rect(x, top, bw, bh, C.mid);
  mid.rect(x, top, bw, 1, C.midRim);
  mid.rect(x + bw - 2, top, 2, bh, C.midRim, 0.7);
  mid.rect(x, top, 1, bh, C.midDark);
  if (R() < 0.5) {
    const cw = bw - ri(6, 12), cx = x + ((bw - cw) >> 1);
    mid.rect(cx, top - 6, cw, 6, C.mid); mid.rect(cx, top - 6, cw, 1, C.midRim);
    if (R() < 0.6) { mid.rect(cx + 2, top - 10, 5, 4, C.midDark); mid.rect(cx + 2, top - 10, 5, 1, C.midRim); }
  }
  if (R() < 0.45) { const ax = x + ri(3, bw - 3); mid.rect(ax, top - 22, 1, 22, C.midRim); mid.px(ax, top - 23, C.red); }
  windows(mid, x, top, bw, H, { lit: 0.16, cols: [C.cyan, C.yellow, C.pink, C.orange], w: 2, h: 1, gx: 4, gy: 4, dim: 0.5 });
  if (bw > 34 && R() < 0.28) {
    const pw = Math.min(30, bw - 8), py = top + ri(8, 20), px0 = x + 4;
    for (let j = 0; j < 12; j++) for (let i = 0; i < pw; i++) {
      const t = (i / pw) * 2; const c = t + bayer(i, j) * 0.6 > 1.2 ? C.pink : '#6a1aa0';
      mid.px(px0 + i, py + j, c);
    }
    mid.rect(px0 - 1, py - 1, pw + 2, 1, C.cyan); mid.rect(px0 - 1, py + 12, pw + 2, 1, C.cyan);
    { const wd = pick(['HOLO', 'NOVA', 'CHIP', 'SYNC', 'ZERO']).slice(0, Math.floor((pw - 2) / 6)); text(mid, wd, px0 + Math.max(1, (pw - wd.length * 6 + 1) >> 1), py + 2, C.white, 1, 0.95); }
  }
  if (R() < 0.5) { const n = ri(3, 5); sign(mid, R() < 0.5 ? x - 7 : x + bw, top + ri(6, 24), 7, n * 8 + 3, pick([C.pink, C.cyan, C.yellow, C.orange])); }
  x += bw + (R() < 0.55 ? ri(4, 16) : 0);
}
fog(mid, H - 45, 0.55);

// ---------- workshop roof layer ----------
const workshop = new Layer(W, H);
// floor (wet rooftop)
workshop.rect(0, 140, W, 28, '#0c0620');
for (let x = 0; x < W; x++) if (bayer(x, 140) < 0.75) workshop.px(x, 140, C.rim, 0.55);
for (let y = 140; y < 168; y += 7) workshop.rect(0, y, W, 1, '#1a1030');
for (let band = 0; band < 4; band++) {
  const y0 = 140 + band * 7;
  const off = (band % 2) ? 8 : 0;
  for (let x = off; x < W; x += 16) {
    for (let y = y0; y < Math.min(y0 + 7, 168); y++) workshop.px(x, y, '#1a1030');
  }
}
function puddle(x0, x1, colour) {
  for (let x = x0; x <= x1; x++) {
    for (let y = 141; y <= 160; y++) {
      if ((y - 141) % 3 === 2) continue;
      if (bayer(x, y) < 0.45) workshop.px(x, y, colour, 0.25 * (1 - (y - 141) / 20));
    }
  }
}
puddle(108, 114, C.cyan);
puddle(176, 262, C.yellow);
puddle(300, 399, C.pink);
for (let n = 0; n < 30; n++) workshop.px(ri(0, W - 1), ri(140, 167), '#a9b6ff', 0.5);
// wall/shed
workshop.rect(0, 70, 120, 70, '#120b22');
workshop.rect(0, 70, 120, 1, '#3a2560');
workshop.rect(118, 70, 2, 70, '#ff3fa4', 0.5);
for (let y = 78; y < 140; y += 8) workshop.rect(0, y, 120, 1, '#1b1430');
// window grid
for (let yy = 82; yy <= 106; yy += 12) for (let xx = 10; xx <= 46; xx += 14) {
  workshop.rect(xx - 1, yy - 1, 8, 6, '#05030c');
  workshop.rect(xx, yy, 6, 4, C.cyan, 0.7);
  workshop.rect(xx, yy, 6, 1, C.white, 0.3);
  workshop.px(xx, yy, C.white, 0.9);
}
// pegboard
for (let yy = 76; yy <= 120; yy += 6) for (let xx = 58; xx <= 108; xx += 6) workshop.px(xx, yy, '#0a0614', 0.8);
// tool silhouettes
workshop.rect(62, 88, 1, 8, '#4a3a7a');
workshop.rect(61, 88, 3, 2, '#4a3a7a');
workshop.px(62, 86, '#7a6ab0');
workshop.rect(78, 86, 1, 10, '#4a3a7a');
workshop.rect(77, 86, 3, 2, '#7a6ab0');
workshop.rect(92, 90, 1, 7, '#4a3a7a');
workshop.rect(91, 90, 3, 1, '#7a6ab0');
// rivets
for (let y = 74; y < 140; y += 8) for (let x = 4; x < 118; x += 12) workshop.px(x, y, '#2e2350');
// pipes
for (const py of [92, 95]) {
  workshop.rect(0, py, 118, 1, '#2e2350');
  workshop.rect(0, py - 1, 118, 1, '#4a3a7a');
}
// valve wheel
const vx = 40, vy = 89;
for (let i = 0; i < 5; i++) { workshop.px(vx + i, vy, '#ff3355'); workshop.px(vx + i, vy + 4, '#ff3355'); workshop.px(vx, vy + i, '#ff3355'); workshop.px(vx + 4, vy + i, '#ff3355'); }
// poster
workshop.rect(20, 104, 10, 12, '#14061f');
workshop.rect(20, 104, 10, 1, C.pink);
workshop.rect(20, 115, 10, 1, C.pink);
workshop.rect(20, 104, 1, 12, C.pink);
workshop.rect(29, 104, 1, 12, C.pink);
for (let k = 0; k < 3; k++) for (let i = 0; i < 6; i += 2) workshop.px(22 + i, 107 + k * 3, C.cyan);
// cable
for (let s = 0; s <= 40; s++) {
  const t = s / 40;
  const x = Math.round(118 + (150 - 118) * t);
  const linearY = 104 + (122 - 104) * t;
  const y = Math.round(linearY + 6 * Math.sin(Math.PI * t));
  workshop.px(x, y, '#1b1430');
}
// roll-up shutter door
for (let y = 100; y < 120; y += 2) {
  const col = ((y - 100) / 2) % 2 === 0 ? '#2e2350' : '#1b1430';
  workshop.rect(66, y, 36, 1, col);
}
for (let y = 120; y < 140; y++) for (let x = 66; x < 102; x++) {
  const t = (y - 120) / 20;
  const col = t > 0.6 ? '#ffd84a' : '#ff8a3d';
  if (bayer(x, y) < 0.4) workshop.px(x, y, col, 0.35);
}
for (let y = 124; y < 140; y += 4) workshop.rect(68, y, 32, 1, '#120b22');
for (let y = 141; y <= 150; y++) for (let x = 66; x < 102; x++) {
  if (bayer(x, y) < 0.25) workshop.px(x, y, '#ff8a3d', 0.25);
}
// neon sign LAB
sign(workshop, 108, 78, 7, 3 * 8 + 3, C.cyan, 'LAB');
// right side railing
workshop.rect(300, 135, 100, 1, '#1a1030');
for (let i = 0; i < 100; i += 5) workshop.rect(300 + i, 135, 1, 5, '#1a1030');
// stacked crates
const labels = ['K1', 'IO', '5V'];
let li = 0;
for (let cx = 305; cx < 395; cx += 18) {
  const ch = 10 + (cx % 3) * 4;
  const cy = 140 - ch;
  workshop.rect(cx, cy, 14, ch, '#120b22');
  workshop.rect(cx, cy, 14, 1, '#05030c');
  workshop.rect(cx, cy + ch - 1, 14, 1, '#05030c');
  workshop.rect(cx, cy, 1, ch, '#05030c');
  workshop.rect(cx + 13, cy, 1, ch, '#05030c');
  for (let y = cy + 3; y < cy + ch; y += 3) workshop.rect(cx + 1, y, 12, 1, '#1b1430');
  for (let i = 0; i < Math.min(14, ch); i++) {
    const x = cx + i;
    const y = cy + Math.floor(i * (ch - 1) / 13);
    if (y >= cy && y < cy + ch) workshop.px(x, y, '#2e2350');
  }
  workshop.rect(cx + 13, cy, 1, ch, '#ff3fa4', 0.5);
  if (ch >= 12) text(workshop, labels[li % labels.length], cx + 2, cy + 3, '#4a3a7a');
  li++;
}
// AC unit
workshop.rect(330, 120, 24, 18, '#120b22');
workshop.rect(330, 120, 24, 1, '#3a2560');
workshop.rect(332, 123, 20, 14, '#05030c');
for (let d = -6; d <= 6; d++) { workshop.px(342 + d, 130, '#3a2560'); workshop.px(342, 130 + d, '#3a2560'); }
for (let d = -4; d <= 4; d++) { workshop.px(342 + d, 130 + d, '#3a2560'); workshop.px(342 + d, 130 - d, '#3a2560'); }
// ---------- workbench layer ----------
const bench = new Layer(W, H);
bench.rect(120, 124, 170, 1, '#b8aee0');
bench.rect(120, 125, 170, 1, '#7a6ab0');
bench.rect(120, 126, 170, 1, '#7a6ab0');
bench.rect(120, 127, 170, 1, '#4a3a7a');
bench.rect(120, 128, 170, 1, '#4a3a7a');
bench.rect(120, 129, 170, 1, '#2e2350');
bench.rect(120, 130, 170, 4, '#1b1430');
for (let y = 130; y < 134; y++) for (let x = 120; x < 290; x++) if (bayer(x, y) < 0.2) bench.px(x, y, '#2e2350');
const dx = 175, dy = 130, dw = 40, dh = 4;
bench.rect(dx, dy, dw, 1, '#4a3a7a');
bench.rect(dx, dy + dh - 1, dw, 1, '#4a3a7a');
bench.rect(dx, dy, 1, dh, '#4a3a7a');
bench.rect(dx + dw - 1, dy, 1, dh, '#4a3a7a');
bench.rect(dx + Math.floor((dw - 3) / 2), dy + 1, 3, 1, '#b8aee0');
for (const lx of [128, 170, 240, 280]) {
  bench.rect(lx, 134, 3, 7, '#1b1430');
  bench.rect(lx + 2, 134, 1, 7, '#4a3a7a');
}
bench.rect(119, 123, 172, 1, '#05030c');
bench.rect(119, 134, 172, 1, '#05030c');
bench.rect(119, 123, 1, 12, '#05030c');
bench.rect(290, 123, 1, 12, '#05030c');
// soldering iron
for (let i = 0; i < 8; i++) bench.px(132 + i, 124 - i, '#b8aee0');
bench.rect(130, 122, 3, 2, '#4a3a7a');
// coil of solder
for (const [cx, cy] of [[150, 121], [151, 121], [152, 121], [150, 122], [152, 122], [150, 123], [151, 123], [152, 123]]) bench.px(cx, cy, '#ffd84a');
bench.px(151, 122, '#1b1430');
// oscilloscope
bench.rect(128, 114, 16, 10, '#1b1430');
bench.rect(129, 115, 14, 8, '#05030c');
for (let i = 0; i < 14; i++) bench.px(129 + i, 119 + (i % 3 === 0 ? -1 : 0), C.cyan, 0.9);
// parts tray
bench.rect(245, 118, 18, 6, '#4a3a7a');
bench.rect(246, 119, 16, 4, '#1b1430');
// multimeter
bench.rect(270, 115, 6, 9, C.yellow);
bench.rect(271, 116, 4, 3, '#05030c');

// ---------- lamp + cone ----------
const lamp = new Layer(W, H);
function thickLine(L, x0, y0, x1, y1, c1, c2) {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let s = 0; s <= steps; s++) {
    const x = Math.round(x0 + (x1 - x0) * s / steps);
    const y = Math.round(y0 + (y1 - y0) * s / steps);
    L.px(x, y, c1);
    L.px(x + 1, y, c2);
  }
}
// base clamp
lamp.rect(284, 123, 5, 3, '#2e2350');
lamp.rect(284, 123, 5, 1, '#7a6ab0');
// lower arm
thickLine(lamp, 285, 121, 276, 92, '#4a3a7a', '#2e2350');
const lSteps = Math.max(Math.abs(276 - 285), Math.abs(92 - 121));
for (let s = 0; s <= lSteps; s++) {
  const x = Math.round(285 + (276 - 285) * s / lSteps);
  const y = Math.round(121 + (92 - 121) * s / lSteps);
  const col = s % 2 === 0 ? '#b8aee0' : '#4a3a7a';
  lamp.px(x - 2, y, col);
}
// joint
lamp.rect(275, 91, 3, 3, '#7a6ab0');
lamp.px(276, 92, '#b8aee0');
// upper arm
thickLine(lamp, 276, 92, 246, 70, '#4a3a7a', '#2e2350');
// shade trapezoid
for (let y = 66; y <= 73; y++) {
  const t = (y - 66) / (73 - 66);
  const w = Math.round(6 + (12 - 6) * t);
  const left = Math.round(244 - w / 2);
  for (let x = left; x < left + w; x++) lamp.px(x, y, '#2e2350');
  lamp.px(left + w - 1, y, '#7a6ab0');
}
// bulb row
lamp.px(241, 73, '#ffd84a');
lamp.px(242, 73, '#ffd84a');
lamp.rect(243, 73, 5, 1, '#ffe6f4');
lamp.px(248, 73, '#ffd84a');
lamp.px(249, 73, '#ffd84a');

const cone = new Layer(W, H);
const bulbMask = [];
const gw = 13, gh = 7;
for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) bulbMask.push(j === 3 && i >= 3 && i <= 9 ? 1 : 0);
glow(cone, bulbMask, gw, gh, 237, 70, '#ffd84a', 3, 0.6);
for (let y = 74; y <= 123; y++) {
  const t = (y - 74) / (123 - 74);
  const left = Math.round(238 + (176 - 238) * t);
  const right = Math.round(250 + (262 - 250) * t);
  const width = right - left;
  const coreLeft = left + Math.round(width * 0.3);
  const coreRight = right - Math.round(width * 0.3);
  for (let x = left; x <= right; x++) {
    if (bayer(x, y) < 0.25) cone.px(x, y, '#ffd84a', 0.16 * (1 - t * 0.4));
    if (x >= coreLeft && x <= coreRight && bayer(x, y) < 0.5) cone.px(x, y, '#ffd84a', 0.1);
  }
}
for (let y = 124; y <= 125; y++) for (let x = 176; x <= 262; x++) cone.px(x, y, '#ffd84a', 0.35);

// ---------- mech sprite ----------
const frames = mechFrames();
const sh = sheet(frames);
const MX = 172, MY = 124 - FH;

// ---------- effects ----------
const sparks = new Layer(24, 16);
const sparkColors = ['#ffd84a', '#ffe6f4', '#ff8a3d'];
const sparkPts = [[4, 8], [6, 5], [8, 10], [10, 6], [12, 9], [14, 4], [16, 8], [18, 6]];
sparkPts.forEach(([x, y], i) => sparks.px(x, y, sparkColors[i % 3]));

const puff = new Layer(7, 7);
for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) {
  const d = (x - 3) ** 2 + (y - 3) ** 2;
  if (d <= 9 && bayer(x, y) < 0.7) puff.px(x, y, '#f4ecff', 0.35);
}

const coilGlow = new Layer(13, 13);
const coilMask = Array(13 * 13).fill(0);
for (let dy = 5; dy <= 7; dy++) for (let dx = 5; dx <= 7; dx++) coilMask[dy * 13 + dx] = 1;
glow(coilGlow, coilMask, 13, 13, 0, 0, C.cyan, 3, 0.9);

// ---------- rain ----------
const rain = new Layer(W, H, { wrapX: true, wrapY: true });
for (let n = 0; n < 170; n++) {
  const x = ri(0, W - 1), y = ri(0, H - 1), len = ri(3, 6), a = 0.25 + R() * 0.35;
  for (let k = 0; k < len; k++) rain.px(x - (k >> 1), y + k, C.rain, a);
}

// ---------- compose ----------
const img = (L, x = 0, y = 0, cls = '') =>
  `<image${cls ? ` class="${cls}"` : ''} x="${x}" y="${y}" width="${L.w}" height="${L.h}" href="${L.uri()}"/>`;
const strip = (L, cls) => `<g class="${cls}">${img(L, 0)}${img(L, TW)}</g>`;

const pct = (t) => +((t / LOOP) * 100).toFixed(3);

// sparks keyframes
const sparkKeys = [
  `0%{opacity:0}`,
  `${pct(POWER_ON)}%{opacity:1}`,
  `${pct(POWER_ON + 0.1)}%{opacity:0}`,
  `${pct(POWER_ON + 0.2)}%{opacity:1}`,
  `${pct(POWER_ON + 0.3)}%{opacity:0}`,
  `${pct(POWER_ON + 0.4)}%{opacity:0}`,
  `100%{opacity:0}`,
];

// steam keyframes
const steamKeys = [
  `0%{opacity:0;transform:translateY(0px)}`,
  `${pct(STAND)}%{opacity:0.8;transform:translateY(0px)}`,
  `${pct(STAND + 1)}%{opacity:0;transform:translateY(-10px)}`,
  `${pct(STAND + 3.5)}%{opacity:0.8;transform:translateY(0px)}`,
  `${pct(STAND + 4.5)}%{opacity:0;transform:translateY(-10px)}`,
  `100%{opacity:0;transform:translateY(0px)}`,
];

// coil keyframes
const coilKeys = [`0%{opacity:0}`, `${pct(STAND)}%{opacity:0.5}`];
let coilOp = 0.5;
for (let i = 1; i * 0.5 + STAND <= FOLD; i++) {
  const t = STAND + i * 0.5;
  if (t > FOLD) break;
  coilOp = (i % 2 === 0) ? 0.5 : 1;
  coilKeys.push(`${pct(t)}%{opacity:${coilOp}}`);
}
coilKeys.push(`${pct(FOLD)}%{opacity:0}`);
coilKeys.push(`100%{opacity:0}`);

// cone keyframes
const conePct60 = LOOP * 0.6;
const coneKeys = [
  `0%{opacity:0.9}`,
  `${pct(LOOP * 0.58)}%{opacity:0.9}`,
  `${pct(conePct60)}%{opacity:0.5}`,
  `${pct(LOOP * 0.62)}%{opacity:0.9}`,
  `100%{opacity:0.9}`,
];

const st = spriteTimeline('mech', FW, TIMELINE, { rest: REST });

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="1000" height="420" role="img" shape-rendering="crispEdges" aria-label="Pixel-art rooftop workshop at night in the rain: a dev board on a workbench powers up, unfolds into a small mech, idles with a glowing coil, then folds back">
<style>
image{image-rendering:pixelated;image-rendering:crisp-edges}
.far{animation:pan 160s steps(800) infinite}
.mid{animation:pan 80s steps(800) infinite}
.rain{animation:rain .45s steps(9) infinite}
@keyframes pan{to{transform:translateX(-${TW}px)}}
@keyframes rain{from{transform:translate(0,0)}to{transform:translate(${-H / 2}px,${H}px)}}
.cone{opacity:0.9;animation:cone-flick ${LOOP}s infinite}
@keyframes cone-flick{${coneKeys.join('')}}
.sparks{opacity:0;animation:sparks-tl ${LOOP}s infinite}
@keyframes sparks-tl{${sparkKeys.join('')}}
.steam{opacity:0;animation:steam-tl ${LOOP}s steps(10) infinite}
@keyframes steam-tl{${steamKeys.join('')}}
.coilglow{opacity:0;animation:coil-tl ${LOOP}s infinite}
@keyframes coil-tl{${coilKeys.join('')}}
@media (prefers-reduced-motion: reduce){*{animation:none!important}.sparks{opacity:0}.steam{opacity:0}.coilglow{opacity:1}}
${st.css}
</style>
${img(sky)}
<g class="far"><image x="0" y="0" width="${TW}" height="${H}" href="${far.uri()}"/><image x="${TW}" y="0" width="${TW}" height="${H}" href="${far.uri()}"/></g>
<g class="mid"><image x="0" y="0" width="${TW}" height="${H}" href="${mid.uri()}"/><image x="${TW}" y="0" width="${TW}" height="${H}" href="${mid.uri()}"/></g>
${img(workshop)}
${img(bench)}
${img(lamp)}
${img(cone, 0, 0, 'cone')}
<g transform="translate(${MX} ${MY})"><clipPath id="mclip"><rect width="${FW}" height="${FH}"/></clipPath><g clip-path="url(#mclip)"><image class="mech" width="${sh.w}" height="${FH}" href="${sh.uri()}"/></g></g>
${img(sparks, MX + ANCHORS.led[0] - 12, MY + ANCHORS.led[1] - 8, 'sparks')}
${img(puff, MX + ANCHORS.steamL[0] - 3, MY + ANCHORS.steamL[1] - 3, 'steam')}
${img(puff, MX + ANCHORS.steamR[0] - 3, MY + ANCHORS.steamR[1] - 3, 'steam')}
${img(coilGlow, MX + ANCHORS.coil[0] - 6, MY + ANCHORS.coil[1] - 6, 'coilglow')}
<g class="rain">${[0, W].map((x) => [-H, 0].map((y) => img(rain, x, y)).join('')).join('')}</g>
</svg>
`;
const out = fileURLToPath(new URL('../../assets/mech.svg', import.meta.url));
writeFileSync(out, svg);
console.log('WROTE assets/mech.svg', Math.round(svg.length / 1024) + ' KB');