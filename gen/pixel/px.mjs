// Tiny pixel-art toolkit: RGBA layers, PNG encoding (node:zlib only), dithering, 5x7 font.
import zlib from 'node:zlib';

const CRC = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC[(c ^ b) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
export function encodePNG(w, h, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) raw.set(rgba.subarray(y * w * 4, (y + 1) * w * 4), y * (w * 4 + 1) + 1);
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

export const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
export const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));

export function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
export const bayer = (x, y) => (BAYER[y & 3][x & 3] + 0.5) / 16;

export class Layer {
  constructor(w, h, { wrapX = false, wrapY = false } = {}) {
    this.w = w; this.h = h; this.wrapX = wrapX; this.wrapY = wrapY;
    this.d = new Uint8ClampedArray(w * h * 4);
  }
  idx(x, y) {
    if (this.wrapX) x = ((x % this.w) + this.w) % this.w; else if (x < 0 || x >= this.w) return -1;
    if (this.wrapY) y = ((y % this.h) + this.h) % this.h; else if (y < 0 || y >= this.h) return -1;
    return (y * this.w + x) * 4;
  }
  px(x, y, c, a = 1) {
    const i = this.idx(Math.round(x), Math.round(y));
    if (i < 0 || a <= 0) return;
    const col = typeof c === 'string' ? rgb(c) : c;
    const da = this.d[i + 3] / 255, oa = a + da * (1 - a);
    for (let k = 0; k < 3; k++) this.d[i + k] = (col[k] * a + this.d[i + k] * da * (1 - a)) / oa;
    this.d[i + 3] = oa * 255;
  }
  get(x, y) {
    const i = this.idx(x, y);
    return i < 0 ? null : [this.d[i], this.d[i + 1], this.d[i + 2], this.d[i + 3]];
  }
  rect(x, y, w, h, c, a = 1) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.px(x + i, y + j, c, a);
  }
  uri() {
    return 'data:image/png;base64,' + encodePNG(this.w, this.h, this.d).toString('base64');
  }
}

// Box-blurred glow of a mask (array of 0/1, size w*h) into a layer, colour c, max alpha amax.
export function glow(layer, mask, w, h, ox, oy, c, radius, amax) {
  let a = Float32Array.from(mask);
  const pass = (src, horiz) => {
    const out = new Float32Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let s = 0, n = 0;
      for (let k = -radius; k <= radius; k++) {
        const xx = horiz ? x + k : x, yy = horiz ? y : y + k;
        if (xx < 0 || yy < 0 || xx >= w || yy >= h) { n++; continue; }
        s += src[yy * w + xx]; n++;
      }
      out[y * w + x] = s / n;
    }
    return out;
  };
  for (let i = 0; i < 2; i++) a = pass(pass(a, true), false);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const v = Math.min(1, a[y * w + x] * 2.2) * amax;
    // quantise alpha into 4 pixel-art steps with ordered dithering
    const q = Math.floor(v * 4 + bayer(x, y) - 0.5) / 4;
    if (q > 0) layer.px(ox + x, oy + y, c, q);
  }
}

// Classic 5x7 font (uppercase, digits needed, punctuation).
export const FONT = {
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  B: ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
  C: ['.###.', '#...#', '#....', '#....', '#....', '#...#', '.###.'],
  D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  F: ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
  G: ['.###.', '#...#', '#....', '#.###', '#...#', '#...#', '.####'],
  H: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  I: ['.###.', '..#..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  J: ['..###', '...#.', '...#.', '...#.', '...#.', '#..#.', '.##..'],
  K: ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'],
  L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  M: ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'],
  N: ['#...#', '#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#'],
  O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  P: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
  Q: ['.###.', '#...#', '#...#', '#...#', '#.#.#', '#..#.', '.##.#'],
  R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  U: ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  V: ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
  W: ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '#.#.#', '.#.#.'],
  X: ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'],
  Y: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
  Z: ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
  0: ['.###.', '#...#', '#..##', '#.#.#', '##..#', '#...#', '.###.'],
  1: ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  2: ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'],
  3: ['####.', '....#', '....#', '.###.', '....#', '....#', '####.'],
  '/': ['....#', '...#.', '...#.', '..#..', '.#...', '.#...', '#....'],
  '-': ['.....', '.....', '.....', '.###.', '.....', '.....', '.....'],
  '.': ['.....', '.....', '.....', '.....', '.....', '.##..', '.##..'],
  ':': ['.....', '.##..', '.##..', '.....', '.##..', '.##..', '.....'],
  '>': ['#....', '.#...', '..#..', '...#.', '..#..', '.#...', '#....'],
  '_': ['.....', '.....', '.....', '.....', '.....', '.....', '#####'],
  ' ': ['.....', '.....', '.....', '.....', '.....', '.....', '.....'],
};
export const textWidth = (s, scale = 1) => s.length * 6 * scale - scale;
export function text(layer, s, x, y, c, scale = 1, a = 1) {
  [...s.toUpperCase()].forEach((ch, n) => {
    const g = FONT[ch] || FONT[' '];
    g.forEach((row, j) => [...row].forEach((v, i) => {
      if (v === '#') layer.rect(x + (n * 6 + i) * scale, y + j * scale, scale, scale, c, a);
    }));
  });
}
