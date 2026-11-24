// Oculius: dark tower crowned by a giant mechanical eye; the pupil looks around (DESIGN §4b).
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


const W = 72, H = 120;

function inEllipse(x, y, cx, cy, rx, ry) {
  const dx = (x - cx) / rx, dy = (y - cy) / ry;
  return dx * dx + dy * dy <= 1;
}

function ellipseOutline(layer, cx, cy, rx, ry, color, rimColor) {
  for (let y = cy - ry; y <= cy + ry; y++) {
    for (let x = cx - rx; x <= cx + rx; x++) {
      if (!inEllipse(x, y, cx, cy, rx, ry)) continue;
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= layer.w || ny >= layer.h) continue;
        if (inEllipse(nx, ny, cx, cy, rx, ry)) continue;
        const col = (rimColor && x >= cx + 15) ? rimColor : color;
        layer.px(nx, ny, col);
      }
    }
  }
}

const base = new Layer(W, H);

// 1. Tower shaft
{
  // outline
  for (let y = 44; y <= 119; y++) { base.px(17, y, '#05030c'); base.px(54, y, '#05030c'); }
  for (let x = 18; x <= 53; x++) base.px(x, 43, '#05030c');
  base.px(17, 43, '#05030c'); base.px(54, 43, '#05030c');
  // body
  base.rect(18, 44, 4, 76, METAL[0]);
  base.rect(22, 44, 30, 76, METAL[1]);
  base.rect(52, 44, 1, 76, METAL[3]);
  base.rect(53, 44, 1, 76, C.rim);
  // panel seams
  for (let y = 52; y <= 116; y += 8) base.rect(18, y, 36, 1, METAL[0]);
  // windows
  const R = rng(11);
  for (let y = 48; y <= 116; y += 4) {
    for (let x = 20; x <= 48; x += 4) {
      if (R() < 0.4) {
        if (R() < 0.5) base.rect(x, y, 2, 1, C.cyan, 0.85);
        else base.rect(x, y, 2, 1, C.yellow, 0.7);
      } else {
        base.rect(x, y, 2, 1, C.midDark);
      }
    }
  }
  // dithered darkening toward bottom
  for (let y = 100; y <= 119; y++) {
    for (let x = 18; x <= 53; x++) {
      const p = base.get(x, y);
      if (!p || p[3] === 0) continue;
      const t = rgb(METAL[1]);
      if (p[0] === t[0] && p[1] === t[1] && p[2] === t[2]) {
        const tt = (y - 100) / 19;
        if (bayer(x, y) < tt) base.px(x, y, METAL[0]);
      }
    }
  }
}

// 3. Base plinth
{
  base.rect(12, 110, 48, 1, METAL[2]);
  base.rect(12, 111, 48, 9, METAL[1]);
  base.rect(26, 113, 20, 7, C.cyan, 0.5);
  base.rect(26, 113, 20, 1, C.core);
  // outline
  for (let y = 110; y <= 119; y++) { base.px(11, y, '#05030c'); base.px(60, y, '#05030c'); }
  for (let x = 12; x <= 59; x++) base.px(x, 109, '#05030c');
}

// 4. Eye housing
{
  for (let y = 6; y <= 46; y++) {
    for (let x = 6; x <= 66; x++) {
      if (inEllipse(x, y, 36, 26, 30, 20)) base.px(x, y, METAL[1]);
    }
  }
  // lid plates
  for (const [y0, y1] of [[8, 12], [40, 44]]) {
    for (let y = y0; y <= y1; y++) {
      for (let x = 6; x <= 66; x++) {
        if (!inEllipse(x, y, 36, 26, 30, 20)) continue;
        base.px(x, y, y === y0 ? METAL[3] : METAL[2]);
      }
    }
    const midY = y0 + 2;
    for (let x = 6; x <= 66; x += 6) {
      if (!inEllipse(x, midY, 36, 26, 30, 20)) continue;
      base.px(x, midY, METAL[4]);
    }
  }
  ellipseOutline(base, 36, 26, 30, 20, '#05030c', C.rim);
}

