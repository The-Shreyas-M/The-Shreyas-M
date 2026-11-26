// Pixel-art hardware workbench at night -> assets/bench.svg
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Layer, rgb, rng, bayer, glow, text, textWidth } from './px.mjs';
import { sheet, spriteSvg, spriteCss } from './sprite.mjs';

const OUT = '#05030c';
const METAL = ['#1b1430', '#2e2350', '#4a3a7a', '#7a6ab0', '#b8aee0'];

const W = 400, H = 140;
const base = new Layer(W, H);

// wall
base.rect(0, 0, 400, 104, '#0c0620');
for (let y = 0; y < 100; y += 6) for (let x = 3; x < 400; x += 6) if (x % 6 === 3) base.px(x, y, '#150b31');
// label
text(base, 'BENCH // HARDWARE', 8, 6, '#ff2e88', 1);

// pegboard tool rack box 20,24,80,52
{
  base.rect(20, 24, 80, 52, '#150b31');
  for (let y = 24; y < 76; y++) { base.px(19, y, OUT); base.px(100, y, OUT); }
  for (let x = 20; x < 100; x++) { base.px(x, 23, OUT); base.px(x, 76, OUT); }
  for (let y = 25; y < 76; y++) base.px(99, y, '#2e2350');
  for (let y = 27; y < 76; y += 6) for (let x = 23; x < 100; x += 6) base.px(x, y, '#0c0620');

  // pliers at 28,30
  base.rect(28, 30, 4, 6, '#7a6ab0');
  for (let y = 30; y < 36; y++) { base.px(27, y, OUT); base.px(32, y, OUT); }
  for (let x = 28; x < 32; x++) { base.px(x, 29, OUT); base.px(x, 36, OUT); }
  base.rect(28, 36, 2, 18, '#ff2e88');
  base.rect(30, 36, 2, 18, '#ff2e88');

  // screwdriver at 42,30
  base.rect(42, 30, 4, 10, '#3ff0e6');
  for (let y = 30; y < 40; y++) { base.px(41, y, OUT); base.px(46, y, OUT); }
  for (let x = 42; x < 46; x++) { base.px(x, 29, OUT); base.px(x, 40, OUT); }
  base.rect(43, 40, 1, 12, '#b8aee0');

  // wire spools at 54,34 / 66,34 / 78,34
  const spoolColors = ['#ff8a3d', '#3ff0e6', '#ff2e88'];
  const spoolX = [54, 66, 78];
  for (let s = 0; s < 3; s++) {
    const cx = spoolX[s], cy = 34;
    for (let yy = cy; yy < cy + 10; yy++) for (let xx = cx; xx < cx + 10; xx++) {
      if ((xx + 0.5 - (cx + 5)) ** 2 + (yy + 0.5 - (cy + 5)) ** 2 <= 25) base.px(xx, yy, spoolColors[s]);
    }
    base.rect(cx + 4, cy + 4, 2, 2, '#1b1430');
  }

  // ruler at 24,64
  base.rect(24, 64, 72, 4, '#ffd84a');
  for (let x = 24; x < 96; x += 4) base.rect(x, 64, 1, 2, '#1b1430');
  for (let y = 64; y < 68; y++) { base.px(23, y, OUT); base.px(96, y, OUT); }
  for (let x = 24; x < 96; x++) { base.px(x, 63, OUT); base.px(x, 68, OUT); }
}

// wall poster at 190,20,44,30
{
  base.rect(190, 20, 44, 30, '#ff2e88');
  base.rect(191, 21, 42, 28, '#150b31');
  text(base, 'LAB', 197, 28, '#3ff0e6', 2);
}

// bench top
base.rect(0, 104, 400, 4, '#4a3a7a');
base.rect(0, 104, 400, 1, '#7a6ab0');
base.rect(0, 108, 400, 32, '#1b1430');
for (let y = 108; y <= 115; y++) for (let x = 0; x < 400; x++) base.px(x, y, bayer(x, y) < 0.5 ? '#1b1430' : '#2e2350');
base.rect(0, 103, 400, 1, '#05030c');

