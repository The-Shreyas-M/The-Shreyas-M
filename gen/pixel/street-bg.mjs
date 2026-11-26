import { Layer, rgb, mix, rng, bayer, glow, FONT, text, textWidth } from './px.mjs';
import { sheet, spriteTimeline } from './sprite.mjs';
import { moveCss, parallaxKeys } from './track.mjs';
import { BUILDINGS, building } from './buildings.mjs';

const W = 400, H = 168;

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
const FAR_BASE = 96;
const far = new Layer(400, H, { wrapX: true });
for (let x = 0; x < 400;) {
  const bw = ri(8, 26), bh = ri(48, 108), top = FAR_BASE - bh;
  far.rect(x, top, bw, bh, C.far);
  far.rect(x, top, bw, 1, C.farRim);
  far.rect(x + bw - 1, top, 1, bh, C.farRim, 0.6);
  if (R() < 0.35) { const sw = Math.max(3, bw - ri(4, 8)); far.rect(x + ((bw - sw) >> 1), top - ri(4, 10), sw, 12, C.far); }
  if (R() < 0.4) { const ax = x + ri(2, bw - 2), ah = ri(5, 14); far.rect(ax, top - ah - 6, 1, ah + 6, C.farRim); far.px(ax, top - ah - 7, C.red); }
  windows(far, x, top, bw, FAR_BASE, { lit: 0.1, cols: [C.cyan, C.cyan, C.pink, C.yellow], dim: 0.35 });
  x += bw + (R() < 0.25 ? ri(1, 3) : 0);
}
fog(far, FAR_BASE - 70, 0.9);

// ---------- buildings tile ----------
const tile = new Layer(560, 128);
for (let i = 0; i <= 6; i++) {
  const b = building(BUILDINGS[i]);
  for (let y = 0; y < b.h; y++) for (let x = 0; x < 72; x++) {
    const p = b.base.get(x, y);
    if (p && p[3] > 0) tile.px(i * 80 + 4 + x, 128 - b.h + y, [p[0], p[1], p[2]], p[3] / 255);
  }
  tile.rect(i * 80, 127, 80, 1, '#0c0620');
}

const animMarkups = [];
const animCssParts = [];
for (let i = 0; i <= 6; i++) {
  const b = building(BUILDINGS[i]);
  if (!b.anim) continue;
  const sh = sheet(b.anim.frames);
  const sheetUri = sh.uri();
  const sheetW = sh.w;
  for (let k = 0; k <= 1; k++) {
    const cls = `b${i}k${k}`;
    animCssParts.push(spriteTimeline(cls, b.anim.fw, b.anim.seq, { rest: b.anim.seq[0][0] }).css);
    const X = k * 560 + i * 80 + 4 + b.anim.x;
    const Y = 128 - b.h + b.anim.y;
    animMarkups.push(`<g transform="translate(${X} ${Y})"><clipPath id="${cls}-c"><rect width="${b.anim.fw}" height="${b.anim.fh}"/></clipPath><g clip-path="url(#${cls}-c)"><image class="${cls}" href="${sheetUri}" width="${sheetW}" height="${b.anim.fh}"/></g></g>`);
  }
}
const bldgMarkup = `<g class="bldg"><use href="#bt" x="0"/><use href="#bt" x="560"/>${animMarkups.join('')}</g>`;

// ---------- street ----------
const street = new Layer(400, 168);
for (let y = 128; y <= 133; y++) for (let x = 0; x < 400; x++) street.px(x, y, '#2e2350');
for (let x = 0; x < 400; x++) street.px(x, 128, '#7a6ab0');
for (let y = 129; y <= 133; y++) for (let x = 0; x < 400; x++) if (x % 16 === 0) street.px(x, y, '#1b1430');
for (let y = 134; y <= 159; y++) for (let x = 0; x < 400; x++) {
  street.px(x, y, '#120a24');
  if (y <= 137 && bayer(x, y) < (138 - y) / 5) street.px(x, y, '#1e1436');
}
for (let x = 0; x < 400; x++) {
  if ((x * 7 % 23) < 3) for (let y = 150; y <= 153; y++) street.px(x, y, '#ff2e88', 0.18);
  if ((x * 5 % 31) < 2) for (let y = 140; y <= 143; y++) street.px(x, y, '#3ff0e6', 0.15);
}
for (let y = 160; y <= 167; y++) for (let x = 0; x < 400; x++) street.px(x, y, '#05030c');
for (let x = 0; x < 400; x++) street.px(x, 160, '#36206e');