// 5. Sclera
{
  for (let y = 14; y <= 38; y++) {
    for (let x = 14; x <= 58; x++) {
      if (!inEllipse(x, y, 36, 26, 22, 12)) continue;
      const dx = (x - 36) / 22, dy = (y - 26) / 12;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (bayer(x, y) < d) base.px(x, y, C.rain);
      else base.px(x, y, C.white);
    }
  }
  ellipseOutline(base, 36, 26, 22, 12, '#05030c', null);
}

// 7. Glow on base (iris halo at centre)
{
  const mask = new Array(W * H).fill(0);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const dx = x - 36, dy = y - 26;
      if (dx * dx + dy * dy <= 64 && inEllipse(x, y, 36, 26, 22, 12)) mask[y * W + x] = 1;
    }
  }
  glow(base, mask, W, H, 0, 0, C.cyan, 3, 0.45);
}

// 8. Antenna
base.rect(36, 0, 1, 7, METAL[3]);
base.rect(35, 0, 2, 2, C.red);

function drawIris(layer, icx, icy) {
  const offX = 12, offY = 12;
  for (let y = 0; y < layer.h; y++) {
    for (let x = 0; x < layer.w; x++) {
      const bx = x + offX, by = y + offY;
      if (!inEllipse(bx, by, 36, 26, 22, 12)) continue;
      const dx = x - icx, dy = y - icy;
      const d2 = dx * dx + dy * dy;
      if (d2 <= 9) {
        layer.px(x, y, '#05030c');
        if ((dx === 1 && dy === -2) || (dx === 2 && dy === -1)) layer.px(x, y, C.core);
      } else if (d2 <= 64) {
        if (d2 <= 16) layer.px(x, y, '#1a8f8a');
        else layer.px(x, y, C.cyan);
      }
    }
  }
  const angles = [0, 45, 90, 135, 180, 225, 270, 315];
  for (const ang of angles) {
    const rad = ang * Math.PI / 180;
    for (let r = 4; r <= 7; r++) {
      const x = Math.round(icx + r * Math.cos(rad));
      const y = Math.round(icy + r * Math.sin(rad));
      if (x < 0 || y < 0 || x >= layer.w || y >= layer.h) continue;
      const bx = x + offX, by = y + offY;
      if (!inEllipse(bx, by, 36, 26, 22, 12)) continue;
      const dx = x - icx, dy = y - icy;
      const d2 = dx * dx + dy * dy;
      if (d2 <= 9 || d2 > 64) continue;
      layer.px(x, y, C.core, 0.6);
    }
  }
}

const centers = [[36, 26], [28, 26], [44, 26], [36, 21]];
const frames = centers.map(([cx, cy]) => {
  const L = new Layer(48, 28);
  const icx = cx - 12, icy = cy - 12;
  const mask = new Array(48 * 28).fill(0);
  for (let y = 0; y < 28; y++) {
    for (let x = 0; x < 48; x++) {
      const bx = x + 12, by = y + 12;
      const dx = x - icx, dy = y - icy;
      if (dx * dx + dy * dy <= 64 && inEllipse(bx, by, 36, 26, 22, 12)) mask[y * 48 + x] = 1;
    }
  }
  glow(L, mask, 48, 28, 0, 0, C.cyan, 3, 0.45);
  drawIris(L, icx, icy);
  return L;
});

export default {
  label: 'OCULIUS',
  aria: 'Pixel-art tower crowned by a giant mechanical eye that looks around: Oculius',
  h: 120, base,
  anim: { frames, x: 12, y: 12, fw: 48, fh: 28, seq: [[0, 1.4], [1, 1.0], [0, 0.8], [2, 1.0], [0, 0.6], [3, 0.8], [0, 0.4]] },
};
