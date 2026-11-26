// Pixel-art cyberpunk city hero -> assets/hero.svg
// Layers (back to front): sky, far skyline, mid skyline, flying cars, near rooftops, neon sign, rain.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Layer, rgb, mix, rng, bayer, glow, FONT, text, textWidth } from './px.mjs';
import { sheet, spriteSvg, spriteCss } from './sprite.mjs';
import { FW as CW, FH as CH, charFrames } from './sprites/hero-char.mjs';

const W = 400, H = 168, TW = 800; // view size, tile width for scrolling layers
const C = {
  sky: ['#07041a', '#120836', '#230b4f', '#3d0f5e', '#661466', '#9c1d6c', '#c8306f'],
  far: '#2b1756', farRim: '#4a2a86', fog: '#c8306f',
  mid: '#150b31', midRim: '#36206e', midDark: '#0c0620',
  near: '#05030c', rim: '#ff3fa4',
  pink: '#ff2e88', cyan: '#3ff0e6', yellow: '#ffd84a', orange: '#ff8a3d', red: '#ff3355',
  core: '#ffe6f4', white: '#f4ecff', rain: '#a9b6ff',
};
const R = rng(7);
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
for (let n = 0; n < 90; n++) { // stars, thinning toward the haze
  const y = Math.floor(Math.pow(R(), 2) * H * 0.5);
  sky.px(ri(0, W - 1), y, R() < 0.8 ? '#8f86d8' : C.white, R() < 0.7 ? 0.6 : 1);
}
for (let n = 0; n < 7; n++) { // thin cloud bands
  const y = ri(30, 95), x0 = ri(-40, W), len = ri(40, 140);
  for (let x = x0; x < x0 + len; x++) {
    const edge = Math.min(x - x0, x0 + len - x) / 20;
    if (bayer(x, y) < Math.min(0.55, edge)) sky.px(x, y, '#ff7ab8', 0.25);
    if (bayer(x, y + 1) < Math.min(0.3, edge)) sky.px(x, y + 1, '#ff7ab8', 0.15);
  }
}

// ---------- landmark megatower + searchlights (static) ----------
const mark0 = new Layer(W, H);
for (const [bx, ang, col] of [[70, -0.35, '#ff7ab8'], [330, 0.28, '#8ff6ff']]) {
  for (let y = 0; y < H - 40; y++) {
    const spread = (H - 40 - y) * 0.09, cx = bx + (H - 40 - y) * ang;
    for (let x = Math.floor(cx - spread); x <= cx + spread; x++) {
      const a = 0.22 * (1 - Math.abs(x - cx) / (spread + 1)) * (y / H + 0.3);
      if (bayer(x, y) < a * 3) mark0.px(x, y, col, 0.18);
    }
  }
}
{
  const tx0 = 338, tw = 22, ttop = 42;
  mark0.rect(tx0, ttop, tw, H - ttop, '#3a1d6e');
  mark0.rect(tx0 + 4, ttop - 10, tw - 8, 10, '#3a1d6e');
  mark0.rect(tx0 + 9, ttop - 26, 4, 16, '#3a1d6e');
  mark0.rect(tx0 + 10, ttop - 40, 2, 14, '#5a34a0');
  mark0.rect(tx0 + tw - 2, ttop, 2, H - ttop, '#5a34a0');
  for (let y = ttop + 4; y < H; y += 6) mark0.rect(tx0 + 3, y, tw - 6, 1, '#ff2e88', 0.35);
  for (let k = 0; k < 3; k++) { const ry = ttop + 20 + k * 30; mark0.rect(tx0 - 6, ry, tw + 12, 2, '#5a34a0'); mark0.rect(tx0 - 6, ry, tw + 12, 1, '#3ff0e6', 0.8); }
}
const beacon = new Layer(5, 5); beacon.rect(1, 1, 3, 3, '#ff3355'); beacon.px(2, 0, '#ff3355', 0.5); beacon.px(2, 4, '#ff3355', 0.5); beacon.px(0, 2, '#ff3355', 0.5); beacon.px(4, 2, '#ff3355', 0.5);

// ---------- building helper ----------
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