// desk lamp (left side)
base.rect(104, 100, 14, 4, '#2e2350');
function thickLine(x0, y0, x1, y1) {
  let x = x0, y = y0;
  const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  while (true) {
    base.rect(x, y, 2, 2, '#4a3a7a');
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x += sx; }
    if (e2 < dx) { err += dx; y += sy; }
  }
}
thickLine(110, 100, 116, 62);
thickLine(116, 62, 140, 50);
for (let r = 0; r <= 8; r++) {
  const x0 = 132 + r, x1 = 152 - r;
  for (let x = x0; x <= x1; x++) base.px(x, 46 + r, r === 0 ? '#b8aee0' : '#7a6ab0');
}
base.rect(140, 54, 3, 2, '#ffe6f4');

// ESP32 board box 30,86,64,18
{
  for (let y = 86; y < 104; y++) for (let x = 30; x < 94; x++) base.px(x, y, '#1b1430');
  for (let y = 86; y < 104; y++) { base.px(29, y, OUT); base.px(94, y, OUT); }
  for (let x = 30; x < 94; x++) { base.px(x, 85, OUT); base.px(x, 104, OUT); }
  for (let y = 86; y < 104; y++) base.px(93, y, '#4a3a7a');
  for (let y = 89; y < 101; y++) for (let x = 36; x < 60; x++) base.px(x, y, '#7a6ab0');
  for (let y = 89; y < 101; y++) { base.px(35, y, OUT); base.px(60, y, OUT); }
  for (let x = 36; x < 60; x++) { base.px(x, 88, OUT); base.px(x, 101, OUT); }
  for (let y = 89; y < 101; y++) base.px(59, y, '#b8aee0');
  for (let x = 34; x <= 90; x += 4) {
    base.rect(x, 87, 2, 1, '#ffd84a');
    base.rect(x, 102, 2, 1, '#ffd84a');
  }
  for (const y of [92, 95, 98]) for (let x = 61; x <= 90; x++) base.px(x, y, '#3ff0e6');
}

// synth box 110,74,140,30
{
  for (let y = 74; y < 104; y++) for (let x = 110; x < 250; x++) base.px(x, y, bayer(x, y) < 0.5 ? '#1b1430' : '#2e2350');
  for (let y = 74; y < 104; y++) { base.px(109, y, OUT); base.px(250, y, OUT); }
  for (let x = 110; x < 250; x++) { base.px(x, 73, OUT); base.px(x, 104, OUT); }
  for (let y = 74; y < 104; y++) base.px(249, y, '#7a6ab0');
  base.rect(116, 90, 128, 12, '#05030c');
  for (let i = 0; i < 16; i++) base.rect(116 + i * 8, 90, 7, 12, '#f4ecff');
  for (let oct = 0; oct < 2; oct++) for (const gap of [0, 1, 3, 4, 5]) {
    const i = oct * 7 + gap;
    base.rect(116 + i * 8 + 6, 90, 4, 7, '#05030c');
  }
  for (const x of [118, 130, 142, 154]) {
    base.rect(x, 78, 6, 6, '#4a3a7a');
    base.px(x + 5, 78, '#b8aee0');
  }
  base.rect(200, 77, 40, 10, '#05030c');
}

// screen glow (before oscilloscope case)
{
  const scopeMask = new Array(64 * 40).fill(1);
  glow(base, scopeMask, 64, 40, 278, 42, '#3ff0e6', 3, 0.25);
}

// oscilloscope box 270,36,100,68
{
  for (let y = 36; y < 104; y++) for (let x = 270; x < 370; x++) base.px(x, y, bayer(x, y) < 0.5 ? '#2e2350' : '#4a3a7a');
  for (let y = 36; y < 104; y++) { base.px(269, y, OUT); base.px(370, y, OUT); }
  for (let x = 270; x < 370; x++) { base.px(x, 35, OUT); base.px(x, 104, OUT); }
  for (let y = 36; y < 104; y++) base.px(369, y, '#b8aee0');
  base.rect(278, 42, 64, 40, '#05030c');
  for (let xi = 0; xi <= 64; xi += 8) for (let yy = 42; yy < 82; yy++) base.px(278 + xi, yy, '#150b31');
  for (let yi = 0; yi <= 40; yi += 8) for (let xx = 278; xx < 342; xx++) base.px(xx, 42 + yi, '#150b31');
  for (const y of [46, 60, 74]) base.rect(350, y, 8, 8, '#7a6ab0');
  base.rect(276, 104, 6, 2, '#1b1430');
  base.rect(358, 104, 6, 2, '#1b1430');
}

