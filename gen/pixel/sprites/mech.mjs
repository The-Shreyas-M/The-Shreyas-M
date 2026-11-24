// Bench-mech sprite frames — an original pixel mech that unfolds from a dev board.
// Parts are palette-indexed string grids (one char per pixel, '.' = transparent). Symmetric parts are
// written as their LEFT half and mirrored. Frames are composed by placing parts, then three passes run
// over the silhouette: right rim light (neon key light), left/top ramp shading, 1-px dark outline.
// Every frame is FW x FH; the bench contact line (board bottom / mech feet) is row FH-1.
// Sheet order: 0 = board, 1..6 = unfold, 7..10 = idle. Fold = unfold reversed.
import { Layer, rgb, mix, bayer } from '../px.mjs';

export const FW = 64, FH = 64;
export const FRAMES = { board: 0, unfold: [1, 2, 3, 4, 5, 6], idle: [7, 8, 9, 10] };
export const REST = 7; // reduced-motion resting frame (idle 0)

// Loop: board 2 s -> unfold 1 s -> idle 7 s -> fold 1 s  (total 11 s).
// POWER_ON = time (s) the board lights and sparks fly; STAND = time the mech is fully up.
export const POWER_ON = 1.6, STAND = 3.0, FOLD = 10.0, LOOP = 11.0;
export const TIMELINE = [
  [0, 2],
  ...FRAMES.unfold.map((f) => [f, 1 / 6]),
  ...Array.from({ length: 28 }, (_, i) => [FRAMES.idle[i % 4], 0.25]),
  ...[...FRAMES.unfold].reverse().map((f) => [f, 1 / 6]),
];

// ---------- palette ----------
const RAMP = ['#1b1430', '#2e2350', '#4a3a7a', '#7a6ab0', '#b8aee0']; // metal dark -> light
const P = {
  1: RAMP[0], 2: RAMP[1], 3: RAMP[2], 4: RAMP[3], 5: RAMP[4],
  x: '#05030c', // chip black / visor glass
  p: '#24468a', q: '#4a7ad0', // PCB substrate dark / light (bright enough to read on the night city)
  y: '#ffd84a', o: '#ff8a3d', // gold traces / copper
  k: '#ff2e88', w: '#ffe6f4', // neon pink / hot core
  c: '#3ff0e6', d: '#1c7f8c', // cyan / dim cyan
  r: '#ff3355', e: '#5a1830', // LED on / LED off
  v: '#1c7f8c', // visor (swapped per frame)
  g: '#3a8a9a', // unlit trace
};
const OUTLINE = '#05030c', RIM = '#ff3fa4', RIM2 = '#8ff6ff';

// ---------- part grids ----------
const mirror = (half, odd = false) => half.map((r) => r + [...r].reverse().join('').slice(odd ? 1 : 0));
const flip = (rows) => rows.map((r) => [...r].reverse().join(''));

const HEAD = mirror([
  '....222',
  '...2344',
  '..23454',
  '.234444',
  'k2xxxxx',
  'k2xvvvv',
  '.2xxxxx',
  '.233434',
  '..23443',
  '...2313',
]); // 14 x 10
const ANTENNA = ['r', '3', '2']; // 1 x 3

const TORSO = mirror([
  '..222222222',
  '.2344444444',
  '23455554444',
  '23444443222',
  '23444432yyy',
  '.234432ydcc',
  '.234432ycww',
  '.234432ycww',
  '..23432ydcc',
  '..234432yyy',
  '...23443222',
  '....2333333',
  '....12xxxxx',
  '....15x5x5x',
  '....12xxxxx',
  '....2341222',
  '....23kkk33',
  '.....222222',
]); // 22 x 18

const PELVIS = mirror([
  '..23333',
  '.234444',
  '2344111',
  '.222.11',
]); // 14 x 4

// right-side parts (mirrored for the left)
const PAULDRON = [
  '.222222.',
  '23444452',
  '2kkkkkk2',
  '23444432',
  '23444442',
  '.233332.',
  '..2222..',
]; // 8 x 7
const UPPER_ARM = ['2342', '2342', '2332', '2342', '1221', '.11.']; // 4 x 6
const FOREARM = [
  '233332',
  '234442',
  '23cc42',
  '23dd42',
  '234442',
  '233332',
  '.1221.',
]; // 6 x 7
const HAND = ['2342.', '2.2.2', '1.1.1']; // 5 x 3
const ARM_FOLDED = [
  '2333333332',
  '23cc44c442',
  '2333333332',
  '.11111111.',
]; // 10 x 4 — forearm tucked flat
const THIGH = ['233342', '234442', '234442', '233332', '234442', '233332', '.1111.']; // 6 x 7
const KNEE = ['.23332.', '2345542', '.2kk22.']; // 7 x 3
const SHIN = [
  '2334442',
  '2344442',
  '23kk442',
  '2344442',
  '2344442',
  '2333332',
  '.23432.',
  '.22222.',
]; // 7 x 8
const FOOT = ['..233332..', '.23444442.', '2333333332', '1111111111']; // 10 x 4

