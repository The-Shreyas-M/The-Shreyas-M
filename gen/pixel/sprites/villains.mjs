// Cyberpsycho villains (R16; DESIGN §4a B3/B4/B6). ORIGINAL designs:
//   grunt = a hunched street punk with a chrome cyber-arm ending in a cyan mantis blade, a red optic in a metal jaw,
//           a spiked shoulder plate and a hot mohawk (2 colour variants);
//   boss  = a hulking brute with a cannon forearm, glowing spine cables and a twin optic.
// All face LEFT (they come in from the right). Key light from the RIGHT (rim on right edges), ramp shading toward the
// left/top, 1-px dark outline — the same passes as sprites/mech.mjs. Explosions are orange fireballs, never white.
import { Layer, rgb, mix, bayer, rng } from '../px.mjs';

const METAL = ['#1b1430', '#2e2350', '#4a3a7a', '#7a6ab0', '#b8aee0'];
const JACKET = ['#1e1436', '#3a2a62', '#5a3486', '#7a6ab0'];          // grunt 1 (purple)
const RED_J = ['#3a0a24', '#6e1240', '#b0205a', '#e8407a'];           // grunt 0 (red, the car paint ramp)
const BOSS_J = ['#3d0f5e', '#661466', '#9c1d6c', '#c8306f'];          // boss (magenta, the sky ramp)
const SKIN = ['#5a3a4a', '#8a5a62', '#b98078'];
const OUTLINE = '#05030c', RIM = '#ff3fa4', RIM2 = '#8ff6ff';
const RED = '#ff3355', YEL = '#ffd84a', ORA = '#ff8a3d', CYAN = '#3ff0e6', CORE = '#ffe6f4', PINK = '#ff2e88';
const LIT = new Set([RED, YEL, ORA, CYAN, CORE, PINK]);
const RAMPS = [METAL, JACKET, RED_J, BOSS_J, SKIN];

class Canvas {
  constructor(w, h) { this.w = w; this.h = h; this.c = new Array(w * h).fill(null); }
  set(x, y, col) { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.c[y * this.w + x] = col; }
  get(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h ? this.c[y * this.w + x] : null; }
  rect(x, y, w, h, col) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, col); }
  // thick line: a w×w square stamped along the segment
  line(x0, y0, x1, y1, col, w = 1) {
    const n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
    for (let i = 0; i <= n; i++) {
      const x = Math.round(x0 + ((x1 - x0) * i) / n), y = Math.round(y0 + ((y1 - y0) * i) / n);
      this.rect(x - (w >> 1), y - (w >> 1), w, w, col);
    }
  }
  ellipse(cx, cy, rx, ry, col) {
    for (let y = Math.floor(cy - ry); y <= cy + ry; y++) for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
      const dx = (x - cx) / rx, dy = (y - cy) / ry;
      if (dx * dx + dy * dy <= 1) this.set(x, y, col);
    }
  }
}

// rim / shade / outline passes; tint = [hex, amount] mixes every pixel toward a colour (hit frames)
function finish(cv, tint = null) {
  const L = new Layer(cv.w, cv.h);
  const solid = (x, y) => cv.get(x, y) !== null;
  for (let y = 0; y < cv.h; y++) for (let x = 0; x < cv.w; x++) {
    const col = cv.get(x, y);
    if (col === null) continue;
    let c = rgb(col);
    if (!LIT.has(col)) {
      const R = RAMPS.find((r) => r.includes(col)), ri = R ? R.indexOf(col) : -1;
      if (!solid(x + 1, y)) c = mix(c, rgb(y % 7 < 4 ? RIM : RIM2), 0.55);
      else if (!solid(x + 2, y) && bayer(x, y) < 0.25) c = mix(c, rgb(RIM), 0.2);
      else if (!solid(x - 1, y) || (!solid(x - 2, y) && bayer(x, y) < 0.5)) c = ri > 0 ? rgb(R[ri - 1]) : mix(c, [0, 0, 0], 0.3);
      else if (!solid(x, y - 1) && ri >= 0 && ri < R.length - 1) c = rgb(R[ri + 1]);
    }
    if (tint) c = mix(c, rgb(tint[0]), tint[1]);
    L.px(x, y, c);
  }
  for (let y = 0; y < cv.h; y++) for (let x = 0; x < cv.w; x++) {
    if (solid(x, y)) continue;
    if (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1)) L.px(x, y, tint ? mix(rgb(OUTLINE), rgb(tint[0]), tint[1] * 0.5) : OUTLINE);
  }
  return L;
}

