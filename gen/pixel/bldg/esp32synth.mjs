// ESP32-Synth: speaker-stack tower with piano-key awning and pulsing EQ bars.
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

const W = 72, H = 100;
const OUT = '#05030c';

const base = new Layer(W, H);

function cabinet(x0, x1, y0, y1) {
  // outline
  for (let y = y0; y <= y1; y++) { base.px(x0 - 1, y, OUT); base.px(x1 + 1, y, OUT); }
  for (let x = x0; x <= x1; x++) { base.px(x, y0 - 1, OUT); base.px(x, y1 + 1, OUT); }
  // left shadow columns
  for (let y = y0; y <= y1; y++) for (let dx = 0; dx < 4; dx++) base.px(x0 + dx, y, METAL[0]);
  // body with tolex dither
  for (let y = y0; y <= y1; y++) for (let x = x0 + 4; x <= x1 - 2; x++) {
    base.px(x, y, bayer(x, y) < 0.25 ? METAL[0] : METAL[1]);
  }
  // right shading
  for (let y = y0; y <= y1; y++) { base.px(x1 - 1, y, METAL[3]); base.px(x1, y, C.rim); }
  // panel seams
  const seamW = (x1 - 2) - (x0 + 4) + 1;
  for (let y = y0 + 6; y < y1; y += 6) base.rect(x0 + 4, y, seamW, 1, METAL[0]);
  // corner protectors
  base.rect(x0, y0, 2, 2, METAL[4]);
  base.rect(x1 - 1, y0, 2, 2, METAL[4]);
  base.rect(x0, y1 - 1, 2, 2, METAL[4]);
  base.rect(x1 - 1, y1 - 1, 2, 2, METAL[4]);
}

function drawCone(cx, cy, r) {
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      const d = Math.round(Math.hypot(dx, dy));
      if (d > r) continue;
      let color;
      if (d === r) color = METAL[3];
      else if (d === r - 1) color = METAL[0];
      else if (d <= 2) color = METAL[4];
      else {
        const band = Math.floor(d / 2) % 2;
        color = band === 0 ? METAL[2] : METAL[1];
      }
      base.px(cx + dx, cy + dy, color);
    }
  }
  // dust cap highlight upper-right
  base.px(cx + 1, cy - 1, C.core);
  // right edge of each ring -> rim
  for (let d = 1; d <= r; d++) base.px(cx + d, cy, C.rim);
}

// 1. Cabinets
cabinet(8, 63, 70, 99);
cabinet(12, 59, 42, 69);
cabinet(16, 55, 18, 41);

// 2. Speaker cones
drawCone(24, 85, 9);
drawCone(47, 85, 9);
drawCone(26, 56, 7);
drawCone(45, 56, 7);
drawCone(36, 30, 8);

// 3. EQ bar slot
{
  base.rect(52, 45, 6, 22, '#0a0618');
  base.rect(52, 45, 6, 1, METAL[3]);
  base.rect(52, 66, 6, 1, METAL[3]);
  base.rect(52, 45, 1, 22, METAL[3]);
  base.rect(57, 45, 1, 22, METAL[3]);
}

// 4. Keyboard-key awning
{
  for (let i = 0; i < 21; i++) {
    const x = 4 + i * 3;
    base.rect(x, 64, 3, 6, C.white);
    base.rect(x, 64, 1, 6, METAL[3]);
  }
  for (let oct = 0; oct < 3; oct++) {
    for (const gap of [0, 1, 3, 4, 5]) {
      const wi = oct * 7 + gap;
      const x = 4 + wi * 3 + 2;
      base.rect(x, 64, 2, 3, '#05030c');
    }
  }
}

// 5. Top control-panel crown
{
  // outline
  for (let y = 8; y <= 17; y++) { base.px(17, y, OUT); base.px(54, y, OUT); }
  for (let x = 18; x <= 53; x++) { base.px(x, 7, OUT); base.px(x, 18, OUT); }
  base.rect(18, 8, 36, 10, METAL[2]);
  // shading
  for (let y = 8; y <= 17; y++) {
    for (let dx = 0; dx < 4; dx++) base.px(18 + dx, y, METAL[1]);
    base.px(52, y, METAL[3]);
    base.px(53, y, C.rim);
  }
  // knobs
  for (let k = 0; k < 6; k++) {
    const kx = 20 + k * 5;
    const ky = 10;
    base.rect(kx, ky, 3, 3, METAL[4]);
    base.px(kx + 1, ky, C.cyan);
  }
  // neon strip
  base.rect(18, 17, 36, 1, C.pink);
}

// Antenna mast
base.rect(36, 0, 1, 8, METAL[3]);
base.rect(35, 0, 3, 2, C.red);

// 6. Door
base.rect(31, 92, 10, 8, C.cyan, 0.45);
base.rect(31, 92, 10, 1, C.core);

// 7. Cables
function curve(x0, y0, cx, cy, x1, y1) {
  for (let i = 0; i <= 60; i++) {
    const t = i / 60;
    const x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * x1;
    const y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cy + t * t * y1;
    base.px(Math.round(x), Math.round(y), METAL[0]);
  }
}
curve(7, 17, 5, 45, 8, 70);
curve(9, 17, 11, 45, 10, 70);
for (const [x, y] of [[7, 17], [8, 70], [9, 17], [10, 70]]) base.px(x, y, C.yellow);

// bottom darkening dither
for (let y = 80; y <= 99; y++) {
  const tt = (y - 80) / 19;
  for (let x = 0; x < W; x++) {
    const p = base.get(x, y);
    if (!p || p[3] === 0) continue;
    const m1 = rgb(METAL[1]), m2 = rgb(METAL[2]);
    const match = (p[0] === m1[0] && p[1] === m1[1] && p[2] === m1[2]) ||
                  (p[0] === m2[0] && p[1] === m2[1] && p[2] === m2[2]);
    if (match && bayer(x, y) < tt) base.px(x, y, METAL[0]);
  }
}

// Animation frames
const frameHeights = [[12, 18, 8, 14], [16, 10, 14, 6], [8, 14, 18, 10], [18, 6, 12, 16]];
const frames = frameHeights.map((heights) => {
  const L = new Layer(4, 20);
  for (let col = 0; col < 4; col++) {
    const hh = heights[col];
    for (let i = 0; i < hh; i++) {
      let color;
      if (i < 8) color = C.cyan;
      else if (i < 14) color = C.yellow;
      else color = C.pink;
      L.px(col, 19 - i, color);
    }
  }
  return L;
});

export default {
  label: 'ESP32-SYNTH',
  aria: 'Pixel-art tower built from stacked speaker cabinets with a piano-key awning and pulsing equaliser bars: ESP32-Synth',
  h: 100,
  base,
  anim: { frames, x: 53, y: 46, fw: 4, fh: 20, seq: [[0, 0.75], [1, 0.75], [2, 0.75], [3, 0.75]] },
};