// reflection strip
for (let y = 104; y <= 106; y++) for (let x = 278; x <= 342; x++) if (bayer(x, y) < 0.5) base.px(x, y, '#3ff0e6', 0.3);

// cable
for (let y = 96; y <= 100; y++) base.px(94, y, '#ff2e88');
for (let x = 94; x <= 110; x++) base.px(x, 100, '#ff2e88');

// soldering station at 256,88
{
  base.rect(256, 88, 12, 16, '#2e2350');
  for (let y = 88; y < 104; y++) { base.px(255, y, OUT); base.px(268, y, OUT); }
  for (let x = 256; x < 268; x++) { base.px(x, 87, OUT); base.px(x, 104, OUT); }
  for (let y = 89; y < 104; y++) base.px(267, y, '#7a6ab0');
  base.rect(258, 90, 2, 2, '#ff3355');
  for (let i = 0; i < 16; i++) base.rect(262, 72 + i, 4, 1, i % 2 === 0 ? '#b8aee0' : '#4a3a7a');
  {
    let x = 264, y = 70;
    const dx = Math.abs(250 - 264), dy = Math.abs(86 - 70);
    const sx = 264 < 250 ? 1 : -1, sy = 70 < 86 ? 1 : -1;
    let err = dx - dy;
    while (true) {
      base.px(x, y, '#b8aee0');
      if (x === 250 && y === 86) break;
      const e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x += sx; }
      if (e2 < dx) { err += dx; y += sy; }
    }
  }
  base.rect(250, 86, 2, 2, '#ff8a3d');
}

// light cone (drawn last onto base)
for (let y = 55; y <= 103; y++) {
  const span = (y - 55) * 0.9;
  for (let x = 0; x < W; x++) {
    if (Math.abs(x - 142) <= span && bayer(x, y) < 0.5) base.px(x, y, '#ffd84a', 0.18);
  }
}
{
  const span = (104 - 55) * 0.9;
  for (let x = 0; x < W; x++) if (Math.abs(x - 142) <= span) base.px(x, 104, '#ffd84a', 0.35);
}

// ---------- sprites ----------

// scope trace
const scopeFrames = [];
for (let k = 0; k < 8; k++) {
  const L = new Layer(64, 40);
  const mask = new Array(64 * 40).fill(0);
  for (let x = 0; x < 64; x++) {
    const y = Math.round(20 + 12 * Math.sin((2 * Math.PI * (x + k * 4)) / 32));
    if (y >= 0 && y < 40) { L.px(x, y, '#3ff0e6'); mask[y * 64 + x] = 1; }
  }
  glow(L, mask, 64, 40, 0, 0, '#3ff0e6', 2, 0.5);
  scopeFrames.push(L);
}
const scopeSheet = sheet(scopeFrames);

// synth display (meter)
const r = rng(4);
const meterFrames = [];
for (let f = 0; f < 4; f++) {
  const L = new Layer(40, 10);
  const heights = Array.from({ length: 8 }, () => 2 + Math.floor(r() * 8));
  for (let i = 0; i < 8; i++) {
    const h = heights[i];
    L.rect(i * 5, 10 - h, 3, h, '#ff2e88');
  }
  meterFrames.push(L);
}
const meterSheet = sheet(meterFrames);

// LEDs
function ledSheet(color) {
  const lit = new Layer(2, 2); lit.rect(0, 0, 2, 2, color);
  const dark = new Layer(2, 2); dark.rect(0, 0, 2, 2, '#1b1430');
  return sheet([lit, dark]);
}
const led1Sheet = ledSheet('#ff3355');
const led2Sheet = ledSheet('#3ff0e6');
const led3Sheet = ledSheet('#ffd84a');

