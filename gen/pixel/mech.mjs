// Street-chase scene (R3/R16, DESIGN §4a): 18-s loop built from actors (track.mjs) over the parallax street (street-bg.mjs).
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Layer } from './px.mjs';
import { streetBackground } from './street-bg.mjs';
import { LOOP, path, hold, cycle, actor } from './track.mjs';
import { carFrames, ANCHORS as CAR_ANCHORS } from './sprites/car.mjs';
import { mechFrames } from './sprites/mech.mjs';
import { charFrames, shootFrames, boltLayer } from './sprites/hero-char.mjs';
import { gruntFrames, bossFrames, explosionFrames } from './sprites/villains.mjs';

const CAR_Y = 91, CAR_X = 140, SIDEWALK_Y = 97, ROAD_AV_Y = 123, GRUNT_Y = 121, BOSS_Y = 97, BOSS_X = 300;

function scale2(L) {
  const out = new Layer(L.w * 2, L.h * 2);
  for (let y = 0; y < L.h; y++) for (let x = 0; x < L.w; x++) {
    const p = L.get(x, y);
    if (p && p[3] > 0) {
      const a = p[3] / 255;
      for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) out.px(x * 2 + dx, y * 2 + dy, [p[0], p[1], p[2]], a);
    }
  }
  return out;
}

// Small layers (no outline)
const muzzleFrames = [];
{
  const f0 = new Layer(6, 5);
  for (let x = 2; x <= 3; x++) f0.px(x, 0, '#ffd84a');
  for (let x = 1; x <= 4; x++) f0.px(x, 1, '#ffd84a');
  for (let x = 0; x <= 5; x++) f0.px(x, 2, '#ffd84a');
  for (let x = 1; x <= 4; x++) f0.px(x, 3, '#ffd84a');
  for (let x = 2; x <= 3; x++) f0.px(x, 4, '#ffd84a');
  f0.px(2, 2, '#ffe6f4'); f0.px(3, 2, '#ffe6f4');
  const f1 = new Layer(6, 5);
  for (let x = 2; x <= 3; x++) f1.px(x, 1, '#ff8a3d');
  for (let x = 1; x <= 4; x++) f1.px(x, 2, '#ff8a3d');
  for (let x = 2; x <= 3; x++) f1.px(x, 3, '#ff8a3d');
  muzzleFrames.push(f0, f1);
}

const tracerLayer = new Layer(6, 1);
for (let x = 0; x < 5; x++) tracerLayer.px(x, 0, '#ffd84a');
tracerLayer.px(5, 0, '#ffe6f4');

const beamFrames = [];
{
  const f0 = new Layer(126, 3);
  for (let x = 0; x < 126; x++) { f0.px(x, 0, '#3ff0e6'); f0.px(x, 2, '#3ff0e6'); f0.px(x, 1, '#8ff6ff'); }
  const f1 = new Layer(126, 3);
  for (let x = 0; x < 126; x++) { f1.px(x, 1, '#3ff0e6'); if (x % 3 !== 0) { f1.px(x, 0, '#3ff0e6', 0.5); f1.px(x, 2, '#3ff0e6', 0.5); } }
  beamFrames.push(f0, f1);
}

const glowLayer = new Layer(70, 14);
glowLayer.rect(0, 6, 4, 4, '#ff3355', 0.35);
for (let x = 0; x <= 13; x++) {
  const rows = Math.floor(x / 5);
  const alpha = 0.22 * (1 - x / 28);
  for (let y = 7 - rows; y <= 7 + rows; y++) glowLayer.px(56 + x, y, '#ffd84a', alpha);
}

// carKeys
const carKeys = [];
carKeys.push(...path(0, 1.2, -64, CAR_Y, CAR_X, CAR_Y, { ease: 'out' }));
const bob1 = [];
for (let i = 0; ; i++) {
  const t = 2.6 + i * 0.2;
  if (t > 8.8 + 1e-9) break;
  bob1.push({ t: +t.toFixed(3), y: CAR_Y - (i % 2) });
}
carKeys.push(...bob1);
carKeys.push({ t: 9.4, x: 142, y: CAR_Y }, { t: 9.45, x: 139 }, { t: 9.5, x: 141 }, { t: 9.55, x: CAR_X });
const bob2 = [];
for (let i = 0; ; i++) {
  const t = 15.4 + i * 0.2;
  if (t >= 16.4 - 1e-9) break;
  bob2.push({ t: +t.toFixed(3), y: CAR_Y - (i % 2) });
}
carKeys.push(...bob2);
carKeys.push(...path(16.4, 17.2, CAR_X, CAR_Y, 420, CAR_Y, { ease: 'in' }));
carKeys.push({ t: 17.25, x: -64, y: CAR_Y });

