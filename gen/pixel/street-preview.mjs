// Review helper: composite sprites into a rough street frame (DESIGN §4a rows) as an upscaled PNG.
// Usage: node gen/pixel/street-preview.mjs <out.png> [scale] [carFrame]
import { writeFileSync } from 'node:fs';
import { Layer, encodePNG, bayer } from './px.mjs';
import { READY, building } from './buildings.mjs';
import { carFrames, FH as CFH, SEAT } from './sprites/car.mjs';


const [out = 'preview/street.png', s = '3', cf = '0'] = process.argv.slice(2);
const W = 400, H = 168, S = +s;
const SKY = ['#07041a', '#120836', '#230b4f', '#3d0f5e', '#661466', '#9c1d6c', '#c8306f'];
const L = new Layer(W, H);
for (let y = 0; y < H; y++) {
  const t = Math.min(1, y / (H * 0.7)) * (SKY.length - 1), i = Math.floor(t), f = t - i;
  for (let x = 0; x < W; x++) L.px(x, y, f > bayer(x, y) && i + 1 < SKY.length ? SKY[i + 1] : SKY[i]);
}
const blit = (src, ox, oy, sx = 0, sy = 0, w = src.w, h = src.h) => {
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const p = src.get(sx + x, sy + y); if (p && p[3]) L.px(ox + x, oy + y, [p[0], p[1], p[2]], p[3] / 255);
  }
};
// buildings along the street, base on y=128, 80 px pitch
let bx = 4;
for (let k = 0; k < 5; k++) {
  const b = building(READY[k % READY.length]);
  blit(b.base, bx, 128 - b.h);
  if (b.anim) blit(b.anim.frames[0], bx + b.anim.x, 128 - b.h + b.anim.y);
  bx += 80;
}
L.rect(0, 128, W, 6, '#2e2350'); L.rect(0, 128, W, 1, '#7a6ab0');     // sidewalk + kerb highlight
L.rect(0, 134, W, 26, '#120a24');                                         // road
for (let x = 0; x < W; x += 40) L.rect(x, 147, 20, 1, '#ffd84a', 0.7);    // lane dashes
L.rect(0, 160, W, 8, '#05030c');                                          // front curb
const car = carFrames()[+cf];
L.rect(146, 154 + 1, 54, 1, '#ff2e88', 0.5);                              // underglow
blit(car, 140, 154 - (CFH - 1));


const d = new Uint8ClampedArray(W * S * H * S * 4);
for (let y = 0; y < H * S; y++) for (let x = 0; x < W * S; x++) { const p = L.get((x / S) | 0, (y / S) | 0); d.set(p, (y * W * S + x) * 4); }
writeFileSync(out, encodePNG(W * S, H * S, d));
console.log('WROTE', out);
