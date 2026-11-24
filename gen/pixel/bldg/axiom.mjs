// Axiom: archive tower of stacked pages/books with a magnifier searchlight scanning the pages.
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

const W = 72, H = 108;

function hex(arr) { return '#' + arr.map((v) => v.toString(16).padStart(2, '0')).join(''); }

const base = new Layer(W, H);

// Helper: darken a hex colour by mixing with ink.
function darken(col, t) { return hex(mix(rgb(col), rgb('#05030c'), t)); }

// 1. Book stack tower
{
  const offsets = [0, 2, -1, 3, 0, -2, 1, 3, -1];
  const bookColors = ['#3a1f5c', '#1f3a5c', '#5c1f3a', '#2e2350', '#4a3a7a'];
  for (let k = 0; k < 9; k++) {
    const yTop = 100 - 8 * k;
    const yBot = 107 - 8 * k;
    const off = offsets[k];
    const x0 = 10 + off;
    const x1 = 61 + off;
    const spine = bookColors[k % bookColors.length];
    const topColor = hex(mix(rgb(spine), rgb(METAL[4]), 0.3));
    const pageA = C.white;
    const pageB = '#d8d0f0';
    const bandColor = (k % 2 === 0) ? METAL[4] : C.yellow;

    // fill spine body (x0..x1-2)
    for (let y = yTop; y <= yBot; y++) {
      for (let x = x0; x <= x1 - 2; x++) {
        base.px(x, y, spine);
      }
    }
    // top row lighter
    for (let x = x0; x <= x1 - 2; x++) base.px(x, yTop, topColor);
    // left shadow columns
    for (let i = 0; i < 4; i++) {
      const sh = darken(spine, 0.42 - i * 0.09);
      for (let y = yTop + 1; y <= yBot; y++) base.px(x0 + i, y, sh);
    }
    // page edge right 2 columns, alternating rows
    for (let y = yTop; y <= yBot; y++) {
      const pc = (y - yTop) % 2 === 0 ? pageA : pageB;
      base.px(x1 - 1, y, pc);
      base.px(x1, y, pc);
    }
    // title band at row +3
    const by = yTop + 3;
    for (let x = x0; x <= x1 - 2; x++) base.px(x, by, bandColor);
    // 2-3 tiny dark letter pixels
    for (let t = 0; t < 3; t++) {
      base.px(x0 + 6 + t * 9, by, '#05030c');
    }
    // outline
    for (let x = x0; x <= x1; x++) { base.px(x, yTop - 1, '#05030c'); base.px(x, yBot + 1, '#05030c'); }
    for (let y = yTop; y <= yBot; y++) { base.px(x0 - 1, y, '#05030c'); base.px(x1 + 1, y, '#05030c'); }
    // key light: rightmost spine column METAL[3] (before page edge)
    for (let y = yTop; y <= yBot; y++) base.px(x1 - 2, y, METAL[3]);
  }
}

// 2. Paper stack crown
{
  const R = rng(31);
  for (let i = 0; i < 8; i++) {
    const y = 20 + i * 2;
    const off = Math.floor(R() * 5) - 2;
    const x0 = 18 + off;
    const w = 36;
    for (let x = x0; x < x0 + w; x++) {
      if (x < 0 || x >= W) continue;
      base.px(x, y, C.white);
      if (y + 1 < H) base.px(x, y + 1, '#c8c0e8');
    }
    // outline left/right
    if (x0 - 1 >= 0) { base.px(x0 - 1, y, '#05030c'); base.px(x0 - 1, y + 1, '#05030c'); }
    const xr = x0 + w;
    if (xr < W) { base.px(xr, y, '#05030c'); base.px(xr, y + 1, '#05030c'); }
    // a few sheets with 1-px dark text lines
    if (R() < 0.55) {
      const n = 2 + Math.floor(R() * 3);
      for (let t = 0; t < n; t++) {
        const tx = x0 + 4 + Math.floor(R() * (w - 8));
        if (tx >= 0 && tx < W) base.px(tx, y, '#05030c');
      }
    }
  }
}

// 3. Rooftop observation deck
{
  const x0 = 26, x1 = 45, y0 = 12, y1 = 19;
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) base.px(x, y, METAL[2]);
  }
  // shading
  for (let y = y0; y <= y1; y++) {
    base.px(x1, y, C.rim);
    base.px(x1 - 1, y, METAL[3]);
    for (let i = 0; i < 4; i++) base.px(x0 + i, y, darken(METAL[2], 0.4 - i * 0.08));
  }
  // outline
  for (let x = x0; x <= x1; x++) { base.px(x, y0 - 1, '#05030c'); base.px(x, y1 + 1, '#05030c'); }
  for (let y = y0; y <= y1; y++) { base.px(x0 - 1, y, '#05030c'); base.px(x1 + 1, y, '#05030c'); }
  // railings: posts every 3 px
  for (let x = x0; x <= x1; x += 3) {
    for (let y = 9; y <= 11; y++) base.px(x, y, METAL[4]);
  }
  for (let x = x0; x <= x1; x++) base.px(x, 9, METAL[4]);
  // lamp housing 6x5
  const lx0 = 33, ly0 = 7;
  for (let y = ly0; y <= ly0 + 4; y++) {
    for (let x = lx0; x <= lx0 + 5; x++) base.px(x, y, METAL[3]);
  }
  // shading
  for (let y = ly0; y <= ly0 + 4; y++) {
    base.px(lx0 + 4, y, METAL[4]);
    for (let i = 0; i < 3; i++) base.px(lx0 + i, y, darken(METAL[3], 0.35 - i * 0.08));
  }
  // lens
  base.px(38, 9, C.core);
  // outline
  for (let x = lx0; x <= lx0 + 5; x++) { base.px(x, ly0 - 1, '#05030c'); base.px(x, ly0 + 5, '#05030c'); }
  for (let y = ly0; y <= ly0 + 4; y++) { base.px(lx0 - 1, y, '#05030c'); base.px(lx0 + 6, y, '#05030c'); }
}