// ======================= GRUNT (24 x 32, ground row 31) =======================
export const GRUNT = { FW: 24, FH: 32, FRAMES: { idle: [0, 1], run: [2, 3, 4, 5], hit: [6] }, ANCHORS: { blade: [1, 14], chest: [12, 15] } };
const GV = [ // two colour variants
  { hawk: ORA, trim: YEL, J: RED_J },
  { hawk: PINK, trim: YEL, J: JACKET },
];

// leg: hip -> knee -> foot; k = knee x offset, f = foot x offset, fy = foot row (lifted when < 30)
function gruntLeg(cv, hx, hy, { k, f, fy = 30 }, col) {
  const kx = hx + k, ky = hy + 6;
  cv.line(hx, hy, kx, ky, col, 2);
  cv.line(kx, ky, hx + f, fy - 1, col, 2);
  cv.rect(hx + f - 2, fy, 4, 1, METAL[1]); cv.rect(hx + f - 2, fy - 1, 3, 1, METAL[2]); // boot
}

function grunt(v, { legs, arm = 0, bob = 0, lean = 0, glint = false }) {
  const cv = new Canvas(24, 32), V = GV[v], J = V.J;
  const hy = 19 + bob, hx = 12 + lean;
  gruntLeg(cv, hx + 1, hy, legs[1], J[0]);                 // back leg (darker)
  cv.line(hx + 2, 12 + bob, hx + 4 - arm, 18 + bob, SKIN[0], 2); // back arm swings opposite the blade arm
  // hunched torso: wider at the shoulders, leaning forward (left)
  for (let y = 10 + bob; y <= hy; y++) {
    const t = (y - 10 - bob) / (hy - 10 - bob), x0 = Math.round(hx - 5 + t * 2), x1 = Math.round(hx + 3);
    for (let x = x0; x <= x1; x++) cv.set(x, y, (x + y) % 5 === 0 ? J[2] : J[1]);
  }
  for (let y = 12 + bob; y <= hy - 1; y++) cv.set(hx - 2, y, V.trim);   // jacket zip trim
  cv.set(hx, 15 + bob, RED); cv.set(hx + 1, 15 + bob, RED);           // chest implant
  // spiked shoulder plate on the back shoulder
  cv.rect(hx + 1, 10 + bob, 4, 2, METAL[2]); cv.set(hx + 3, 9 + bob, METAL[4]);
  gruntLeg(cv, hx - 1, hy, legs[0], J[1]);                 // front leg
  cv.rect(hx - 5, hy - 1, 9, 2, METAL[1]);                         // belt
  // head pushed forward on the hunch
  const gx = hx - 6, gy = 4 + bob;
  cv.ellipse(gx + 3, gy + 3, 3, 3.4, SKIN[2]);
  cv.rect(gx, gy + 4, 4, 2, METAL[2]); cv.set(gx + 1, gy + 5, METAL[3]); // metal jaw
  cv.set(gx, gy + 2, RED); cv.set(gx + 1, gy + 2, RED);                  // optic
  for (let i = 0; i < 3; i++) cv.line(gx + 2 + i, gy, gx + 3 + i, gy - 2 - (i % 2), V.hawk); // short mohawk fin on top of the skull
  // chrome cyber-arm with a mantis blade, reaching forward
  const sx = hx - 4, sy = 11 + bob, ex = sx - 3, ey = sy + 5 - arm, wx = ex - 3, wy = ey - 1 - arm;
  cv.line(sx, sy, ex, ey, METAL[3], 2);
  cv.line(ex, ey, wx, wy, METAL[2], 2);
  cv.line(wx - 1, wy, wx - 4, wy - 2, glint ? CORE : CYAN, 1);
  return cv;
}

