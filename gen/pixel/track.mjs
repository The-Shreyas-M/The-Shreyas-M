// Timeline helpers for the street-chase scene (DESIGN §4a). Every actor is a sprite sheet whose FRAME and POSITION
// follow keyframes on one shared loop (LOOP s). Whole-pixel motion only: positions are rounded and each key holds
// until the next (steps(1,end)), so nothing ever lands between pixels.
import { sheet, spriteTimeline } from './sprite.mjs';

export const LOOP = 18;
const pct = (t, total) => +((t / total) * 100).toFixed(3);
const EASE = {
  linear: (u) => u,
  in: (u) => u * u,
  out: (u) => 1 - (1 - u) * (1 - u),
  inout: (u) => (u < 0.5 ? 2 * u * u : 1 - 2 * (1 - u) * (1 - u)),
};

// keys: [{ t, x, y, o }] in seconds; x / y / o carry over from the previous key when omitted (start 0, 0, 1).
// rest: { x, y, o } shown when the viewer prefers reduced motion.
export function moveCss(cls, keys, { total = LOOP, rest } = {}) {
  const ks = [...keys].sort((a, b) => a.t - b.t);
  let x = 0, y = 0, o = 1;
  const out = [];
  for (const k of ks) {
    x = k.x ?? x; y = k.y ?? y; o = k.o ?? o;
    out.push(`${pct(k.t, total)}%{transform:translate(${Math.round(x)}px,${Math.round(y)}px);opacity:${o}}`);
  }
  if (!ks.length || ks[0].t > 0) out.unshift(out[out.length - 1].replace(/^[\d.]+%/, '0%')); // wrap: loop start = loop end
  out.push(out[out.length - 1].replace(/^[\d.]+%/, '100%'));
  const r = rest ?? ks[0];
  return `.${cls}{animation:${cls}-mv ${total}s steps(1,end) infinite}@keyframes ${cls}-mv{${out.join('')}}` +
    ``;
}

// Whole-pixel stepped path from (x0, y0) at t0 to (x1, y1) at t1, sampled `fps` times a second.
// ease: linear | in | out | inout. arc: pixels of upward bulge at the middle (jumps). o: opacity for every key.
// Consecutive samples on the same pixel are dropped.
export function path(t0, t1, x0, y0, x1, y1, { fps = 20, ease = 'linear', arc = 0, o } = {}) {
  const n = Math.max(1, Math.round((t1 - t0) * fps)), keys = [];
  let last = '';
  for (let i = 0; i <= n; i++) {
    const u = i / n, e = EASE[ease](u);
    const x = Math.round(x0 + (x1 - x0) * e), y = Math.round(y0 + (y1 - y0) * e - arc * 4 * u * (1 - u));
    if (`${x},${y}` === last) continue;
    last = `${x},${y}`;
    keys.push({ t: +(t0 + (t1 - t0) * u).toFixed(3), x, y, ...(o === undefined ? {} : { o }) });
  }
  return keys;
}

// Frame-sequence builders. A seq is [[frameIndex, seconds], ...]; an actor's whole seq must sum to LOOP.
export const hold = (frame, seconds) => [[frame, seconds]];
// repeat `frames` every `dt` seconds for `seconds` (the last step is shortened so the total is exact)
export function cycle(frames, dt, seconds) {
  const seq = [];
  let t = 0, i = 0;
  while (t < seconds - 1e-6) { const d = Math.min(dt, seconds - t); seq.push([frames[i % frames.length], +d.toFixed(3)]); t += d; i++; }
  return seq;
}

// One actor: frames (Layer[] of equal size), seq (sums to LOOP), keys (moveCss keys, positions = top-left in the
// scene), rest = { frame, x, y, o } for reduced motion. Returns { svg, css }: put css inside <style>, svg in the body.
export function actor(id, frames, seq, keys, rest) {
  const total = seq.reduce((s, [, d]) => s + d, 0);
  if (Math.abs(total - LOOP) > 0.01) throw new Error(`actor ${id}: frame seq sums to ${total.toFixed(3)} s, not ${LOOP}`);
  const fw = frames[0].w, fh = frames[0].h, sh = sheet(frames);
  const fr = spriteTimeline(`${id}-fr`, fw, seq, { rest: rest.frame });
  const css = moveCss(`${id}-mv`, keys, { rest }) + fr.css;
  const svg = `<clipPath id="${id}-clip"><rect width="${fw}" height="${fh}"/></clipPath>` +
    `<g class="${id}-mv"><g clip-path="url(#${id}-clip)"><image class="${id}-fr" href="${sh.uri()}" width="${sh.w}" height="${fh}"/></g></g>`;
  return { svg, css };
}

// Parallax clock (DESIGN §4a): the street moves 2.6–9.0 s at full speed, brakes linearly to 0 over 9.0–9.4 s,
// is still until 15.6 s, moves at full speed 15.6–16.8 s, then is still. travelled(t) = fraction 0..1 of the
// loop's travel covered by time t (full speed = 1 / 7.8 per second: 6.4 s + 0.2 s braking-equivalent + 1.2 s).
export function travelled(t) {
  const v = 1 / 7.8;
  if (t <= 2.6) return 0;
  if (t <= 9.0) return (t - 2.6) * v;
  if (t <= 9.4) { const s = t - 9.0; return (6.4 + s - (s * s) / 0.8) * v; }
  if (t <= 15.6) return 6.6 * v;
  if (t <= 16.8) return (6.6 + (t - 15.6)) * v;
  return 1;
}
// Keys for a layer of repeating tiles `tile` px wide that travels `distance` px leftward per loop (distance must
// be a whole number of tiles). x = -(offset mod tile), so draw the tile at 0, tile, 2*tile … until x ≥ 400 + tile.
export function parallaxKeys(distance, tile, { fps = 20, y = 0 } = {}) {
  if (distance % tile) throw new Error(`parallax: travel ${distance} is not a whole number of ${tile}-px tiles`);
  const keys = [];
  let last = null;
  for (let i = 0; i <= LOOP * fps; i++) {
    const t = i / fps, x = -(Math.round(distance * travelled(t)) % tile);
    if (x === last) continue;
    last = x; keys.push({ t: +t.toFixed(3), x, y });
  }
  return keys;
}