// ---------- far skyline ----------
const far = new Layer(TW, H, { wrapX: true });
for (let x = 0; x < TW;) {
  const bw = ri(8, 26), bh = ri(70, 128), top = H - bh;
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
function sign(L, sx, sy, sw, sh, col) {
  const mask = [];
  for (let j = -4; j < sh + 4; j++) for (let i = -4; i < sw + 4; i++) mask.push(i >= 0 && j >= 0 && i < sw && j < sh ? 1 : 0);
  glow(L, mask, sw + 8, sh + 8, sx - 4, sy - 4, col, 2, 0.35);
  L.rect(sx, sy, sw, sh, '#14061f');
  L.rect(sx, sy, sw, 1, col); L.rect(sx, sy + sh - 1, sw, 1, col);
  L.rect(sx, sy, 1, sh, col); L.rect(sx + sw - 1, sy, 1, sh, col);
  const word = pick(['BAR', 'OPEN', 'HOTEL', 'ESP', 'VOLT', 'NOODLE', 'CYBER']);
  [...word].slice(0, Math.floor((sh - 3) / 8)).forEach((ch, k) => text(L, ch, sx + 1, sy + 2 + k * 8, col));
}
for (let x = 0; x < TW;) {
  const bw = ri(20, 50), bh = ri(42, 104), top = H - bh;
  mid.rect(x, top, bw, bh, C.mid);
  mid.rect(x, top, bw, 1, C.midRim);
  mid.rect(x + bw - 2, top, 2, bh, C.midRim, 0.7); // light from the right
  mid.rect(x, top, 1, bh, C.midDark);
  if (R() < 0.5) { // stepped crown + rooftop gear
    const cw = bw - ri(6, 12), cx = x + ((bw - cw) >> 1);
    mid.rect(cx, top - 6, cw, 6, C.mid); mid.rect(cx, top - 6, cw, 1, C.midRim);
    if (R() < 0.6) { mid.rect(cx + 2, top - 10, 5, 4, C.midDark); mid.rect(cx + 2, top - 10, 5, 1, C.midRim); }
  }
  if (R() < 0.45) { const ax = x + ri(3, bw - 3); mid.rect(ax, top - 22, 1, 22, C.midRim); mid.px(ax, top - 23, C.red); }
  windows(mid, x, top, bw, H, { lit: 0.16, cols: [C.cyan, C.yellow, C.pink, C.orange], w: 2, h: 1, gx: 4, gy: 4, dim: 0.5 });
  if (bw > 34 && R() < 0.28) { // billboard
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

// ---------- near rooftops ----------
const near = new Layer(TW, H, { wrapX: true });
for (let x = 0; x < TW;) {
  const sw = ri(30, 80), top = H - ri(10, 24);
  near.rect(x, top, sw, H - top, C.near);
  for (let i = 0; i < sw; i++) if (bayer(x + i, top) < 0.75) near.px(x + i, top, C.rim, 0.55);
  if (R() < 0.6) { // railing
    near.rect(x, top - 5, sw, 1, '#1a1030');
    for (let i = 0; i < sw; i += 5) near.rect(x + i, top - 5, 1, 5, '#1a1030');
  }
  if (R() < 0.6) { // AC unit with a fan
    const ax = x + ri(4, sw - 12);
    near.rect(ax, top - 7, 9, 7, '#120b22'); near.rect(ax, top - 7, 9, 1, '#3a2560');
    near.rect(ax + 2, top - 5, 4, 3, '#05030c'); near.px(ax + 4, top - 4, '#3a2560');
  }
  if (R() < 0.4) { const lx = x + ri(2, sw - 4); near.rect(lx, top - 2, 3, 1, pick([C.cyan, C.pink]), 0.9); }
  x += sw;
}

// ---------- foreground ledge + owner character (static ledge, animated sprite) ----------
const LEDGE_TOP = 148;
const ledge = new Layer(W, H);
{
  const lw = 62;
  ledge.rect(0, LEDGE_TOP, lw, H - LEDGE_TOP, C.near);
  for (let i = 0; i < lw; i++) if (bayer(i, LEDGE_TOP) < 0.8) ledge.px(i, LEDGE_TOP, C.rim, 0.7);
  ledge.rect(lw - 1, LEDGE_TOP, 1, H - LEDGE_TOP, C.rim, 0.45);
  for (let y = LEDGE_TOP + 4; y < H; y += 5) for (let i = 2; i < lw - 3; i++) if (bayer(i, y) < 0.4) ledge.px(i, y, '#1a1030');
  ledge.rect(4, LEDGE_TOP - 9, 1, 9, '#1a1030'); ledge.rect(4, LEDGE_TOP - 9, 14, 1, '#1a1030'); ledge.rect(17, LEDGE_TOP - 9, 1, 9, '#1a1030');
  ledge.rect(44, LEDGE_TOP - 18, 1, 18, '#1a1030'); ledge.px(44, LEDGE_TOP - 19, C.red);
  ledge.rect(48, LEDGE_TOP - 6, 9, 6, '#120b22'); ledge.rect(48, LEDGE_TOP - 6, 9, 1, '#3a2560'); ledge.px(55, LEDGE_TOP - 4, C.cyan);
}
const charSheet = sheet(charFrames());
const CHX = 24, CHY = LEDGE_TOP - CH + 1;

// ---------- flying car sprite ----------
function car(dir) {
  const L = new Layer(26, 6);
  const f = (x) => (dir > 0 ? x : 25 - x);
  for (let i = 0; i < 9; i++) L.px(f(17 + i), 3, C.yellow, 0.5 - i * 0.05); // headlight beam
  for (let i = 0; i < 12; i++) L.px(f(4 + i), 3, '#3b2a6b');
  for (let i = 0; i < 12; i++) L.px(f(4 + i), 4, '#24183f');
  for (let i = 0; i < 7; i++) L.px(f(6 + i), 2, '#5a4a96');
  L.px(f(11), 2, C.cyan); L.px(f(12), 2, C.cyan);
  L.px(f(16), 3, C.yellow);
  L.px(f(3), 3, C.red); L.px(f(2), 3, C.red, 0.5); L.px(f(1), 3, C.red, 0.25);
  L.px(f(7), 5, C.cyan, 0.6); L.px(f(13), 5, C.cyan, 0.6);
  return L;
}

// ---------- neon sign ----------
const NAME = 'SHREYAS', S = 4, GAP = 4;
const signW = NAME.length * (5 * S + GAP) - GAP, signH = 7 * S;
const pad = 10, SW = signW + pad * 2, SH = signH + pad * 2;
const core = new Uint8Array(SW * SH);
const on = (g, i, j) => j >= 0 && j < 7 && i >= 0 && i < 5 && g[j][i] === '#';
const mark = (x, y, w, h) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) core[(y + j) * SW + x + i] = 1; };
[...NAME].forEach((ch, n) => {
  const g = FONT[ch], ox = pad + n * (5 * S + GAP), oy = pad;
  for (let j = 0; j < 7; j++) for (let i = 0; i < 5; i++) {
    if (!on(g, i, j)) continue;
    const cx = ox + i * S + 1, cy = oy + j * S + 1;
    mark(cx, cy, 2, 2);
    if (on(g, i + 1, j)) mark(cx, cy, S + 2, 2);
    if (on(g, i, j + 1)) mark(cx, cy, 2, S + 2);
    for (const dx of [-1, 1]) if (on(g, i + dx, j + 1) && !on(g, i + dx, j) && !on(g, i, j + 1))
      for (let k = 0; k <= S; k++) mark(cx + k * dx, cy + k, 2, 2);
  }
});
const tube = new Layer(SW, SH), halo = new Layer(SW, SH);
const edge = new Uint8Array(SW * SH);
for (let y = 1; y < SH - 1; y++) for (let x = 1; x < SW - 1; x++) {
  if (core[y * SW + x]) continue;
  for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) if (core[(y + j) * SW + x + i]) edge[y * SW + x] = 1;
}
for (let p = 0; p < SW * SH; p++) {
  const x = p % SW, y = (p / SW) | 0;
  if (edge[p]) tube.px(x, y, C.pink);
  if (core[p]) tube.px(x, y, C.core);
}
glow(halo, [...core].map((v, p) => v || edge[p]), SW, SH, 0, 0, C.pink, 4, 0.75);
const signX = Math.round((W - SW) / 2), signY = 6;

