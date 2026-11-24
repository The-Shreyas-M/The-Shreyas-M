// Aivideo: neon cinema with marquee, film-reel neons and a big screen playing frames.
import { Layer, rgb, mix, rng, bayer, glow, text, textWidth } from '../px.mjs';

const C = {
  sky: ['#07041a', '#120836', '#230b4f', '#3d0f5e', '#661466', '#9c1d6c', '#c8306f'],
  far: '#2b1756', farRim: '#4a2a86', fog: '#c8306f',
  mid: '#150b31', midRim: '#36206e', midDark: '#0c0620',
  near: '#05030c', rim: '#ff3fa4',
  pink: '#ff2e88', cyan: '#3ff0e6', yellow: '#ffd84a', orange: '#ff8a3d', red: '#ff3355',
  core: '#ffe6f4', white: '#f4ecff', rain: '#a9b6ff',
};
const METAL = ['#1b1430', '#2e2350', '#4a3a7a', '#7a6ab0', '#b8aee0'];

const W = 72, H = 88;
const base = new Layer(W, H);

// 1. Cinema facade (brick texture)
{
  // shadow side
  base.rect(4, 26, 4, 62, METAL[0]);
  // brick texture main mass
  for (let y = 26; y <= 87; y++) {
    const row = Math.floor((y - 26) / 3);
    const off = (row % 2) * 2;
    for (let x = 8; x <= 65; x++) {
      const ly = (y - 26) % 3;
      const lx = (((x - 8) - off) % 5 + 5) % 5;
      if (ly === 2 || lx === 4) base.px(x, y, METAL[0]);
      else base.px(x, y, METAL[1]);
    }
  }
  // right rim
  base.rect(66, 26, 1, 62, METAL[3]);
  base.rect(67, 26, 1, 62, C.rim);
  // outline
  for (let y = 26; y <= 87; y++) { base.px(3, y, '#05030c'); base.px(68, y, '#05030c'); }
  for (let x = 4; x <= 67; x++) base.px(x, 25, '#05030c');
}

// 4. Film-reel neons (drawn before facade details but above)
{
  for (const [cx, cy] of [[14, 16], [57, 16]]) {
    // ring
    for (let dy = -7; dy <= 7; dy++) {
      for (let dx = -7; dx <= 7; dx++) {
        const d2 = dx * dx + dy * dy;
        if (d2 >= 43 && d2 <= 56) base.px(cx + dx, cy + dy, C.cyan);
      }
    }
    // 5 inner 2x2 holes
    for (let i = 0; i < 5; i++) {
      const ang = (i * 72 - 90) * Math.PI / 180;
      const hx = Math.round(cx + 4 * Math.cos(ang));
      const hy = Math.round(cy + 4 * Math.sin(ang));
      base.rect(hx, hy, 2, 2, '#05030c');
    }
    // centre pixel
    base.px(cx, cy, C.core);
    // bracket down to facade top
    base.px(cx, 24, METAL[0]);
    base.px(cx, 25, METAL[0]);
  }
  // film strip between reels
  base.rect(21, 12, 30, 8, '#05030c');
  for (let x = 21; x <= 50; x += 3) {
    base.px(x, 12, C.white);
    base.px(x, 19, C.white);
  }
}

// 2. Big screen
{
  base.rect(14, 30, 44, 26, METAL[3]);
  base.rect(16, 32, 40, 22, '#0a0618');
  // outline
  for (let y = 29; y <= 56; y++) { base.px(13, y, '#05030c'); base.px(58, y, '#05030c'); }
  for (let x = 13; x <= 58; x++) { base.px(x, 29, '#05030c'); base.px(x, 56, '#05030c'); }
}

// 3. Marquee
{
  // left shadow
  base.rect(2, 58, 3, 10, METAL[1]);
  base.rect(5, 58, 64, 10, METAL[2]);
  // right rim
  base.rect(68, 58, 1, 10, METAL[3]);
  base.rect(69, 58, 1, 10, C.rim);
  // bulbs top/bottom every 2px
  for (let x = 2; x <= 69; x += 2) {
    const a = ((x - 2) / 2) % 2 === 0 ? 1 : 0.5;
    base.px(x, 58, C.yellow, a);
    base.px(x, 67, C.yellow, a);
  }
  // sign band
  base.rect(6, 60, 60, 6, '#05030c');
  const s = 'SHOWING';
  const tw = textWidth(s, 1);
  const tx = 6 + Math.round((60 - tw) / 2);
  text(base, s, tx, 60, C.pink, 1);
  // outline
  for (let y = 58; y <= 67; y++) { base.px(1, y, '#05030c'); base.px(70, y, '#05030c'); }
  for (let x = 2; x <= 69; x++) { base.px(x, 57, '#05030c'); base.px(x, 68, '#05030c'); }
}

// 5. Entrance
{
  // double doors
  base.rect(26, 74, 20, 14, C.cyan, 0.45);
  base.rect(35, 74, 1, 14, METAL[0]);
  base.rect(28, 80, 6, 1, METAL[3]);
  base.rect(38, 80, 6, 1, METAL[3]);
  // door outlines
  base.rect(25, 73, 22, 1, '#05030c');
  base.rect(25, 74, 1, 14, '#05030c');
  base.rect(46, 74, 1, 14, '#05030c');
  // ticket booth
  base.rect(52, 72, 2, 16, METAL[0]);
  base.rect(54, 72, 7, 16, METAL[1]);
  base.rect(60, 72, 1, 16, METAL[3]);
  base.rect(61, 72, 1, 16, C.rim);
  base.rect(54, 74, 6, 4, C.yellow, 0.5);
  base.rect(54, 82, 6, 2, '#05030c');
  // outline
  for (let y = 72; y <= 87; y++) { base.px(51, y, '#05030c'); base.px(62, y, '#05030c'); }
  for (let x = 52; x <= 61; x++) base.px(x, 71, '#05030c');
}