export function gruntFrames(variant = 0) {
  const stand = [{ k: -1, f: -2 }, { k: 1, f: 2 }];
  const run = [
    [{ k: -4, f: -5 }, { k: 2, f: 5, fy: 28 }],
    [{ k: -2, f: -1 }, { k: -2, f: 2, fy: 26 }],
    [{ k: 2, f: 5, fy: 28 }, { k: -4, f: -5 }],
    [{ k: -2, f: 2, fy: 26 }, { k: -2, f: -1 }],
  ];
  return [
    finish(grunt(variant, { legs: stand, bob: 0 })),
    finish(grunt(variant, { legs: stand, bob: 1, glint: true })),
    ...run.map((legs, i) => finish(grunt(variant, { legs, bob: i % 2 ? 0 : 1, arm: i < 2 ? 1 : -1 }))),
    finish(grunt(variant, { legs: [{ k: 0, f: 1 }, { k: 3, f: 5, fy: 29 }], lean: 3, bob: -1, arm: -2 }), [CORE, 0.4]),
  ];
}

// ======================= BOSS (48 x 56, ground row 55) =======================
export const BOSS = { FW: 48, FH: 56, FRAMES: { walk: [0, 1], idle: [2, 3], hit: [4] }, ANCHORS: { cannon: [1, 31], chest: [26, 30] } };

function boss({ legs, bob = 0, lean = 0, charge = false }) {
  const cv = new Canvas(48, 56);
  const hx = 26 + lean, hy = 36 + bob;
  const leg = (x, { k, f, fy = 54 }, col) => {
    const kx = x + k, ky = hy + 9;
    cv.line(x, hy, kx, ky, col, 5); cv.line(kx, ky, x + f, fy - 2, col, 4);
    cv.rect(kx - 2, ky - 1, 4, 3, METAL[3]);                                  // knee guard
    cv.rect(x + f - 4, fy - 2, 8, 2, METAL[2]); cv.rect(x + f - 4, fy, 8, 1, METAL[1]); // stomper boot
  };
  leg(hx + 4, legs[1], BOSS_J[0]);
  // back fist (huge, hanging)
  cv.line(hx + 8, 20 + bob, hx + 11, 32 + bob, METAL[2], 4); cv.ellipse(hx + 11, 35 + bob, 3, 3, METAL[3]);
  // barrel torso with armour plates
  cv.ellipse(hx, 27 + bob, 11, 11, BOSS_J[1]);
  for (let y = 18 + bob; y <= 36 + bob; y += 4) for (let x = hx - 9; x <= hx + 9; x++) if (cv.get(x, y) === BOSS_J[1]) cv.set(x, y, BOSS_J[2]);
  cv.rect(hx - 4, 24 + bob, 7, 7, METAL[2]); cv.rect(hx - 2, 26 + bob, 3, 3, charge ? YEL : RED); // reactor plate
  // spine cables (glowing) arching over the back
  for (let i = 0; i < 3; i++) cv.line(hx + 6 + i * 2, 15 + bob, hx + 10 + i, 24 + bob + i * 2, i === 1 ? PINK : ORA, 1);
  cv.rect(hx - 10, hy - 1, 21, 3, METAL[1]);                                    // armoured belt
  leg(hx - 4, legs[0], BOSS_J[1]);
  // small head sunk between the shoulders
  const gx = hx - 12, gy = 12 + bob;
  cv.ellipse(gx + 4, gy + 4, 4, 4.4, SKIN[2]);
  cv.rect(gx, gy + 5, 6, 3, METAL[3]);
  cv.set(gx, gy + 3, RED); cv.set(gx + 1, gy + 3, RED); cv.set(gx + 3, gy + 3, RED);
  for (let i = 0; i < 5; i++) cv.line(gx + 2 + i, gy + 1, gx + 5 + i, gy - 3 - (i % 2), ORA); // swept fin
  // shoulder plate + cannon forearm aimed left
  cv.ellipse(hx - 9, 19 + bob, 5, 4, METAL[3]);
  cv.line(hx - 10, 21 + bob, hx - 14, 28 + bob, METAL[2], 4);
  cv.line(hx - 14, 30 + bob, hx - 24, 30 + bob, METAL[2], 5);
  for (let x = hx - 22; x <= hx - 15; x += 3) cv.line(x, 28 + bob, x, 32 + bob, METAL[1]);   // cooling rings
  cv.rect(hx - 25, 29 + bob, 2, 3, charge ? YEL : RED);                                       // muzzle glow
  return cv;
}

