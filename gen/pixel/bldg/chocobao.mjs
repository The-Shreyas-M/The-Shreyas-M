// ChocoBao: microprocessor-chip tower with arcade-screen windows.
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

const W = 72, H = 112;

const base = new Layer(W, H);

// 1. Chip package body (tower)
{
  for (let y = 14; y <= 103; y++) { base.px(11, y, '#05030c'); base.px(60, y, '#05030c'); }
  for (let x = 12; x <= 59; x++) { base.px(x, 13, '#05030c'); base.px(x, 104, '#05030c'); }
  for (let y = 14; y <= 103; y++) {
    for (let x = 12; x <= 59; x++) {
      let col;
      if (x <= 15) col = METAL[0];
      else if (x >= 58) col = x === 59 ? C.rim : METAL[3];
      else col = bayer(x, y) < 0.2 ? METAL[0] : METAL[1];
      if (x < 58) base.px(x, y, col);
    }
  }
  for (let y = 14; y <= 103; y++) { base.px(58, y, METAL[3]); base.px(59, y, C.rim); }
  for (let y = 22; y <= 95; y += 8) base.rect(12, y, 48, 1, METAL[0]);
  for (let y = 84; y <= 103; y++) {
    for (let x = 16; x <= 57; x++) {
      const t = (y - 84) / 19;
      if (bayer(x, y) < t) base.px(x, y, METAL[0]);
    }
  }
}

// 2. Pins as balconies
for (let y = 20; y <= 98; y += 6) {
  for (const side of ['left', 'right']) {
    const x0 = side === 'left' ? 8 : 60;
    base.rect(x0, y, 4, 2, METAL[4]);
    base.rect(x0, y + 1, 4, 1, METAL[2]);
    for (let x = x0; x < x0 + 4; x++) { base.px(x, y - 1, '#05030c'); base.px(x, y + 2, '#05030c'); }
    const outerX = side === 'left' ? x0 - 1 : x0 + 4;
    for (let yy = y; yy <= y + 1; yy++) base.px(outerX, yy, '#05030c');
    if (side === 'right') {
      for (let yy = y; yy <= y + 1; yy++) { base.px(62, yy, METAL[3]); base.px(63, yy, C.rim); }
    }
  }
}

// 3. Die window
{
  base.rect(22, 26, 28, 28, '#3a2a10');
  const R = rng(21);
  for (let y = 26; y <= 53; y += 4) {
    for (let x = 22; x <= 46; x += 4) {
      if (R() < 0.5) base.rect(x, y, 4, 1, C.yellow, 0.8);
    }
  }
  for (let x = 22; x <= 49; x += 4) {
    for (let y = 26; y <= 50; y += 4) {
      if (R() < 0.5) base.rect(x, y, 1, 4, C.yellow, 0.8);
    }
  }
  base.rect(33, 37, 6, 6, C.orange);
  base.rect(35, 39, 2, 2, C.core);
  base.rect(20, 24, 32, 2, METAL[0]);
  base.rect(20, 54, 32, 2, METAL[0]);
  base.rect(20, 24, 2, 32, METAL[0]);
  base.rect(50, 24, 2, 32, METAL[0]);
}

// 4. Pin-1 marker
for (let dy = -1; dy <= 1; dy++)
  for (let dx = -1; dx <= 1; dx++)
    base.px(16 + dx, 18 + dy, METAL[0]);
base.px(17, 17, METAL[3]);

// 5. Arcade-screen windows
const screenPositions = [[18, 62], [42, 62], [18, 74], [42, 74], [18, 86], [42, 86]];
for (const [sx, sy] of screenPositions) {
  base.rect(sx, sy, 12, 8, METAL[3]);
  base.rect(sx + 1, sy + 1, 10, 6, '#0a0618');
  base.rect(sx + 1, sy + 3, 10, 1, C.midDark);
}

// 6. Top heat-sink crown
{
  base.rect(14, 4, 44, 10, METAL[2]);
  for (let i = 0, x = 14; x <= 56; x += 2, i++) {
    base.rect(x, 4, 1, 9, i % 2 === 0 ? METAL[3] : METAL[1]);
  }
  base.rect(14, 13, 44, 1, C.pink);
  for (let y = 4; y <= 13; y++) { base.px(13, y, '#05030c'); base.px(58, y, '#05030c'); }
  for (let x = 14; x <= 57; x++) base.px(x, 3, '#05030c');
  base.rect(36, 0, 1, 4, METAL[3]);
  base.px(36, 0, C.red);
}

// 7. Base socket plinth
{
  base.rect(6, 104, 60, 8, METAL[2]);
  for (let x = 9; x <= 63; x += 3) base.rect(x, 104, 1, 8, METAL[0]);
  base.rect(31, 106, 10, 6, C.cyan, 0.5);
  for (let y = 104; y <= 111; y++) { base.px(5, y, '#05030c'); base.px(66, y, '#05030c'); }
  for (let x = 6; x <= 65; x++) base.px(x, 103, '#05030c');
}

// Animation frames
const frames = [];
for (let f = 0; f < 3; f++) {
  const L = new Layer(36, 32);
  // Screen 1: 2-px paddle + 1-px ball (C.cyan), ball moves 3 px/frame
  L.rect(1, 2, 1, 2, C.cyan);
  L.px(4 + f * 3, 3, C.cyan);
  // Screen 2: 3x2 invader (C.pink) stepping 1 px left/right
  const invX = f === 1 ? 26 : (f === 2 ? 28 : 27);
  L.rect(invX, 2, 3, 2, C.pink);
  // Screen 3: 4-px snake (C.yellow) moving 1 px/frame
  L.rect(1 + f, 15, 4, 1, C.yellow);
  // Screens 4-6: scrolling stars (C.white @0.8) shifted 2 px/frame
  for (const [ix, iy] of [[25, 13], [1, 25], [25, 25]]) {
    for (let i = 0; i < 3; i++) {
      const sx = ix + ((2 + f * 2 + i * 3) % 10);
      const sy = iy + 2;
      L.px(sx, sy, C.white, 0.8);
    }
  }
  // Screen 5: 2x2 ship (C.cyan)
  L.rect(4, 27, 2, 2, C.cyan);
  frames.push(L);
}

export default {
  label: 'CHOCOBAO',
  aria: 'Pixel-art skyscraper shaped like a microprocessor chip with arcade-game screens for windows: ChocoBao',
  h: 112,
  base,
  anim: { frames, x: 18, y: 62, fw: 36, fh: 32, seq: [[0, 1], [1, 1], [2, 1]] },
};