// 6. Posters
{
  function poster(x, y, kind) {
    base.rect(x, y, 8, 12, METAL[3]);
    base.rect(x + 1, y + 1, 6, 10, '#0a0618');
    if (kind === 1) {
      // pink sun over cyan horizon
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
        if (dx * dx + dy * dy <= 4) base.px(x + 4 + dx, y + 3 + dy, C.pink);
      }
      base.rect(x + 1, y + 7, 6, 1, C.cyan);
    } else {
      // yellow star
      const cx = x + 4, cy = y + 5;
      base.px(cx, cy - 2, C.yellow);
      base.px(cx - 1, cy - 1, C.yellow); base.px(cx, cy - 1, C.yellow); base.px(cx + 1, cy - 1, C.yellow);
      base.px(cx - 2, cy, C.yellow); base.px(cx - 1, cy, C.yellow); base.px(cx, cy, C.yellow); base.px(cx + 1, cy, C.yellow); base.px(cx + 2, cy, C.yellow);
      base.px(cx - 1, cy + 1, C.yellow); base.px(cx, cy + 1, C.yellow); base.px(cx + 1, cy + 1, C.yellow);
      base.px(cx, cy + 2, C.yellow);
    }
  }
  poster(8, 70, 1);
  poster(56, 70, 2);
}

// dither bottom ~20 rows
for (let y = 68; y <= 87; y++) {
  const t = (y - 68) / 19;
  for (let x = 0; x < W; x++) {
    const p = base.get(x, y);
    if (!p || p[3] === 0) continue;
    const hex = '#' + p.slice(0, 3).map((v) => v.toString(16).padStart(2, '0')).join('');
    let newc = null;
    for (let i = 1; i < METAL.length; i++) {
      if (hex.toLowerCase() === METAL[i].toLowerCase()) { newc = METAL[i - 1]; break; }
    }
    if (newc && bayer(x, y) < t) base.px(x, y, newc);
  }
}

// glow for neons
{
  const mReel = new Array(W * H).fill(0);
  const mBulb = new Array(W * H).fill(0);
  const cyanRgb = rgb(C.cyan), yellowRgb = rgb(C.yellow);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const p = base.get(x, y);
    if (!p || p[3] === 0) continue;
    if (p[0] === cyanRgb[0] && p[1] === cyanRgb[1] && p[2] === cyanRgb[2]) mReel[y * W + x] = 1;
    if (p[0] === yellowRgb[0] && p[1] === yellowRgb[1] && p[2] === yellowRgb[2]) mBulb[y * W + x] = 1;
  }
  glow(base, mReel, W, H, 0, 0, C.cyan, 2, 0.35);
  glow(base, mBulb, W, H, 0, 0, C.yellow, 2, 0.3);
}

// animation frames
function frameBase() {
  const L = new Layer(40, 22);
  L.rect(0, 0, 6, 1, C.white, 0.5);
  return L;
}

const f0 = frameBase();
{
  // sun
  for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
    if (dx * dx + dy * dy <= 9) f0.px(30 + dx, 6 + dy, C.pink);
  }
  // horizon
  f0.rect(0, 17, 40, 1, C.cyan);
  // stick figure
  const fx = 8;
  f0.px(fx, 7, C.white);
  for (let y = 8; y <= 13; y++) f0.px(fx, y, C.white);
  f0.rect(fx - 3, 10, 7, 1, C.white);
  f0.px(fx - 1, 14, C.white); f0.px(fx - 2, 15, C.white); f0.px(fx - 2, 16, C.white);
  f0.px(fx + 1, 14, C.white); f0.px(fx + 2, 15, C.white); f0.px(fx + 2, 16, C.white);
}

const f1 = frameBase();
{
  // sun
  for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
    if (dx * dx + dy * dy <= 9) f1.px(30 + dx, 6 + dy, C.pink);
  }
  f1.rect(0, 17, 40, 1, C.cyan);
  const fx = 8;
  f1.px(fx, 7, C.white);
  for (let y = 8; y <= 13; y++) f1.px(fx, y, C.white);
  // arms up
  f1.rect(fx - 3, 8, 7, 1, C.white);
  f1.px(fx - 1, 14, C.white); f1.px(fx - 2, 15, C.white); f1.px(fx - 2, 16, C.white);
  f1.px(fx + 1, 14, C.white); f1.px(fx + 2, 15, C.white); f1.px(fx + 2, 16, C.white);
  // speech bubble
  f1.rect(12, 2, 8, 4, C.yellow);
  f1.px(14, 3, '#05030c'); f1.px(16, 3, '#05030c'); f1.px(18, 3, '#05030c');
}

const f2 = frameBase();
{
  f2.rect(2, 2, 6, 18, C.pink);
  f2.rect(10, 2, 6, 18, C.cyan);
  f2.rect(18, 2, 6, 18, C.yellow);
  f2.rect(20, 0, 1, 22, C.core);
}

const frames = [f0, f1, f2];

export default {
  label: 'AI VIDEO',
  aria: 'Pixel-art neon cinema with a lit marquee, film-reel signs and a big screen playing frames: ai-video-editor',
  h: 88,
  base,
  anim: { frames, x: 16, y: 32, fw: 40, fh: 22, seq: [[0, 1.2], [1, 1.2], [2, 0.6]] },
};