// tagline + holo frame (static overlay)
const hud = new Layer(W, H);
const tag = 'HARDWARE HACKER / CODER / DESIGNER';
const tx = Math.round((W - textWidth(tag)) / 2), ty = signY + SH + 1;
hud.rect(tx - 4, ty - 3, textWidth(tag) + 8, 13, '#07041a', 0.75);
text(hud, tag, tx, ty, C.cyan);
// frame wraps whichever is wider, sign or tagline bar, and sits below the bar (it used to cut into the tagline)
const fx0 = Math.min(signX + 2, tx - 7), fy0 = signY + 2, fx1 = Math.max(signX + SW - 3, tx + textWidth(tag) + 6), fy1 = ty + 13;
for (const [x, y, dx, dy] of [[fx0, fy0, 1, 1], [fx1, fy0, -1, 1], [fx0, fy1, 1, -1], [fx1, fy1, -1, -1]]) {
  hud.rect(dx > 0 ? x : x - 7, y, 8, 1, C.cyan, 0.8);
  hud.rect(x, dy > 0 ? y : y - 7, 1, 8, C.cyan, 0.8);
}

// ---------- rain (tile wraps both ways) ----------
const rain = new Layer(W, H, { wrapX: true, wrapY: true });
for (let n = 0; n < 170; n++) {
  const x = ri(0, W - 1), y = ri(0, H - 1), len = ri(3, 6), a = 0.25 + R() * 0.35;
  for (let k = 0; k < len; k++) rain.px(x - (k >> 1), y + k, C.rain, a);
}