const glowKeysBase = carKeys.map((k) => {
  const nk = { t: k.t };
  if (Object.prototype.hasOwnProperty.call(k, 'x')) nk.x = k.x + 2;
  if (Object.prototype.hasOwnProperty.call(k, 'y')) nk.y = k.y + 45;
  if (Object.prototype.hasOwnProperty.call(k, 'o')) nk.o = k.o;
  return nk;
});

// sequences
const carSeq = [
  ...cycle([16, 17], 0.1, 1.2),
  ...hold(2, 0.1), ...hold(3, 0.1), ...hold(4, 0.1),
  ...hold(4, 0.5),
  ...hold(3, 0.15), ...hold(2, 0.15),
  ...cycle([0, 1], 0.1, 2.7),
  ...hold(5, 0.2), ...hold(6, 0.2),
  ...hold(7, 0.2),
  ...cycle([8, 9], 0.1, 3.0),
  ...hold(7, 0.2), ...hold(6, 0.2),
  ...hold(6, 0.6), ...hold(5, 0.2), ...hold(0, 0.2), // pods retract before the door opens (door frames are lamps-down)
  ...hold(2, 0.1), ...hold(3, 0.1), ...hold(4, 0.1),
  ...hold(4, 0.1),
  ...hold(10, 0.1), ...hold(11, 0.1), ...hold(12, 0.1), ...hold(13, 0.1), ...hold(14, 0.1), ...hold(15, 0.1),
  ...hold(15, 3.4),
  ...hold(15, 0.1), ...hold(14, 0.1), ...hold(13, 0.1), ...hold(12, 0.1), ...hold(11, 0.1), ...hold(10, 0.1),
  ...hold(4, 0.2), ...hold(3, 0.1), ...hold(2, 0.1),
  ...cycle([0, 1], 0.1, 2.6),
];

const robotSeq = [
  ...hold(7, 11.0),
  ...cycle([7, 8, 9, 10], 0.3, 3.4),
  ...hold(7, 3.6),
];

const glowSeq = [...hold(0, 18)];

const avFrames = [...charFrames(), ...shootFrames()];
const avSeq = [
  ...cycle([0, 1, 2, 3], 0.3, 12.4),
  ...hold(4, 0.1), ...hold(5, 0.1),
  ...cycle([0, 1, 2, 3], 0.3, 5.4),
];

const boltSeq = [...hold(0, 18)];

const g1Seq = [
  ...hold(0, 5.2),
  ...cycle([2, 3, 4, 5], 0.1, 1.6),
  ...hold(6, 0.3),
  ...hold(0, 10.9),
];
const g2Seq = [
  ...hold(0, 5.2),
  ...cycle([2, 3, 4, 5], 0.1, 3.2),
  ...hold(6, 0.2),
  ...hold(0, 9.4),
];

const SHOTS = [5.8, 6.3, 6.8, 7.4, 7.9, 8.4];
const g1x = (t) => 404 - (404 - 250) * (t - 5.2) / 1.6;
const g2x = (t) => 430 - (430 - 270) * (t - 5.2) / 3.2;

const mzSeq = [];
{
  let cursor = 0;
  for (const s of SHOTS) {
    if (s - cursor > 1e-9) mzSeq.push(...hold(1, +(s - cursor).toFixed(3)));
    mzSeq.push(...hold(0, 0.05));
    mzSeq.push(...hold(1, 0.05));
    cursor = s + 0.1;
  }
  if (18 - cursor > 1e-9) mzSeq.push(...hold(1, +(18 - cursor).toFixed(3)));
}

const trSeq = [...hold(0, 18)];

