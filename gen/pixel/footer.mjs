// Pixel-art neon footer signs -> assets/portfolio.svg + assets/youtube.svg
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Layer, bayer, glow, text, textWidth } from './px.mjs';

const W = 200, H = 60;

function makeBase() {
  const L = new Layer(W, H);
  L.rect(0, 0, W, H, '#07041a');
  L.rect(4, 4, 192, 52, '#0c0620');
  // outline
  L.rect(3, 3, 194, 1, '#05030c');
  L.rect(3, 56, 194, 1, '#05030c');
  L.rect(3, 3, 1, 54, '#05030c');
  L.rect(196, 3, 1, 54, '#05030c');
  // inner edge
  L.rect(5, 5, 190, 1, '#150b31');
  L.rect(5, 54, 190, 1, '#150b31');
  L.rect(5, 5, 1, 50, '#150b31');
  L.rect(194, 5, 1, 50, '#150b31');
  // chains
  L.rect(30, 0, 1, 5, '#4a3a7a');
  L.rect(170, 0, 1, 5, '#4a3a7a');
  return L;
}

function neonTube(glowLayer, tubeLayer, color, coreColor, draw) {
  const tmp = new Layer(W, H);
  draw(tmp, color);
  const mask = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const g = tmp.get(x, y);
    mask.push(g && g[3] > 0 ? 1 : 0);
  }
  glow(glowLayer, mask, W, H, 0, 0, color, 3, 0.7);
  draw(tubeLayer, color);
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    const i = y * W + x;
    if (!mask[i]) continue;
    if (mask[i - W] && mask[i + W] && mask[i - 1] && mask[i + 1]) {
      tubeLayer.px(x, y, coreColor);
    }
  }
}

function drawBorder(L, c) {
  for (let x = 9; x <= 190; x++) { L.px(x, 9, c); L.px(x, 50, c); }
  for (let y = 9; y <= 50; y++) { L.px(9, y, c); L.px(190, y, c); }
}

function playCut(x, y) {
  if (x === 14 && (y === 14 || y === 15)) return true;
  if (x === 15 && y === 14) return true;
  if (x === 57 && (y === 14 || y === 15)) return true;
  if (x === 56 && y === 14) return true;
  if (x === 14 && (y === 45 || y === 44)) return true;
  if (x === 15 && y === 45) return true;
  if (x === 57 && (y === 45 || y === 44)) return true;
  if (x === 56 && y === 45) return true;
  return false;
}

function drawPlayButton(L, c) {
  for (let y = 14; y < 14 + 32; y++) {
    for (let x = 14; x < 14 + 44; x++) {
      if (playCut(x, y)) continue;
      L.px(x, y, c);
    }
  }
}

function drawTriangle(L, c) {
  for (let y = 21; y <= 39; y++) {
    let xr;
    if (y <= 30) {
      const t = (y - 21) / (30 - 21);
      xr = 30 + (44 - 30) * t;
    } else {
      const t = (y - 30) / (39 - 30);
      xr = 44 + (30 - 44) * t;
    }
    for (let x = 30; x <= Math.floor(xr); x++) L.px(x, y, c);
  }
}

const enterX = Math.round((W - textWidth('ENTER', 2)) / 2);
const portfolioX = Math.round((W - textWidth('PORTFOLIO', 2)) / 2);
console.log(`TEXT ENTER x=${enterX} PORTFOLIO x=${portfolioX}`);

// --- portfolio ---
const baseP = makeBase();
const glowP = new Layer(W, H);
const tubeP = new Layer(W, H);
neonTube(glowP, tubeP, '#ff2e88', '#ffe6f4', (L, c) => drawBorder(L, c));
neonTube(glowP, tubeP, '#ff2e88', '#ffe6f4', (L, c) => text(L, 'ENTER', enterX, 14, c, 2));
neonTube(glowP, tubeP, '#ff2e88', '#ffe6f4', (L, c) => text(L, 'PORTFOLIO', portfolioX, 32, c, 2));
neonTube(glowP, tubeP, '#3ff0e6', '#f4ecff', (L, c) => { text(L, '>>', 16, 27, c, 1); text(L, '>>', 172, 27, c, 1); });

const svgPortfolio = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="500" height="150" role="img" aria-label="Neon pixel sign: ENTER PORTFOLIO. Opens iamshreyas.pages.dev." shape-rendering="crispEdges">
<style>
image{image-rendering:pixelated;image-rendering:crisp-edges}
.tube{animation:flick 5s steps(1,end) infinite}
@keyframes flick{0%{opacity:1}82%{opacity:1}83%{opacity:.35}84%{opacity:1}86%{opacity:.35}87%{opacity:1}100%{opacity:1}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
</style>
<image x="0" y="0" width="200" height="60" href="${baseP.uri()}"/>
<image x="0" y="0" width="200" height="60" href="${glowP.uri()}"/>
<image class="tube" x="0" y="0" width="200" height="60" href="${tubeP.uri()}"/>
</svg>`;

// --- youtube ---
const baseY = makeBase();
const glowY = new Layer(W, H);
const tubeY = new Layer(W, H);
neonTube(glowY, tubeY, '#ff3355', '#ff3355', (L, c) => drawPlayButton(L, c)); // filled shape: no white core, or the triangle vanishes
drawTriangle(tubeY, '#f4ecff');
neonTube(glowY, tubeY, '#ff2e88', '#ffe6f4', (L, c) => text(L, 'YOUTUBE', 66, 16, c, 2));
neonTube(glowY, tubeY, '#3ff0e6', '#f4ecff', (L, c) => text(L, 'THE-SHREYAS-M', 66, 36, c, 1));

const dot = new Layer(3, 3);
dot.rect(0, 0, 3, 3, '#ff3355');

const svgYoutube = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="500" height="150" role="img" aria-label="Neon pixel billboard: YouTube, The-Shreyas-M. Opens the YouTube channel." shape-rendering="crispEdges">
<style>
image{image-rendering:pixelated;image-rendering:crisp-edges}
.air{animation:air 1.2s steps(1,end) infinite}
@keyframes air{0%{opacity:1}50%{opacity:0}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
</style>
<image x="0" y="0" width="200" height="60" href="${baseY.uri()}"/>
<image x="0" y="0" width="200" height="60" href="${glowY.uri()}"/>
<image x="0" y="0" width="200" height="60" href="${tubeY.uri()}"/>
<image class="air" x="182" y="10" width="3" height="3" href="${dot.uri()}"/>
</svg>`;

const out = (name, s) => { writeFileSync(fileURLToPath(new URL(`../../assets/${name}`, import.meta.url)), s); console.log('WROTE assets/' + name, Math.round(s.length / 1024) + ' KB'); };
mkdirSync(fileURLToPath(new URL('../../assets', import.meta.url)), { recursive: true });
out('portfolio.svg', svgPortfolio);
out('youtube.svg', svgYoutube);