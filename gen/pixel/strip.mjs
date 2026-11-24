// Review helper: render a sprite module's frames as an upscaled contact sheet PNG.
// Usage: node gen/pixel/strip.mjs <out.png> [scale] [cols] [mech|char|car]
import { writeFileSync } from 'node:fs';
import { encodePNG, rgb } from './px.mjs';

const [out = 'preview/mech-strip.png', s = '4', c = '6', which = 'mech'] = process.argv.slice(2);
const mod = await import(`./sprites/${which === 'char' ? 'hero-char' : which}.mjs`);
const { FW, FH } = mod;
const S = +s, COLS = +c, GAP = 2, BG = rgb('#120836'), BG2 = rgb('#230b4f');
const frames = which === 'char' ? [...mod.charFrames(), ...(mod.shootFrames?.() ?? [])] : which === 'car' ? mod.carFrames() : mod.mechFrames();
const rows = Math.ceil(frames.length / COLS);
const W = COLS * (FW + GAP) * S, H = rows * (FH + GAP) * S;
const d = new Uint8ClampedArray(W * H * 4);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const b = ((x / S) >> 3) + ((y / S) >> 3) & 1 ? BG : BG2;
  d.set([...b, 255], (y * W + x) * 4);
}
frames.forEach((L, n) => {
  const ox = (n % COLS) * (FW + GAP) * S, oy = Math.floor(n / COLS) * (FH + GAP) * S;
  for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) {
    const p = L.get(x, y); if (!p || !p[3]) continue;
    for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) d.set(p, ((oy + y * S + j) * W + ox + x * S + i) * 4);
  }
});
writeFileSync(out, encodePNG(W, H, d));
console.log('WROTE', out, W + 'x' + H);