const e1Seq = [
  ...hold(0, 6.8),
  ...hold(0, 0.1), ...hold(1, 0.1), ...hold(2, 0.1), ...hold(3, 0.1), ...hold(4, 0.1),
  ...hold(4, 10.7),
];
const e2Seq = [
  ...hold(0, 8.4),
  ...hold(0, 0.1), ...hold(1, 0.1), ...hold(2, 0.1), ...hold(3, 0.1), ...hold(4, 0.1),
  ...hold(4, 9.1),
];
const e3Seq = [
  ...hold(0, 13.4),
  ...hold(0, 0.16), ...hold(1, 0.16), ...hold(2, 0.16), ...hold(3, 0.16), ...hold(4, 0.16),
  ...hold(4, 3.8),
];

const bossSeq = [
  ...hold(2, 9.0),
  ...cycle([0, 1], 0.25, 1.0),
  ...cycle([2, 3], 0.3, 1.6),
  ...hold(4, 0.2),
  ...cycle([2, 3], 0.3, 0.9),
  ...hold(4, 0.2),
  ...cycle([2, 3], 0.3, 0.3),
  ...hold(4, 0.2),
  ...hold(4, 4.6),
];

const beamSeq = [
  ...hold(0, 11.6),
  ...cycle([0, 1], 0.1, 0.2),
  ...hold(0, 1.4),
  ...cycle([0, 1], 0.1, 0.2),
  ...hold(0, 4.6),
];

// keys
const robotKeys = [{ t: 0, x: CAR_X, y: CAR_Y, o: 0 }, { t: 11.0, o: 1 }, { t: 14.4, o: 0 }];

const glowKeys = [...glowKeysBase, { t: 0, o: 0 }, { t: 2.4, o: 1 }, { t: 10.0, o: 0 }, { t: 15.4, o: 1 }, { t: 17.2, o: 0 }];

const avKeys = [
  { t: 0, x: 210, y: -40, o: 1 },
  ...path(0.5, 1.0, 210, -40, 210, SIDEWALK_Y, { fps: 12, ease: 'in' }),
  ...path(1.6, 2.0, 210, SIDEWALK_Y, 170, 95, { fps: 10, arc: 10 }),
  { t: 2.0, o: 0 },
  { t: 10.0, x: 168, y: 100, o: 1 },
  ...path(10.0, 10.4, 168, 100, 220, ROAD_AV_Y, { fps: 10, arc: 14 }),
  ...path(15.0, 15.3, 220, ROAD_AV_Y, 170, 100, { fps: 10, arc: 10 }),
  { t: 15.3, o: 0 },
  { t: 17.9, x: 210, y: -40, o: 0 },
];

const boltKeys = [
  { t: 0, x: 237, y: 137, o: 0 },
  { t: 12.45, o: 1 },
  ...path(12.45, 12.7, 237, 137, 312, 137),
  { t: 12.7, o: 0 },
];

const g1Keys = [
  { t: 0, x: 404, y: GRUNT_Y, o: 0 },
  { t: 5.2, o: 1 },
  ...path(5.2, 6.8, 404, GRUNT_Y, 250, GRUNT_Y),
  { t: 7.1, o: 0 },
];

const g2Keys = [
  { t: 0, x: 430, y: GRUNT_Y, o: 0 },
  { t: 5.2, o: 1 },
  ...path(5.2, 8.4, 430, GRUNT_Y, 270, GRUNT_Y),
  { t: 8.6, o: 0 },
];

const mzKeys = [{ t: 0, x: 169, y: 131, o: 0 }];
for (const s of SHOTS) {
  mzKeys.push({ t: s, o: 1 });
  mzKeys.push({ t: s + 0.1, o: 0 });
}

const trKeys = [{ t: 0, x: 177, y: 133, o: 0 }];
for (const s of SHOTS) {
  const targetX = (s < 7 ? g1x(s + 0.15) : g2x(s + 0.15)) + 8;
  trKeys.push({ t: s, x: 177, y: 133, o: 1 });
  trKeys.push(...path(s, s + 0.15, 177, 133, targetX, 136));
  trKeys.push({ t: s + 0.15, o: 0 });
}

const e1Keys = [{ t: 0, x: 246, y: 120, o: 0 }, { t: 6.8, o: 1 }, { t: 7.3, o: 0 }];
const e2Keys = [{ t: 0, x: 266, y: 120, o: 0 }, { t: 8.4, o: 1 }, { t: 8.9, o: 0 }];
const e3Keys = [{ t: 0, x: 292, y: 92, o: 0 }, { t: 13.4, o: 1 }, { t: 14.2, o: 0 }];

