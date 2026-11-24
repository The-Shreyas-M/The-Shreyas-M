// Project buildings registry (R7, DESIGN §4b). Each building lives in gen/pixel/bldg/<name>.mjs and default-exports
// { label, aria, h, base: Layer(72,h), anim: { frames: Layer[], x, y, fw, fh, seq: [[frame, seconds], ...] } | null }.
// Pure on import; files are written only when this script is run directly.
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { Layer, bayer, text, textWidth } from './px.mjs';
import { sheet, spriteSvg, spriteTimeline } from './sprite.mjs';

export const BUILDINGS = ['oculius', 'charger65w', 'chocobao', 'esp32synth', 'neura', 'aivideo', 'axiom']; // street order
const MODS = {};
for (const n of BUILDINGS) {
  try { MODS[n] = (await import(`./bldg/${n}.mjs`)).default; } catch (e) { if (e.code !== 'ERR_MODULE_NOT_FOUND') throw e; }
}
export const READY = BUILDINGS.filter((n) => MODS[n]);

const SKY = ['#07041a', '#120836', '#230b4f', '#3d0f5e', '#661466', '#9c1d6c', '#c8306f'];
const FAR = '#2b1756', FAR_RIM = '#4a2a86', PLATE = '#0c0620', PINK = '#ff2e88', CYAN = '#3ff0e6';

export function building(name) {
  const m = MODS[name];
  if (!m) throw new Error(`unknown building ${name}`);
  const anim = m.anim ? { ...m.anim, period: +m.anim.seq.reduce((s, [, t]) => s + t, 0).toFixed(3) } : null;
  return { name, label: m.label, w: 72, h: m.h, base: m.base, anim };
}

export function buildingSvg(name) {
  const b = building(name), m = MODS[name], h = b.h, Hb = h + 24;
  const backdrop = new Layer(96, Hb);
  for (let y = 0; y < Hb; y++) {
    const t = Math.min(SKY.length - 1, (y / (Hb * 0.85)) * (SKY.length - 1)), i = Math.floor(t), f = t - i;
    for (let x = 0; x < 96; x++) backdrop.px(x, y, f > bayer(x, y) && i + 1 < SKY.length ? SKY[i + 1] : SKY[i]);
  }
  for (const s of [{ x: 0, w: 18, h: 60 }, { x: 24, w: 14, h: 80 }, { x: 52, w: 16, h: 70 }, { x: 76, w: 20, h: 55 }]) {
    backdrop.rect(s.x, Hb - s.h, s.w, s.h, FAR); backdrop.rect(s.x + s.w - 1, Hb - s.h, 1, s.h, FAR_RIM);
  }
  const np = new Layer(96, 11);
  np.rect(0, 0, 96, 11, PLATE); np.rect(0, 0, 96, 1, PINK);
  text(np, b.label, Math.round((96 - textWidth(b.label, 1)) / 2), 2, CYAN, 1);
  let animSvg = '', css = '';
  if (b.anim) {
    const cls = `anim-${name}`;
    css = spriteTimeline(cls, b.anim.fw, b.anim.seq, { rest: b.anim.seq[0][0] }).css;
    animSvg = spriteSvg(sheet(b.anim.frames).uri(), b.anim.fw, b.anim.fh, b.anim.frames.length, 12 + b.anim.x, 4 + b.anim.y, cls);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 ${Hb}" width="${96 * 2.5}" height="${Hb * 2.5}" role="img" aria-label="${m.aria}" shape-rendering="crispEdges">
<style>
image{image-rendering:pixelated;image-rendering:crisp-edges}
${css}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
</style>
<image x="0" y="0" width="96" height="${Hb}" href="${backdrop.uri()}"/>
<image x="12" y="4" width="72" height="${h}" href="${b.base.uri()}"/>
${animSvg}
<image x="0" y="${h + 8}" width="96" height="11" href="${np.uri()}"/>
</svg>`;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  mkdirSync(fileURLToPath(new URL('../../assets/projects/', import.meta.url)), { recursive: true });
  const only = process.argv[2];
  for (const n of only ? [only] : READY) {
    const s = buildingSvg(n);
    writeFileSync(fileURLToPath(new URL(`../../assets/projects/${n}.svg`, import.meta.url)), s);
    console.log('WROTE assets/projects/' + n + '.svg', Math.round(s.length / 1024) + ' KB');
  }
}
