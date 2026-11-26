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

// bench top
base.rect(0, 104, 400, 4, '#4a3a7a');
base.rect(0, 104, 400, 1, '#7a6ab0');
base.rect(0, 108, 400, 32, '#1b1430');
for (let y = 108; y <= 115; y++) for (let x = 0; x < 400; x++) base.px(x, y, bayer(x, y) < 0.5 ? '#1b1430' : '#2e2350');
base.rect(0, 103, 400, 1, '#05030c');

// ESP32 board box 30,86,64,18
{
  for (let y = 86; y < 104; y++) for (let x = 30; x < 94; x++) base.px(x, y, '#1b1430');
  // outline
  for (let y = 86; y < 104; y++) { base.px(29, y, OUT); base.px(94, y, OUT); }
  for (let x = 30; x < 94; x++) { base.px(x, 85, OUT); base.px(x, 104, OUT); }
  // right edge
  for (let y = 86; y < 104; y++) base.px(93, y, '#4a3a7a');
  // metal shield 36,89,24,12
  for (let y = 89; y < 101; y++) for (let x = 36; x < 60; x++) base.px(x, y, '#7a6ab0');
  for (let y = 89; y < 101; y++) { base.px(35, y, OUT); base.px(60, y, OUT); }
  for (let x = 36; x < 60; x++) { base.px(x, 88, OUT); base.px(x, 101, OUT); }
  for (let y = 89; y < 101; y++) base.px(59, y, '#b8aee0');
  // header pins
  for (let x = 34; x <= 90; x += 4) {
    base.rect(x, 87, 2, 1, '#ffd84a');
    base.rect(x, 102, 2, 1, '#ffd84a');
  }
  // cyan trace lines
  for (const y of [92, 95, 98]) for (let x = 61; x <= 90; x++) base.px(x, y, '#3ff0e6');
}

// synth box 110,74,140,30
{
  for (let y = 74; y < 104; y++) for (let x = 110; x < 250; x++) base.px(x, y, bayer(x, y) < 0.5 ? '#1b1430' : '#2e2350');
  for (let y = 74; y < 104; y++) { base.px(109, y, OUT); base.px(250, y, OUT); }
  for (let x = 110; x < 250; x++) { base.px(x, 73, OUT); base.px(x, 104, OUT); }
  for (let y = 74; y < 104; y++) base.px(249, y, '#7a6ab0');
  // keyboard strip 116,90,128,12
  base.rect(116, 90, 128, 12, '#05030c');
  for (let i = 0; i < 16; i++) base.rect(116 + i * 8, 90, 7, 12, '#f4ecff');
  for (let oct = 0; oct < 2; oct++) for (const gap of [0, 1, 3, 4, 5]) {
    const i = oct * 7 + gap;
    base.rect(116 + i * 8 + 6, 90, 4, 7, '#05030c');
  }
  // knobs
  for (const x of [118, 130, 142, 154]) {
    base.rect(x, 78, 6, 6, '#4a3a7a');
    base.px(x + 5, 78, '#b8aee0');
  }
  // mini display
  base.rect(200, 77, 40, 10, '#05030c');
}

// oscilloscope box 270,36,100,68
{
  for (let y = 36; y < 104; y++) for (let x = 270; x < 370; x++) base.px(x, y, bayer(x, y) < 0.5 ? '#2e2350' : '#4a3a7a');
  for (let y = 36; y < 104; y++) { base.px(269, y, OUT); base.px(370, y, OUT); }
  for (let x = 270; x < 370; x++) { base.px(x, 35, OUT); base.px(x, 104, OUT); }
  for (let y = 36; y < 104; y++) base.px(369, y, '#b8aee0');
  // screen
  base.rect(278, 42, 64, 40, '#05030c');
  for (let xi = 0; xi <= 64; xi += 8) for (let yy = 42; yy < 82; yy++) base.px(278 + xi, yy, '#150b31');
  for (let yi = 0; yi <= 40; yi += 8) for (let xx = 278; xx < 342; xx++) base.px(xx, 42 + yi, '#150b31');
  // knobs
  for (const y of [46, 60, 74]) base.rect(350, y, 8, 8, '#7a6ab0');
  // feet
  base.rect(276, 104, 6, 2, '#1b1430');
  base.rect(358, 104, 6, 2, '#1b1430');
}

// cable
for (let y = 96; y <= 100; y++) base.px(94, y, '#ff2e88');
for (let x = 94; x <= 110; x++) base.px(x, 100, '#ff2e88');

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
  // body 24,8,16,6
  for (let y = 8; y < 14; y++) for (let x = 24; x < 40; x++) L.px(x, y, '#4a3a7a');
  // outline
  for (let y = 8; y < 14; y++) { L.px(23, y, OUT); L.px(40, y, OUT); }
  for (let x = 24; x < 40; x++) { L.px(x, 7, OUT); L.px(x, 14, OUT); }
  // right edge
  for (let y = 8; y < 14; y++) L.px(39, y, '#b8aee0');
  // arms
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
  // rotors
  const hubs = [6, 18, 46, 58];
  const half = rotorWide ? 5 : 2;
  const width = rotorWide ? 10 : 4;
  for (const hx of hubs) L.rect(hx - half, 6, width, 1, '#b8aee0');
  // LEDs
  L.rect(26, 12, 2, 1, '#ff3355');
  L.rect(36, 12, 2, 1, '#3ff0e6');
  // under-glow cone
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

// ---------- compose SVG ----------
const css = [
  'image{image-rendering:pixelated;image-rendering:crisp-edges}',
  spriteCss('scope', 64, 8, 0.8),
  spriteCss('meter', 40, 4, 0.6),
  spriteCss('led1', 2, 2, 1.0),
  spriteCss('led2', 2, 2, 1.4),
  spriteCss('led3', 2, 2, 0.7),
  spriteCss('drone', 64, 2, 0.15),
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
</svg>`;

writeFileSync(fileURLToPath(new URL('../../assets/bench.svg', import.meta.url)), svg);
console.log('BOX esp32 30,86,64,18');
console.log('BOX synth 110,74,140,30');
console.log('BOX scope 270,36,100,68');
console.log('BOX drone 150,16,64,20');
console.log('WROTE assets/bench.svg', Math.round(svg.length / 1024) + ' KB');