const bossKeys = [
  { t: 0, x: 404, y: BOSS_Y, o: 0 },
  { t: 9.0, o: 1 },
  ...path(9.0, 10.0, 404, BOSS_Y, BOSS_X, BOSS_Y, { fps: 10 }),
  { t: 13.6, o: 0 },
];

const beamKeys = [
  { t: 0, x: 178, y: 119, o: 0 },
  { t: 11.6, o: 1 },
  { t: 11.8, o: 0 },
  { t: 13.2, o: 1 },
  { t: 13.4, o: 0 },
];

// actors
const bg = streetBackground();

const aGlow = actor('glow', [glowLayer], glowSeq, glowKeys, { frame: 0, x: CAR_X + 2, y: CAR_Y + 45, o: 1 });
const aBoss = actor('boss', bossFrames(), bossSeq, bossKeys, { frame: 2, x: 404, y: BOSS_Y, o: 0 });
const aG1 = actor('g1', gruntFrames(0), g1Seq, g1Keys, { frame: 2, x: 330, y: GRUNT_Y, o: 1 });
const aG2 = actor('g2', gruntFrames(1), g2Seq, g2Keys, { frame: 2, x: 430, y: GRUNT_Y, o: 0 });
const aE1 = actor('e1', explosionFrames(), e1Seq, e1Keys, { frame: 0, x: 246, y: 120, o: 0 });
const aE2 = actor('e2', explosionFrames(), e2Seq, e2Keys, { frame: 0, x: 266, y: 120, o: 0 });
const aCar = actor('car', carFrames(), carSeq, [{ t: 0, o: 1 }, ...carKeys, { t: 11.0, o: 0 }, { t: 14.4, o: 1 }], { frame: 8, x: CAR_X, y: CAR_Y, o: 1 });
const aRobot = actor('robot', mechFrames(), robotSeq, robotKeys, { frame: 7, x: CAR_X, y: CAR_Y, o: 0 });
const aBeam = actor('beam', beamFrames, beamSeq, beamKeys, { frame: 0, x: 178, y: 119, o: 0 });
const aTr = actor('tr', [tracerLayer], trSeq, trKeys, { frame: 0, x: 177, y: 133, o: 0 });
const aMz = actor('mz', muzzleFrames, mzSeq, mzKeys, { frame: 0, x: 169, y: 131, o: 0 });
const aAv = actor('av', avFrames, avSeq, avKeys, { frame: 0, x: 210, y: SIDEWALK_Y, o: 0 });
const aBolt = actor('bolt', [boltLayer()], boltSeq, boltKeys, { frame: 0, x: 237, y: 137, o: 0 });
const aE3 = actor('e3', explosionFrames().map(scale2), e3Seq, e3Keys, { frame: 0, x: 292, y: 92, o: 0 });

const css = [
  'image{image-rendering:pixelated;image-rendering:crisp-edges}',
  bg.css,
  aGlow.css,
  aBoss.css,
  aG1.css,
  aG2.css,
  aE1.css,
  aE2.css,
  aCar.css,
  aRobot.css,
  aBeam.css,
  aTr.css,
  aMz.css,
  aAv.css,
  aBolt.css,
  aE3.css,
  '',
].join('');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 168" width="1000" height="420" role="img" shape-rendering="crispEdges" aria-label="Pixel-art night street chase: a hacker jumps into a wedge supercar, turrets pop out of its lamps and blast two cyberpsychos, a boss blocks the road, the car transforms into a robot and both fight side by side, then fold up and drive off">` +
  `<style>${css}</style>` +
  `<defs>${bg.defs}</defs>` +
  bg.back +
  aGlow.svg + aBoss.svg + aG1.svg + aG2.svg + aE1.svg + aE2.svg + aCar.svg + aRobot.svg + aBeam.svg + aTr.svg + aMz.svg + aAv.svg + aBolt.svg + aE3.svg +
  bg.front +
  `</svg>`;

const out = fileURLToPath(new URL('../../assets/mech.svg', import.meta.url));
writeFileSync(out, svg);
console.log('WROTE assets/mech.svg', Math.round(svg.length / 1024) + ' KB');
