import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Layer, bayer, rng, text, textWidth } from './pixel/px.mjs';
import { sheet, spriteSvg, spriteTimeline } from './pixel/sprite.mjs';
import { mechFrames, FW, FH, ANCHORS } from './pixel/sprites/mech.mjs';
import { moveCss, path } from './pixel/track.mjs';
import { loadContrib, wantsFixture } from './lib/github.mjs';

const c = await loadContrib({ fixture: wantsFixture() });

const W = 400, H = 168;
const SKY = ['#07041a', '#120836', '#230b4f', '#3d0f5e', '#661466', '#9c1d6c', '#c8306f'];

// 1. Backdrop
const backdrop = new Layer(W, H);
for (let y = 0; y < H; y++) {
  const t = Math.min(SKY.length - 1, (y / (H * 0.85)) * (SKY.length - 1)), i = Math.floor(t), f = t - i;
  for (let x = 0; x < W; x++) backdrop.px(x, y, f > bayer(x, y) && i + 1 < SKY.length ? SKY[i + 1] : SKY[i]);
}
const r = rng(11);
for (let i = 0; i < 12; i++) {
  const w = 18 + Math.floor(r() * 23);
  const h = 40 + Math.floor(r() * 51);
  const x = Math.floor(i * W / 12);
  backdrop.rect(x, H - h, w, h, '#2b1756');
  backdrop.rect(x + w - 1, H - h, 1, h, '#4a2a86');
}

// 2. Block
const block = new Layer(W, H);
// facade
block.rect(8, 34, 384, 66, '#150b31');
block.rect(391, 34, 1, 66, '#36206e');
// roof ledge
block.rect(6, 32, 388, 2, '#36206e');
block.rect(6, 32, 388, 1, '#ff3fa4');

// windows grid
const byCell = new Map();
for (const d of c.days) byCell.set(`${d.week},${d.weekday}`, d);
const WIN_COLORS = ['#1b1430', '#4a2a86', '#9c1d6c', '#ff2e88', '#ffd84a'];
for (let w = 0; w < 53; w++) {
  for (let wd = 0; wd < 7; wd++) {
    const x = 15 + w * 7, y = 44 + wd * 7;
    const d = byCell.get(`${w},${wd}`);
    if (!d) { block.rect(x, y, 5, 5, '#0c0620'); continue; }
    block.rect(x, y, 5, 5, WIN_COLORS[d.level]);
    if (d.level === 3 || d.level === 4) block.px(x, y, '#ffe6f4');
  }
}

// roof sign
const titleStr = 'CONTRIBUTION CITY';
const totalStr = `${c.total} THIS YEAR`;
const tw1 = textWidth(titleStr, 1);
block.rect(15 - 2, 22 - 2, tw1 + 4, 7 + 4, '#0c0620', 0.8);
text(block, titleStr, 15, 22, '#ff2e88', 1);
const tw2 = textWidth(totalStr, 1);
const startX = 385 - tw2;
block.rect(startX - 2, 22 - 2, tw2 + 4, 7 + 4, '#0c0620', 0.8);
text(block, totalStr, startX, 22, '#3ff0e6', 1);

// street
block.rect(0, 100, 400, 4, '#2e2350');
block.rect(0, 100, 400, 1, '#4a3a7a');
block.rect(0, 104, 400, 64, '#0c0620');
for (let x = 0; x < 400; x += 20) block.rect(x, 150, 8, 1, '#ffd84a');

// 3. Mech patrol assets
const frames = mechFrames();
const sh = sheet(frames);
const seq = [];
for (let i = 0; i < 10; i++) seq.push([7, 0.4], [8, 0.4], [9, 0.4], [10, 0.4]);
const mechCss = spriteTimeline('mechi', FW, seq, { rest: 7 }).css;
const patrolCss = moveCss('patrol', [...path(0, 8, -20, 100, 356, 100, { fps: 10 }), ...path(8, 16, 356, 100, -20, 100, { fps: 10 })], { total: 16, rest: { x: 168, y: 100 } });

// 4. Zaps
const topDays = [...c.days].sort((a, b) => b.count - a.count || a.date.localeCompare(b.date)).slice(0, 6);
const zaps = [...topDays].sort((a, b) => a.week - b.week || a.weekday - b.weekday || a.date.localeCompare(b.date)).map((d, k) => {
  const wx = 15 + d.week * 7 + 2;
  const wy = 44 + d.weekday * 7 + 2;
  let rx = wx - ANCHORS.coil[0];
  const cr = Math.min(356, Math.max(-20, rx));
  const tz = k < 3 ? (cr + 20) / 376 * 8 : 8 + (356 - cr) / 376 * 8;
  return { d, k, wx, wy, rx, cr, tz };
});

