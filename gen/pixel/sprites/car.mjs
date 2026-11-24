// Chase supercar — an ORIGINAL 80s wedge supercar in that spirit (owner reference: Countach). No badge, no name,
// no exact copy: own proportions (long low wedge nose, steep raked glass, flat roof, slab rear deck, twin-post wing,
// side intake, pop-up lamp pods). Side view facing RIGHT (driving right).
// Frames are 64x64 like the robot sheet (sprites/mech.mjs) so the car->robot transform shares one sheet; the car
// sits on the bottom rows, ground contact = row FH-1. Shape is drawn from a profile, then the same passes as the
// mech run over it: right rim light (neon key light), left/top ramp shading, 1-px dark outline.
// Sheet order (grows as T2 continues): 0..1 = drive (wheel spokes turn).
import { Layer, rgb, mix, bayer } from '../px.mjs';

export const FW = 64, FH = 64;
export const FRAMES = { drive: [0, 1] };
const G = FH - 1;              // ground row
export const WHEELS = [[14, G - 4], [49, G - 4]]; // rear, front wheel centres
export const SEAT = [30, 47];                      // driver silhouette top-left inside the glass

// ---------- palette ----------
const PAINT = ['#3a0a24', '#6e1240', '#b0205a', '#e8407a', '#ffa0c0']; // magenta-red paint, dark -> light
const METAL = ['#1b1430', '#2e2350', '#4a3a7a', '#7a6ab0', '#b8aee0'];
const OUTLINE = '#05030c', RIM = '#ff3fa4', RIM2 = '#8ff6ff';
const GLASS = '#0c1a3a', GLASS2 = '#1c3f6e', CYAN = '#3ff0e6', CORE = '#ffe6f4', RED = '#ff3355', YEL = '#ffd84a';
const LIT = new Set([CYAN, CORE, RED, YEL, '#ff2e88'].map((h) => h.toLowerCase()));

class Canvas {
  constructor() { this.c = new Array(FW * FH).fill(null); }
  set(x, y, col) { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < FW && y < FH) this.c[y * FW + x] = col; }
  get(x, y) { return x >= 0 && y >= 0 && x < FW && y < FH ? this.c[y * FW + x] : null; }
}

// rim / shade / outline passes (same rules as sprites/mech.mjs finish(), for two ramps)
function finish(cv) {
  const L = new Layer(FW, FH);
  const solid = (x, y) => cv.get(x, y) !== null;
  const ramp = (col) => (PAINT.includes(col) ? PAINT : METAL.includes(col) ? METAL : null);
  for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) {
    const col = cv.get(x, y);
    if (col === null) continue;
    let c = rgb(col);
    const R = ramp(col), ri = R ? R.indexOf(col) : -1;
    if (!LIT.has(col.toLowerCase())) {
      if (!solid(x + 1, y)) c = mix(c, rgb(y % 7 < 4 ? RIM : RIM2), 0.55);
      else if (!solid(x + 2, y) && bayer(x, y) < 0.25) c = mix(c, rgb(RIM), 0.2);
      else if (!solid(x - 1, y) || (!solid(x - 2, y) && bayer(x, y) < 0.5)) c = ri > 0 ? rgb(R[ri - 1]) : mix(c, [0, 0, 0], 0.3);
      else if (!solid(x, y - 1) && ri >= 0 && ri < 4) c = rgb(R[ri + 1]);
    }
    L.px(x, y, c);
  }
  for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) {
    if (solid(x, y)) continue;
    if (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1)) L.px(x, y, OUTLINE);
  }
  return L;
}

// ---------- body profile ----------
// top edge of the body for each column x (piecewise linear), sill = bottom edge
const PROFILE = [[2, 51], [4, 50], [9, 50], [13, 49], [22, 45], [29, 45], [42, 51], [62, 55]];
const SILL = G - 3; // body bottom row between the wheels (low skirt)
function topAt(x) {
  for (let i = 0; i < PROFILE.length - 1; i++) {
    const [x0, y0] = PROFILE[i], [x1, y1] = PROFILE[i + 1];
    if (x >= x0 && x <= x1) {
      const y = Math.round(y0 + ((y1 - y0) * (x - x0)) / (x1 - x0));
      const hump = WHEELS.some(([wx]) => Math.abs(x - wx) <= 6) ? 1 : 0; // fender bulge over each wheel
      return y - hump;
    }
  }
  return null;
}
const inArch = (x, y) => WHEELS.some(([wx, wy]) => Math.hypot(x - wx, y - wy) < 5.6 && y > wy - 6);