// drone
function droneFrame(rotorWide) {
  const L = new Layer(64, 20);
  for (let y = 8; y < 14; y++) for (let x = 24; x < 40; x++) L.px(x, y, '#4a3a7a');
  for (let y = 8; y < 14; y++) { L.px(23, y, OUT); L.px(40, y, OUT); }
  for (let x = 24; x < 40; x++) { L.px(x, 7, OUT); L.px(x, 14, OUT); }
  for (let y = 8; y < 14; y++) L.px(39, y, '#b8aee0');
  function line(x0, y0, x1, y1) {
    let x = x0, y = y0;
    const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    while (true) {
      L.px(x, y, '#2e2350');
      if (x === x1 && y === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x += sx; }
      if (e2 < dx) { err += dx; y += sy; }
    }
  }
  line(24, 10, 6, 6);
  line(24, 10, 18, 6);
  line(39, 10, 46, 6);
  line(39, 10, 58, 6);
  const hubs = [6, 18, 46, 58];
  const half = rotorWide ? 5 : 2;
  const width = rotorWide ? 10 : 4;
  for (const hx of hubs) L.rect(hx - half, 6, width, 1, '#b8aee0');
  L.rect(26, 12, 2, 1, '#ff3355');
  L.rect(36, 12, 2, 1, '#3ff0e6');
  for (let dy = 0; dy < 6; dy++) {
    const hw = 8 + dy;
    const cx = 32;
    for (let x = cx - hw; x < cx + hw; x++) {
      const y = 14 + dy;
      if (x < 0 || x >= 64 || y >= 20) continue;
      if (bayer(x, y) < 0.25) L.px(x, y, '#3ff0e6');
    }
  }
  return L;
}
const droneSheet = sheet([droneFrame(true), droneFrame(false)]);

// smoke sprite
const smokeFrames = [];
for (let k = 0; k < 6; k++) {
  const L = new Layer(12, 24);
  const ys = [20 - k * 3, 14 - k * 3, 8 - k * 3];
  for (let j = 0; j < 3; j++) {
    const y = ys[j];
    if (y < 0) continue;
    const xoff = 5 + Math.round(Math.sin(k + j) * 3);
    L.rect(xoff, y, 2, 2, '#b8aee0', 0.45);
  }
  smokeFrames.push(L);
}
const smokeSheet = sheet(smokeFrames);

// ---------- compose SVG ----------
const css = [
  'image{image-rendering:pixelated;image-rendering:crisp-edges}',
  spriteCss('scope', 64, 8, 0.8),
  spriteCss('meter', 40, 4, 0.6),
  spriteCss('led1', 2, 2, 1.0),
  spriteCss('led2', 2, 2, 1.4),
  spriteCss('led3', 2, 2, 0.7),
  spriteCss('drone', 64, 2, 0.15),
  spriteCss('smoke', 12, 6, 1.8),
  '.bob{animation:bob 2s steps(2) infinite}@keyframes bob{0%{transform:translateY(0)}50%{transform:translateY(-2px)}}',
].join('\n');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 140" width="1000" height="350" role="img" aria-label="Pixel-art hardware workbench at night: an ESP32 board, a synth with a bar meter, a hovering drone and an oscilloscope tracing a sine wave." shape-rendering="crispEdges">
<style>
${css}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
</style>
<image x="0" y="0" width="400" height="140" href="${base.uri()}"/>
<g class="bob">${spriteSvg(droneSheet.uri(), 64, 20, 2, 150, 16, 'drone')}</g>
${spriteSvg(scopeSheet.uri(), 64, 40, 8, 278, 42, 'scope')}
${spriteSvg(meterSheet.uri(), 40, 10, 4, 200, 77, 'meter')}
${spriteSvg(led1Sheet.uri(), 2, 2, 2, 86, 89, 'led1')}
${spriteSvg(led2Sheet.uri(), 2, 2, 2, 244, 78, 'led2')}
${spriteSvg(led3Sheet.uri(), 2, 2, 2, 352, 90, 'led3')}
${spriteSvg(smokeSheet.uri(), 12, 24, 6, 244, 46, 'smoke')}
</svg>`;

writeFileSync(fileURLToPath(new URL('../../assets/bench.svg', import.meta.url)), svg);
console.log('BOX esp32 30,86,64,18');
console.log('BOX synth 110,74,140,30');
console.log('BOX scope 270,36,100,68');
console.log('BOX drone 150,16,64,20');
console.log('BOX rack 20,24,80,52');
console.log('BOX lamp 104,46,48,58');
console.log('BOX solder 250,70,18,34');
console.log('BOX poster 190,20,44,30');
console.log('WROTE assets/bench.svg', Math.round(svg.length / 1024) + ' KB');