const pct = (t) => +((t / 16) * 100).toFixed(3);
function zapKf(name, tz, dur) {
  const end = tz + dur;
  const m = new Map();
  m.set(0, 0);
  m.set(tz, 1);
  m.set(end, 0);
  m.set(16, 0);
  const sorted = [...m.entries()].sort((a, b) => a[0] - b[0]);
  return `@keyframes ${name}{${sorted.map(([t, o]) => `${pct(t)}%{opacity:${o}}`).join('')}}`;
}

let zapCss = '';
for (const z of zaps) {
  zapCss += `.z${z.k},.zap${z.k}{animation:zap${z.k} 16s steps(1,end) infinite}\n`;
  zapCss += zapKf(`zap${z.k}`, z.tz, 0.25) + '\n';
  zapCss += `.f${z.k},.flash${z.k}{animation:flash${z.k} 16s steps(1,end) infinite}\n`;
  zapCss += zapKf(`flash${z.k}`, z.tz, 0.5) + '\n';
}

// 5. Blink
const r5 = rng(5);
const highDays = c.days.filter((d) => d.level >= 3);
const shuffled = [...highDays];
for (let i = shuffled.length - 1; i > 0; i--) {
  const j = Math.floor(r5() * (i + 1));
  [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
}
const blinkDays = shuffled.slice(0, 8);

// Build rects
const flashRects = zaps.map((z) =>
  `<rect class="flash f${z.k} flash${z.k}" x="${z.wx - 2}" y="${z.wy - 2}" width="5" height="5" fill="#ffe6f4"/>`
).join('');

const blinkRects = blinkDays.map((d, i) => {
  const x = 15 + d.week * 7, y = 44 + d.weekday * 7;
  return `<rect class="blink" x="${x}" y="${y}" width="5" height="5" fill="#1b1430" style="animation-delay:${i * 0.45}s"/>`;
}).join('');

const beamRects = zaps.map((z) => {
  const h = (100 + ANCHORS.coil[1]) - (z.wy + 3);
  return `<rect class="zap z${z.k} zap${z.k}" x="${z.wx}" y="${z.wy + 3}" width="1" height="${h}" fill="#3ff0e6"/>` +
    `<rect class="zap z${z.k} zap${z.k}" x="${z.wx - 1}" y="${z.wy + 3}" width="3" height="${h}" fill="#3ff0e6" opacity="0.35"/>`;
}).join('');

// CSS
const css = [
  'image{image-rendering:pixelated;image-rendering:crisp-edges}',
  mechCss,
  patrolCss,
  '.zap{opacity:0}',
  '.flash{opacity:0}',
  zapCss,
  '.blink{opacity:0;animation:blink 3.7s steps(1,end) infinite}',
  '@keyframes blink{0%{opacity:0}50%{opacity:1}56%{opacity:0}100%{opacity:0}}',
  '@media (prefers-reduced-motion:reduce){*{animation:none!important}}',
].join('\n');

const patrolGroup = `<g class="patrol">${spriteSvg(sh.uri(), FW, FH, 11, 0, 0, 'mechi')}</g>`;

let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 168" width="1000" height="420" shape-rendering="crispEdges" role="img" aria-label="Contribution city: ${c.total} contributions in the last year as lit windows; a mech patrols the street and zaps the busiest days">`;
svg += `<style>${css}</style>`;
svg += `<image x="0" y="0" width="400" height="168" href="${backdrop.uri()}"/>`;
svg += `<image x="0" y="0" width="400" height="168" href="${block.uri()}"/>`;
svg += flashRects;
svg += blinkRects;
svg += beamRects;
svg += patrolGroup;
svg += `</svg>`;

mkdirSync(fileURLToPath(new URL('../dist/', import.meta.url)), { recursive: true });
writeFileSync(fileURLToPath(new URL('../dist/contrib-game.svg', import.meta.url)), svg);
console.log('WROTE dist/contrib-game.svg', Math.round(svg.length / 1024) + ' KB', 'days=' + c.days.length, 'zaps=' + zaps.length, 'first-zap-t=' + zaps[0].tz.toFixed(2));