function body(cv, { lamps = 'down', driver = true } = {}) {
  for (let x = 2; x <= 62; x++) {
    const t = topAt(x);
    const bottom = x > 57 ? SILL - 1 - Math.round((x - 57) * 0.6) : x < 4 ? SILL - 1 : SILL; // chin + tail taper
    for (let y = t; y <= bottom; y++) {
      if (inArch(x, y)) continue;
      // two-tone: upper body light paint, lower body darker below the character line
      const line = Math.round(53 + ((x - 6) * 2) / 56); // rises slightly toward the tail
      cv.set(x, y, y < line ? PAINT[2] : y === line ? PAINT[3] : PAINT[1]);
    }
  }
  // lower door: dithered shade toward the sill, neon pinstripe, rocker panel
  for (let x = 20; x <= 44; x++) {
    for (let y = 56; y <= SILL - 2; y++) if (!inArch(x, y) && bayer(x, y) < (y - 55) / 5) cv.set(x, y, PAINT[0]);
    if (!inArch(x, 57)) cv.set(x, 57, '#ff2e88');
    if (!inArch(x, SILL - 1)) cv.set(x, SILL - 1, METAL[1]);
  }
  // greenhouse: raked side glass between roof and beltline (y 46..51), x 21..42
  for (let x = 21; x <= 42; x++) {
    const t = topAt(x) + 1;
    for (let y = t; y <= 51; y++) cv.set(x, y, (x + y) % 9 === 0 ? GLASS2 : GLASS);
  }
  // driver silhouette (hoodie avatar: dark hair, cyan headphone glint, pink trim), then B-pillar + reflections
  if (driver) {
    const [hx, hy] = SEAT;
    [[1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [3, 1], [0, 2], [1, 2], [2, 2], [3, 2], [0, 3], [1, 3], [2, 3], [3, 3], [4, 3], [-1, 4], [0, 4], [1, 4], [2, 4], [3, 4], [4, 4]]
      .forEach(([dx, dy]) => cv.set(hx + dx, hy + dy, '#2a1840'));
    cv.set(hx + 3, hy + 2, '#d89a78'); cv.set(hx + 1, hy + 2, CYAN); cv.set(hx + 4, hy + 4, '#ff2e88');
  }
  for (let y = 46; y <= 51; y++) cv.set(24, y, PAINT[1]);
  for (let k = 0; k < 4; k++) cv.set(38 - k, 47 + k, CYAN);
  cv.set(39, 48, CORE);
  // engine cover louvres on the rear slope
  for (let x = 12; x <= 19; x += 2) { const t = topAt(x); cv.set(x, t + 1, METAL[0]); cv.set(x, t + 2, METAL[0]); }
  // side intake behind the door: tapered scoop with a lit inner edge + door cut line
  for (let x = 16; x <= 23; x++) for (let y = 54; y <= 55 - (x < 19 ? 1 : 0); y++) cv.set(x, y, x === 23 ? PAINT[0] : OUTLINE);
  for (let y = 52; y <= SILL - 1; y++) cv.set(42, y, PAINT[1]);
  cv.set(40, 54, METAL[4]); cv.set(41, 54, METAL[4]); // door handle
  // rear wing: two posts + plane above the deck
  for (let y = 47; y <= 49; y++) { cv.set(4, y, METAL[1]); cv.set(9, y, METAL[1]); }
  for (let x = 1; x <= 12; x++) { cv.set(x, 46, PAINT[2]); if (x < 11) cv.set(x, 47, PAINT[1]); }
  // tail lights on the rear face + exhaust tips
  for (let y = 51; y <= 53; y++) { cv.set(2, y, RED); cv.set(3, y, RED); }
  cv.set(3, SILL - 1, METAL[3]); cv.set(4, SILL - 1, METAL[3]);
  // pop-up lamp pods on the nose
  if (lamps === 'down') { for (let x = 50; x <= 55; x++) cv.set(x, topAt(x), PAINT[3]); }
  else { for (let x = 50; x <= 55; x++) for (let y = topAt(55) - 3; y < topAt(x); y++) cv.set(x, y, PAINT[2]); for (let y = topAt(55) - 2; y < topAt(55); y++) cv.set(56, y, YEL); }
  // front marker + chin splitter
  cv.set(61, 55, '#ff8a3d'); cv.set(62, 56, '#ff8a3d');
  for (let x = 54; x <= 61; x++) cv.set(x, SILL - Math.round(x > 57 ? (x - 57) * 0.6 : 0), METAL[0]);
}

function wheel(cv, [wx, wy], phase) {
  for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
    const r = Math.hypot(dx, dy);
    if (r > 4.5) continue;
    let col = r > 3.2 ? METAL[0] : r > 2.3 ? METAL[3] : METAL[1]; // tyre, rim lip, dish
    if (r <= 2.3) {
      const a = (Math.atan2(dy, dx) + Math.PI * 2 + phase) % ((Math.PI * 2) / 5);
      if (a < 0.45) col = METAL[4]; // 5 spokes
      if (r < 1) col = METAL[1];     // hub
    }
    cv.set(wx + dx, wy + dy, col);
  }
}

export function carFrames() {
  const frames = [];
  const add = (draw) => { const cv = new Canvas(); draw(cv); frames.push(finish(cv)); };
  for (const phase of [0, Math.PI / 5]) add((cv) => { body(cv); WHEELS.forEach((w) => wheel(cv, w, phase)); });
  return frames;
}