export function bossFrames() {
  const stand = [{ k: -2, f: -3 }, { k: 2, f: 3 }];
  return [
    finish(boss({ legs: [{ k: -5, f: -6 }, { k: 3, f: 5, fy: 52 }], bob: 0 })),
    finish(boss({ legs: [{ k: 3, f: 5, fy: 52 }, { k: -5, f: -6 }], bob: 1 })),
    finish(boss({ legs: stand, bob: 0 })),
    finish(boss({ legs: stand, bob: 1, charge: true })),
    finish(boss({ legs: [{ k: 0, f: 1 }, { k: 4, f: 6, fy: 53 }], lean: 4, bob: -1 }), [CORE, 0.4]),
  ];
}

// ======================= EXPLOSION (32 x 32 x 5) =======================
export const EXPLO = { FW: 32, FH: 32 };
export function explosionFrames() {
  const R = rng(7), puffs = Array.from({ length: 7 }, (_, i) => ({ a: (i / 7) * Math.PI * 2 + R() * 0.5, d: 0.55 + R() * 0.3 }));
  const debris = Array.from({ length: 8 }, () => ({ a: R() * Math.PI * 2, v: 0.7 + R() * 0.5 }));
  const stages = [
    { r: 5, hot: 1 }, { r: 9, hot: 0.7 }, { r: 12, hot: 0.4 }, { r: 13, hot: 0.15, smoke: 0.4 }, { r: 14, hot: 0, smoke: 0.8 },
  ];
  return stages.map(({ r, hot, smoke = 0 }, f) => {
    const L = new Layer(32, 32);
    for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) {
      let d = Math.hypot(x - 15.5, y - 15.5) / r;
      for (const p of puffs) d = Math.min(d, Math.hypot(x - 15.5 - Math.cos(p.a) * r * p.d, y - 15.5 - Math.sin(p.a) * r * p.d) / (r * 0.45));
      if (d > 1) continue;
      const b = bayer(x, y) * 0.25;
      let col;
      if (smoke && d + b > 1 - smoke) col = d + b > 1 - smoke * 0.4 ? '#230b4f' : '#3d0f5e';
      else if (d + b < hot * 0.45) col = YEL;
      else if (d + b < 0.35 + hot * 0.4) col = ORA;
      else col = smoke ? '#661466' : RED;
      L.px(x, y, col);
    }
    for (const p of debris) { // flying pixel debris
      const t = (f + 1) * 3 * p.v, x = Math.round(15.5 + Math.cos(p.a) * (r + t)), y = Math.round(15.5 + Math.sin(p.a) * (r + t) + f * f * 0.3);
      if (x >= 0 && y >= 0 && x < 32 && y < 32 && f > 0) L.px(x, y, f < 3 ? YEL : METAL[3]);
    }
    return L;
  });
}