// ---------- compose SVG ----------
const img = (L, x = 0, y = 0, cls = '') =>
  `<image${cls ? ` class="${cls}"` : ''} x="${x}" y="${y}" width="${L.w}" height="${L.h}" href="${L.uri()}"/>`;
const strip = (L, cls) => `<g class="${cls}">${img(L, 0)}${img(L, TW)}</g>`;
const farUri = far.uri(), midUri = mid.uri(), nearUri = near.uri();
const carR = car(1), carL = car(-1);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="1000" height="420" role="img" aria-label="Pixel-art cyberpunk city at night in the rain, with a flickering neon sign that reads SHREYAS: hardware hacker, coder, designer" shape-rendering="crispEdges">
<style>
image{image-rendering:pixelated;image-rendering:crisp-edges}
.far{animation:pan 160s steps(800) infinite}
.mid{animation:pan 80s steps(800) infinite}
.near{animation:pan 36s steps(800) infinite}
@keyframes pan{to{transform:translateX(-${TW}px)}}
.carA{animation:carA 11s steps(440) infinite}
@keyframes carA{from{transform:translate(-30px,66px)}to{transform:translate(${W + 10}px,60px)}}
.carB{animation:carB 7s steps(440) 3s infinite both}
@keyframes carB{from{transform:translate(${W + 10}px,92px)}to{transform:translate(-30px,95px)}}
.rain{animation:rain .45s steps(9) infinite}
@keyframes rain{from{transform:translate(0,0)}to{transform:translate(${-H / 2}px,${H}px)}}
.beacon{animation:blink 1.4s steps(1) infinite}
@keyframes blink{50%{opacity:0}}
.halo{animation:flick 6s infinite}
.tube{animation:flick2 6s infinite}
@keyframes flick{0%,100%{opacity:.95}12%{opacity:.95}12.5%{opacity:.15}13.5%{opacity:.9}14%{opacity:.2}15%{opacity:.95}61%{opacity:.85}61.6%{opacity:.25}62.4%{opacity:.95}}
@keyframes flick2{0%,100%{opacity:1}12.5%{opacity:1}13%{opacity:.45}13.5%{opacity:1}14%{opacity:.5}15%{opacity:1}}
${spriteCss('hchar', CW, 4, 1.4)}

</style>
${img(sky)}
${img(mark0)}
${img(beacon, 346, -1, 'beacon')}
<g class="far"><image x="0" y="0" width="${TW}" height="${H}" href="${farUri}"/><image x="${TW}" y="0" width="${TW}" height="${H}" href="${farUri}"/></g>
<g class="mid"><image x="0" y="0" width="${TW}" height="${H}" href="${midUri}"/><image x="${TW}" y="0" width="${TW}" height="${H}" href="${midUri}"/></g>
<g class="carA">${img(carR)}</g>
<g class="carB">${img(carL)}</g>
<g class="near"><image x="0" y="0" width="${TW}" height="${H}" href="${nearUri}"/><image x="${TW}" y="0" width="${TW}" height="${H}" href="${nearUri}"/></g>
${img(ledge)}
${spriteSvg(charSheet.uri(), CW, CH, 4, CHX, CHY, 'hchar')}
${img(halo, signX, signY, 'halo')}
${img(tube, signX, signY, 'tube')}
${img(hud)}
<g class="rain">${[0, W].map((x) => [-H, 0].map((y) => img(rain, x, y)).join('')).join('')}</g>
</svg>
`;
const out = fileURLToPath(new URL('../../assets/hero.svg', import.meta.url));
writeFileSync(out, svg);
console.log('WROTE assets/hero.svg', Math.round(svg.length / 1024) + ' KB');