// dev board, side-on: 44 x 9 (headers, MCU, cap, LED on a PCB)
const BOARD = [
  '..5.5.5.5...........................5.5.5.5.',
  '..5.5.5.5...........................5.5.5.5.',
  '..11111111.oo...22222222222..........1111111',
  '..11111111.oo..2xxxxxxxxxx2...55.....1111111',
  '444411111.....2x4xxxxxxxxx2...55..e..1111111',
  'qqqyqqqqqqyqqqqqqqqyqqqqqqqqyqqqqqqqqqqyqqqq',
  'pgpppgggpppgpppgggppppgpppgggpppgpppgggppgpp',
  'ppppppgppppppgpppppppgppppppgpppppgpppppppgp',
  '11111111111111111111111111111111111111111111',
];
export const BOARD_W = 44, BOARD_H = 9;

// ---------- frame canvas ----------
class Canvas {
  constructor() { this.c = new Array(FW * FH).fill(null); }
  set(x, y, col) { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < FW && y < FH) this.c[y * FW + x] = col; }
  get(x, y) { return x >= 0 && y >= 0 && x < FW && y < FH ? this.c[y * FW + x] : null; }
  // stamp a grid with its top-left at (x, y); pal overrides chars; clipY hides rows at/after that y
  stamp(rows, x, y, pal = {}, { clipTop = -1, clipBottom = FH } = {}) {
    rows.forEach((row, j) => [...row].forEach((ch, i) => {
      if (ch === '.') return;
      const yy = y + j; if (yy < clipTop || yy >= clipBottom) return;
      this.set(x + i, yy, pal[ch] ?? P[ch]);
    }));
  }
  // stamp a grid rotated by angle (radians) around pivot (px, py) given in grid coords, placed at (ax, ay)
  stampRot(rows, ax, ay, px, py, ang, pal = {}) {
    const h = rows.length, w = rows[0].length, cs = Math.cos(ang), sn = Math.sin(ang);
    const R = Math.ceil(Math.hypot(w, h)) + 1;
    for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
      const gx = Math.round(cs * dx + sn * dy + px), gy = Math.round(-sn * dx + cs * dy + py);
      if (gx < 0 || gy < 0 || gx >= w || gy >= h) continue;
      const ch = rows[gy][gx]; if (ch === '.') continue;
      if (ay + dy >= FH) continue;
      this.set(ax + dx, ay + dy, pal[ch] ?? P[ch]);
    }
  }
}

// lighting + outline passes -> Layer
function finish(cv) {
  const L = new Layer(FW, FH);
  const solid = (x, y) => cv.get(x, y) !== null;
  const glowCols = new Set([P.c, P.w, P.y, P.r, P.k, P.o].map((h) => h.toLowerCase()));
  for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) {
    const col = cv.get(x, y);
    if (col === null) continue;
    let c = rgb(col);
    const ri = RAMP.indexOf(col);
    const lit = glowCols.has(col.toLowerCase());
    if (!lit) {
      if (!solid(x + 1, y)) c = mix(c, rgb(y % 7 < 4 ? RIM : RIM2), 0.55); // neon key light from the right
      else if (!solid(x + 2, y) && bayer(x, y) < 0.25) c = mix(c, rgb(RIM), 0.2);
      else if (!solid(x - 1, y) || (!solid(x - 2, y) && bayer(x, y) < 0.5)) c = ri > 0 ? rgb(RAMP[ri - 1]) : mix(c, [0, 0, 0], 0.3);
      else if (!solid(x, y - 1) && ri >= 0 && ri < 4) c = rgb(RAMP[ri + 1]); // top light
    }
    L.px(x, y, c);
  }
  for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) {
    if (solid(x, y)) continue;
    if (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1)) L.px(x, y, OUTLINE);
  }
  return L;
}

// ---------- poses ----------
const CX = 32, GROUND = FH - 1; // centre column, bench contact row
const HIP = GROUND - 23; // pelvis top row when standing (legs = thigh 7 + knee 3 + shin 8 + foot 4 + 1)

