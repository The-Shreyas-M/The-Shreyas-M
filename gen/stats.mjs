import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Layer, bayer, text, textWidth, rgb, mix, rng } from './pixel/px.mjs';
import { loadStats, wantsFixture } from './lib/github.mjs';

const s = await loadStats({ fixture: wantsFixture() });

const W = 400, H = 168;
const SKY = ['#07041a', '#120836', '#230b4f', '#3d0f5e', '#661466', '#9c1d6c', '#c8306f'];
const r = rng(7);

// 1. Backdrop
const backdrop = new Layer(W, H);
for (let y = 0; y < H; y++) {
  const t = Math.min(SKY.length - 1, (y / (H * 0.85)) * (SKY.length - 1)), i = Math.floor(t), f = t - i;
  for (let x = 0; x < W; x++) backdrop.px(x, y, f > bayer(x, y) && i + 1 < SKY.length ? SKY[i + 1] : SKY[i]);
}
for (let i = 0; i < 10; i++) {
  const w = 20 + Math.floor(r() * 21);
  const h = 50 + Math.floor(r() * 61);
  const x = i * 40;
  backdrop.rect(x, H - h, w, h, '#2b1756');
  backdrop.rect(x + w - 1, H - h, 1, h, '#4a2a86');
}

// 2. Building
const building = new Layer(W, H);
// tower body
building.rect(110, 30, 180, 138, '#150b31');
building.rect(289, 30, 1, 138, '#36206e');
// outline
building.rect(109, 29, 182, 1, '#05030c');
building.rect(109, 168, 182, 1, '#05030c');
building.rect(109, 29, 1, 140, '#05030c');
building.rect(291, 29, 1, 140, '#05030c');
// struts
for (const sx of [130, 170, 230, 270]) building.rect(sx, 122, 1, 9, '#4a3a7a');
// windows
for (let y = 34; y + 4 <= 140; y += 8) {
  for (let x = 114; x + 3 <= 286; x += 8) {
    building.rect(x, y, 3, 4, '#0c0620');
    if (r() < 1 / 7) building.rect(x, y, 3, 4, '#ffd84a');
  }
}

// 3. Panel
const panel = new Layer(200, 104);
panel.rect(0, 0, 200, 104, '#0c0620', 0.85);
// outer border
panel.rect(0, 0, 200, 1, '#3ff0e6');
panel.rect(0, 103, 200, 1, '#3ff0e6');
panel.rect(0, 0, 1, 104, '#3ff0e6');
panel.rect(199, 0, 1, 104, '#3ff0e6');
// inset border
panel.rect(2, 2, 196, 1, '#ff2e88');
panel.rect(2, 101, 196, 1, '#ff2e88');
panel.rect(2, 2, 1, 100, '#ff2e88');
panel.rect(197, 2, 1, 100, '#ff2e88');

// 4. Panel content
const title = `GITHUB // ${s.login.toUpperCase()}`;
text(panel, title, Math.round((200 - textWidth(title, 1)) / 2), 6, '#ff2e88', 1);

const rows = [
  ['STARS', s.stars],
  ['COMMITS', s.commits],
  ['PRS', s.prs],
  ['ISSUES', s.issues],
  ['FOLLOW', s.followers],
  ['REPOS', s.repos],
];
for (let i = 0; i < rows.length; i++) {
  const y = 20 + i * 11;
  text(panel, rows[i][0], 8, y, '#3ff0e6', 1);
  const v = String(rows[i][1]);
  text(panel, v, 92 - textWidth(v, 1), y, '#f4ecff', 1);
}

const maxPct = Math.max(...s.languages.map((l) => l.pct));
const tubes = [];
for (let i = 0; i < s.languages.length; i++) {
  const lang = s.languages[i];
  const y = 20 + i * 14;
  const pctStr = Math.round(lang.pct) + '%';
  const pctX = 192 - textWidth(pctStr, 1);
  let name = lang.name.toUpperCase();
  while (104 + textWidth(name, 1) > pctX - 4) name = name.slice(0, -1); // full name when it fits
  text(panel, name, 104, y, '#f4ecff', 1);
  text(panel, pctStr, pctX, y, '#3ff0e6', 1);
  const tubeW = Math.max(4, Math.round((lang.pct / maxPct) * 88));
  const mixed = mix(rgb(lang.color), rgb('#ffffff'), 0.6);
  const mixedHex = '#' + mixed.map((v) => v.toString(16).padStart(2, '0')).join('');
  const tubeLayer = new Layer(tubeW, 5);
  tubeLayer.rect(0, 0, tubeW, 1, lang.color, 0.35);
  tubeLayer.rect(0, 1, tubeW, 1, lang.color);
  tubeLayer.rect(0, 2, tubeW, 1, mixedHex);
  tubeLayer.rect(0, 3, tubeW, 1, lang.color);
  tubeLayer.rect(0, 4, tubeW, 1, lang.color, 0.35);
  tubes.push({ layer: tubeLayer, x: 100 + 104, y: 18 + y + 8, delay: i * 0.15 });
}

const footer = `${s.contributions} CONTRIBUTIONS THIS YEAR`;
text(panel, footer, Math.round((200 - textWidth(footer, 1)) / 2), 92, '#ffd84a', 1);

// Animation css
const css = `
image{image-rendering:pixelated;image-rendering:crisp-edges}
.flick{opacity:0;animation:flick 5s steps(1) infinite}
@keyframes flick{0%{opacity:0}47%{opacity:0.08}48%{opacity:0}83%{opacity:0.12}84%{opacity:0}100%{opacity:0}}
.scan{animation:scan 4s steps(50) infinite}
@keyframes scan{from{transform:translateY(0)}to{transform:translateY(100px)}}
.tube{clip-path:inset(0 0 0 0);animation:tube 8s steps(22) infinite}
@keyframes tube{0%{clip-path:inset(0 100% 0 0)}30%{clip-path:inset(0 0 0 0)}100%{clip-path:inset(0 0 0 0)}}

`;

// Compose
let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="1000" height="420" shape-rendering="crispEdges" role="img" aria-label="Holographic billboard with GitHub stats: ${s.stars} stars, ${s.commits} commits this year, top language ${s.languages[0]?.name || ''}">`;
svg += `<style>${css}</style>`;
svg += `<image x="0" y="0" width="${W}" height="${H}" href="${backdrop.uri()}"/>`;
svg += `<image x="0" y="0" width="${W}" height="${H}" href="${building.uri()}"/>`;
svg += `<image x="100" y="18" width="200" height="104" href="${panel.uri()}"/>`;
for (const t of tubes) {
  svg += `<image class="tube" x="${t.x}" y="${t.y}" width="${t.layer.w}" height="${t.layer.h}" href="${t.layer.uri()}" style="animation-delay:${t.delay}s"/>`;
}
svg += `<rect x="100" y="18" width="200" height="104" fill="#3ff0e6" class="flick"/>`;
svg += `<rect x="101" y="19" width="198" height="2" fill="#f4ecff" opacity="0.15" class="scan"/>`;
svg += `</svg>`;

mkdirSync(fileURLToPath(new URL('../dist/', import.meta.url)), { recursive: true });
writeFileSync(fileURLToPath(new URL('../dist/stats.svg', import.meta.url)), svg);
console.log('WROTE dist/stats.svg', Math.round(svg.length / 1024) + ' KB', 'langs=' + s.languages.length, 'stars=' + s.stars);
