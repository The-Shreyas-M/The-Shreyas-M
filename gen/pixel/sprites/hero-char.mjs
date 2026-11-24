// Owner's pixel character for the hero rooftop: a generic hacker (owner chose "generic hacker", 2026-11-24):
// dark messy hair, black hoodie with pink neon trim, headphones, a glowing handheld lighting the face.
// Faces right toward the city; wind blows from the right, so hair and hoodie trail left.
// 4 idle frames: hair + hem flutter, breathing, headphone LED blink.
import { Layer, rgb, mix } from '../px.mjs';

export const FW = 18, FH = 36;

const P = {
  h: '#2a1840', H: '#5a3486', // hair / hair highlight
  s: '#d89a78', S: '#9a5e52', // skin / skin shadow
  x: '#05030c', // eye / dark detail
  b: '#1e1436', B: '#3a2a62', // hoodie / hoodie fold light
  k: '#ff2e88', // neon trim
  m: '#7a6ab0', M: '#b8aee0', // headphone metal / highlight
  c: '#3ff0e6', w: '#e6fffd', // device glow / device hot
  p: '#141024', q: '#2a2048', // pants / pants light
  o: '#0c0818', K: '#ff3fa4', // shoe / sole
};

// frame 0; rows are 18 wide. The figure faces right.
const BASE = [
  '..................',
  '.......h.h........',
  '.....hhhhhhh......',
  '....hhHHHhhhh.....',
  '...hhhHHhhhhhh....',
  '...hhmmmmmhhhh....',
  '....hmMcmhssss....',
  '....hmccmhssxs....',
  '....hmmmmhsssss...',
  '.....hhhSsssS.....',
  '......hSSss.......',
  '.......SSs........',
  '.....bbBBbbb......',
  '....bbBBBbbbb.....',
  '....bbBBbbkbb.....',
  '...bbbBBbbkbbb....',
  '...bbbBbbbbbBb....',
  '...bbbBbbbsscc....',
  '...bbbBbbbssccw...',
  '...bbbBbbbbbBb....',
  '...bbbbbbbbbbb....',
  '...kkkkkkkkkkk....',
  '....bbbbbbbbb.....',
  '.....pppqppp......',
  '.....pppqpp.......',
  '.....ppp.qqp......',
  '.....ppp.qqp......',
  '.....ppp.qqp......',
  '.....ppp.qqp......',
  '.....qpp.qqp......',
  '.....qpp.qqp......',
  '.....ppp.qqp......',
  '....oooo.oooo.....',
  '....oooo.ooooo....',
  '....KKKK.KKKKK....',
  '..................',
];

// per-frame row patches: [row, string]
const PATCH = [
  [],
  [[1, '......h..h........'], [3, '...hhhHHHhhhh.....'], [21, '..kkkkkkkkkkkk....'], [22, '...bbbbbbbbbb.....']],
  [[1, '.....h..h.........'], [2, '....hhhhhhhh......'], [4, '..hhhhHHhhhhhh....'], [21, '.kkkkkkkkkkkkk....'], [22, '..bbbbbbbbbbb.....']],
  [[1, '......h.h.........'], [3, '...hhhHHHhhhh.....'], [21, '..kkkkkkkkkkkk....']],
];
const LED = [true, true, false, true]; // headphone cup light
const BREATH = [0, 0, 1, 1]; // upper body drops 1 px on breath out

function finish(rows) {
  const L = new Layer(FW, FH);
  const solid = (x, y) => y >= 0 && y < FH && x >= 0 && x < FW && rows[y][x] !== '.';
  for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) {
    const ch = rows[y][x]; if (ch === '.') continue;
    let c = rgb(P[ch]);
    const glows = 'kcwK'.includes(ch);
    if (!glows && !solid(x + 1, y)) c = mix(c, rgb(y < 12 && y % 4 === 0 ? '#8ff6ff' : '#ff3fa4'), 0.45); // neon rim from the right
    if (!glows && (ch === 's' || ch === 'S') && (solid(x + 1, y) && 'cw'.includes(rows[y + 1]?.[x + 1] ?? ''))) c = mix(c, rgb(P.c), 0.35); // device light on hands/face
    L.px(x, y, c);
  }
  for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) {
    if (solid(x, y)) continue;
    if (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1)) L.px(x, y, '#05030c');
  }
  return L;
}

export function charFrames() {
  return PATCH.map((patch, f) => {
    let rows = [...BASE];
    for (const [r, s] of patch) rows[r] = s;
    if (!LED[f]) rows = rows.map((r) => r.replace('mMcm', 'mMmm').replace('mccm', 'mmmm'));
    if (BREATH[f]) rows = [rows[0], ...rows.slice(0, 20)].concat(rows.slice(21)); // shift rows 0..19 down 1 (drops plain row 20, keeps the hem)
    rows.forEach((r, i) => { if (r.length !== FW) throw new Error(`hero-char frame ${f} row ${i} is ${r.length} wide`); });
    return finish(rows);
  });
}