// ---------- road dashes ----------
const dashLayer = new Layer(40, 1);
for (let x = 0; x <= 19; x++) dashLayer.px(x, 0, '#ffd84a', 0.7);
const dashMarkup = `<g class="dash">${[0, 40, 80, 120, 160, 200, 240, 280, 320, 360, 400].map((x) => `<use href="#dt" x="${x}" y="147"/>`).join('')}</g>`;

// ---------- near props ----------
const near = new Layer(160, 168);
function bollard(x0) {
  near.rect(x0, 156, 3, 6, '#4a3a7a');
  near.rect(x0, 158, 3, 1, '#ffd84a');
  for (let y = 156; y <= 161; y++) near.px(x0 - 1, y, '#05030c');
  for (let y = 156; y <= 161; y++) near.px(x0 + 3, y, '#ff3fa4');
  for (let x = x0; x <= x0 + 2; x++) near.px(x, 155, '#05030c');
  for (let x = x0; x <= x0 + 2; x++) near.px(x, 162, '#05030c');
}
bollard(10);
// hydrant
near.rect(59, 156, 3, 1, '#e8407a');
near.rect(58, 157, 5, 7, '#b0205a');
for (let x = 59; x <= 61; x++) near.px(x, 155, '#05030c');
for (let y = 156; y <= 163; y++) near.px(57, y, '#05030c');
for (let y = 156; y <= 163; y++) near.px(63, y, '#ff3fa4');
for (let x = 58; x <= 62; x++) near.px(x, 164, '#05030c');
near.px(58, 156, '#05030c');
near.px(62, 156, '#ff3fa4');
bollard(104);
// neon sign
near.rect(132, 157, 10, 4, '#1e1436');
near.rect(134, 158, 6, 1, '#3ff0e6');
for (let x = 132; x <= 141; x++) near.px(x, 156, '#05030c');
for (let x = 132; x <= 141; x++) near.px(x, 161, '#05030c');
for (let y = 157; y <= 160; y++) near.px(131, y, '#05030c');
for (let y = 157; y <= 160; y++) near.px(142, y, '#ff3fa4');
const nearMarkup = `<g class="near"><use href="#nt" x="0"/><use href="#nt" x="160"/><use href="#nt" x="320"/><use href="#nt" x="480"/></g>`;

// ---------- rain ----------
const rain = new Layer(W, H, { wrapX: true, wrapY: true });
for (let n = 0; n < 170; n++) {
  const x = ri(0, W - 1), y = ri(0, H - 1), len = ri(3, 6), a = 0.25 + R() * 0.35;
  for (let k = 0; k < len; k++) rain.px(x - (k >> 1), y + k, C.rain, a);
}

// ---------- compose ----------
const img = (L, x = 0, y = 0, cls = '') =>
  `<image${cls ? ` class="${cls}"` : ''} x="${x}" y="${y}" width="${L.w}" height="${L.h}" href="${L.uri()}"/>`;

const farCss = moveCss('far', parallaxKeys(400, 400));
const bldgCss = moveCss('bldg', parallaxKeys(560, 560));
const dashCss = moveCss('dash', parallaxKeys(2240, 40));
const nearCss = moveCss('near', parallaxKeys(1120, 160));
const rainCss = `.rain{animation:rain .45s steps(9) infinite}@keyframes rain{from{transform:translate(0,0)}to{transform:translate(-84px,168px)}}`;

const css = [
  'image{image-rendering:pixelated;image-rendering:crisp-edges}',
  farCss,
  bldgCss,
  ...animCssParts,
  dashCss,
  nearCss,
  rainCss,
].join('');

const defs = [
  `<image id="ft" href="${far.uri()}" width="400" height="168"/>`,
  `<image id="bt" href="${tile.uri()}" width="560" height="128"/>`,
  `<image id="dt" href="${dashLayer.uri()}" width="40" height="1"/>`,
  `<image id="nt" href="${near.uri()}" width="160" height="168"/>`,
].join('');

const back = img(sky) +
  `<g class="far"><use href="#ft" x="0"/><use href="#ft" x="400"/></g>` +
  bldgMarkup +
  img(street) +
  dashMarkup;

const front = nearMarkup +
  `<g class="rain">${[0, 400].map((x) => [-168, 0].map((y) => img(rain, x, y)).join('')).join('')}</g>`;

export function streetBackground() {
  return { css, defs, back, front };
}