function legs(cv, splay = 0) {
  for (const s of [-1, 1]) {
    const f = s > 0 ? (r) => r : flip;
    const lx = (w, off) => (s > 0 ? CX + off + splay : CX - off - w - splay);
    cv.stamp(f(FOOT), lx(10, 2), GROUND - 3);
    cv.stamp(f(SHIN), lx(7, 3), GROUND - 11);
    cv.stamp(f(KNEE), lx(7, 3), GROUND - 13);
    cv.stamp(f(THIGH), lx(6, 3), GROUND - 19);
  }
}
function upper(cv, { lift = 0, arms = 'down', head = 1, visor = P.v, core = P.w, ring = P.c, bob = 0 } = {}) {
  const top = HIP - 18 - lift + bob; // torso top
  cv.stamp(PELVIS, CX - 7, HIP - lift + bob);
  // head rises out of the torso: head = fraction visible (0..1)
  if (head > 0) {
    const hy = top - Math.round(11 * head);
    cv.stamp(ANTENNA, CX + 3, hy - 3, {}, { clipBottom: top });
    cv.stamp(['.1111.'], CX - 3, hy + 10, {}, { clipBottom: top + 1 });
    cv.stamp(HEAD, CX - 7, hy, { v: visor }, { clipBottom: top });
  }
  cv.stamp(TORSO, CX - 11, top, { w: core, c: ring });
  for (const s of [-1, 1]) {
    const f = s > 0 ? (r) => r : flip;
    const ax = (w, off) => (s > 0 ? CX + off : CX - off - w);
    if (arms === 'folded') {
      cv.stamp(f(ARM_FOLDED), ax(10, 7), top + 10);
      cv.stamp(f(PAULDRON).slice(2), ax(8, 9), top + 2);
    } else if (arms === 'out') {
      cv.stamp(f(UPPER_ARM), ax(4, 14), top + 5);
      cv.stamp(f(FOREARM).map((r) => r), ax(6, 16), top + 9);
      cv.stamp(f(HAND), ax(5, 17), top + 16);
      cv.stamp(f(PAULDRON), ax(8, 9), top);
    } else {
      cv.stamp(f(UPPER_ARM), ax(4, 12), top + 6);
      cv.stamp(f(FOREARM), ax(6, 11), top + 12);
      cv.stamp(f(HAND), ax(5, 11), top + 19);
      cv.stamp(f(PAULDRON), ax(8, 9), top);
    }
  }
}
// board halves tilted as a tent: lift = how high the centre rises
function boardTent(cv, lift, lit) {
  const pal = lit ? { e: P.r, g: P.d } : {};
  const left = BOARD.map((r) => r.slice(0, 22)), right = BOARD.map((r) => r.slice(22));
  const ang = Math.asin(Math.min(1, lift / 22));
  // pivot at the inner bottom corner of each half, placed at the centre, raised by lift
  cv.stampRot(left, CX - 1, GROUND - lift, 21, 8, -ang, pal);
  cv.stampRot(right, CX, GROUND - lift, 0, 8, ang, pal);
}

export const ANCHORS = { led: [CX, GROUND - 4], steamL: [CX - 15, HIP - 18], steamR: [CX + 15, HIP - 18], coil: [CX, HIP - 11] };

export function mechFrames() {
  const frames = [];
  const add = (draw) => { const cv = new Canvas(); draw(cv); frames.push(finish(cv)); };
  // 0 board at rest
  add((cv) => cv.stamp(BOARD, CX - 22, GROUND - 8));
  // 1 power on: LED lit, centre lifts
  add((cv) => boardTent(cv, 3, true));
  // 2 torso pushes up, halves tent
  add((cv) => { upper(cv, { lift: -12, arms: 'folded', head: 0, core: P.c, ring: P.d }); boardTent(cv, 10, true); });
  // 3 halves swing down into legs
  add((cv) => { upper(cv, { lift: -4, arms: 'folded', head: 0, core: P.c, ring: P.d }); boardTent(cv, 19, true); });
  // 4 legs locked, arms still folded
  add((cv) => { legs(cv, 1); upper(cv, { arms: 'folded', head: 0.3, core: P.c }); });
  // 5 arms swing out, head rising
  add((cv) => { legs(cv); upper(cv, { arms: 'out', head: 0.7, visor: P.d }); });
  // 6 full stance, visor flash
  add((cv) => { legs(cv); upper(cv, { visor: P.w }); });
  // 7..10 idle: breathing bob, coil pulse, visor scan
  const scan = [0, 1, 2, 1];
  [0, 1, 1, 0].forEach((bob, i) => add((cv) => {
    legs(cv);
    upper(cv, { bob, core: i % 2 ? P.c : P.w, ring: i % 2 ? P.d : P.c, visor: P.c });
    const top = HIP - 18 + bob, vy = top - 11 + 5; // visor row
    for (let k = 0; k < 3; k++) cv.set(CX - 4 + scan[i] * 2 + k, vy, k === 1 ? P.w : '#8ff6ff');
  }));
  return frames;
}