// 4. Magnifier sign on facade
{
  const cx = 36, cy = 70;
  for (let y = 62; y <= 78; y++) {
    for (let x = 28; x <= 44; x++) {
      const dx = x - cx, dy = y - cy;
      const d = Math.hypot(dx, dy);
      if (d <= 8 && d >= 6) {
        const col = (dx >= 5) ? C.rim : METAL[4];
        base.px(x, y, col);
      } else if (d < 6) {
        base.px(x, y, C.cyan, 0.25);
      } else if (d > 8 && d <= 9.2) {
        base.px(x, y, '#05030c');
      }
    }
  }
  // handle: 2 px wide diagonal down-right
  for (let i = 0; i < 8; i++) {
    base.px(42 + i, 76 + i, METAL[2]);
    base.px(41 + i, 77 + i, METAL[2]);
  }
  // handle outline
  for (let i = 0; i < 8; i++) {
    base.px(43 + i, 76 + i, '#05030c');
    base.px(40 + i, 77 + i, '#05030c');
  }
}

// 5. Door at bottom book
{
  const x0 = 30, x1 = 41, y0 = 100, y1 = 107;
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      if (y === y0) base.px(x, y, C.core);
      else base.px(x, y, C.yellow, 0.45);
    }
  }
  // outline
  for (let x = x0; x <= x1; x++) base.px(x, y0 - 1, '#05030c');
  for (let y = y0; y <= y1; y++) { base.px(x0 - 1, y, '#05030c'); base.px(x1 + 1, y, '#05030c'); }
}

// 6. Antenna
base.rect(36, 0, 1, 7, METAL[3]);
base.rect(35, 0, 2, 2, C.red);

// Dither bottom ~20 rows darker toward ground
{
  const protectedCols = new Set([C.cyan, C.pink, C.yellow, C.orange, C.red, C.core, C.white, '#d8d0f0', '#c8c0e8']);
  for (let y = 88; y <= 107; y++) {
    const tt = (y - 88) / 19;
    for (let x = 0; x < W; x++) {
      const p = base.get(x, y);
      if (!p || p[3] < 240) continue;
      const hexcol = '#' + [p[0], p[1], p[2]].map((v) => v.toString(16).padStart(2, '0')).join('');
      if (protectedCols.has(hexcol.toLowerCase())) continue;
      if (bayer(x, y) < tt) {
        const nc = hex(mix([p[0], p[1], p[2]], rgb(METAL[0]), 0.45));
        base.px(x, y, nc);
      }
    }
  }
}

// ANIMATION frames
const targets = [[64, 40], [58, 54], [10, 52], [4, 34]];
function makeFrame(tgt) {
  const L = new Layer(72, 60);
  const [tx, ty] = tgt;
  const lx = 38, ly = 9;
  const dx = tx - lx, dy = ty - ly;
  const len = Math.hypot(dx, dy);
  const minx = Math.min(lx, tx) - 6, maxx = Math.max(lx, tx) + 6;
  const miny = Math.min(ly, ty) - 6, maxy = Math.max(ly, ty) + 6;
  for (let y = miny; y <= maxy; y++) {
    for (let x = minx; x <= maxx; x++) {
      if (x < 0 || y < 0 || x >= 72 || y >= 60) continue;
      const vx = x - lx, vy = y - ly;
      const t = (vx * dx + vy * dy) / (len * len);
      if (t < 0 || t > 1) continue;
      const perp = Math.abs(vx * (dy / len) - vy * (dx / len));
      const halfW = 5 * t;
      if (perp > halfW + 0.5) continue;
      if (bayer(x, y) > 0.6) continue;
      const edge = perp > halfW - 1.0;
      L.px(x, y, C.cyan, edge ? 0.3 : 0.18);
    }
  }
  L.rect(tx - 1, ty - 1, 3, 2, C.core, 0.7);
  return L;
}
const frames = targets.map(makeFrame);

export default {
  label: 'AXIOM',
  aria: 'Pixel-art archive tower built from stacked books and papers, with a magnifying-glass searchlight scanning the pages: Axiom',
  h: 108,
  base,
  anim: { frames, x: 0, y: 0, fw: 72, fh: 60, seq: [[0, 1.5], [1, 1.5], [2, 1.5], [3, 1.5]] },
};
