# DESIGN — "Signal Bench"

The profile is a cyberpunk hardware bench at night. Not generic hacker green: everything is made of the stuff Shreyas actually builds with — purple solder mask, copper traces, gold pads, an oscilloscope's phosphor trace — then pushed into neon with a magenta glitch channel. Code and source of truth for values: `gen/lib/theme.mjs`. Every asset uses ONLY these colours.

## 1. Palette

| Name | Hex | Role |
|---|---|---|
| `void` | `#06070F` | panel background of every SVG (sits on GitHub dark `#0d1117`; panels have 14 px radius so they read as boards, not page) |
| `mask` | `#2A1B5C` | solder-mask purple: board fills, grid lines (at 35% opacity), card backs |
| `copper` | `#E0893C` | copper traces, routing lines, wordmark strokes before power-on |
| `gold` | `#F4C454` | ENIG pads, vias, small highlights, mech joints |
| `phosphor` | `#46F5E0` | oscilloscope trace, "powered" state, main glow, terminal prompt |
| `glitch` | `#FF2E88` | glitch/RGB-split channel, warnings, mech eyes. Never body text |
| `silk` | `#ECE8F7` | silkscreen white: all readable text |
| `dim` | `#8C86A8` | secondary text, comments in the terminal (contrast on void ≥ 5:1) |

Glow = SVG filter: `feGaussianBlur stdDeviation 2.5` merged under the source, coloured by the element's own stroke. One shared filter id per file: `#glow`. Max 2 filters per SVG (glow + optional displacement for glitch) — filters are the main render cost.

## 2. Type

- SVGs served through GitHub's `<img>` proxy cannot load fonts. So:
- **Wordmark "SHREYAS"**: no font — hand-drawn as vector paths in PCB-trace letterforms: strokes only at 0°, 45°, 90°; stroke width 10 (in a 1000-wide viewBox); line caps round; corners chamfered like routed traces; each letter ends in a gold via (circle r=6). It is the one bold thing in the hero.
- **All other text**: `font-family: ui-monospace, 'Cascadia Code', 'JetBrains Mono', Menlo, Consolas, monospace` (system mono, whatever the viewer has). Sizes in a 1000-wide viewBox: 15 body, 13 small, 22 section titles, 34 big numbers. Weights 400 and 700 only.
- Sentence case everywhere. No tracked-out ALL CAPS labels, no `→` on links, no `A · B · C` meta strings. Terminal lines use a `>` or `$` prompt in `phosphor`, text in `silk`, comments in `dim` starting `//`.

## 3. Motion rules

- Each asset has ONE orchestrated moment, then holds still most of the loop: power-on (0–3 s) → hold with a quiet idle (scan line drift, LED blink, coil pulse) → loops. Loop length 10–14 s, so the page never feels like a slot machine.
- Techniques allowed: CSS `@keyframes` in a `<style>` block (preferred) and SMIL `<animate>` / `<animateTransform>` / `<animateMotion>`. No JS, no `<foreignObject>`.
- Trace drawing: `stroke-dasharray` = path length, animate `stroke-dashoffset` to 0. Glitch: 2 copies of an element in `glitch` and `phosphor` at 60% opacity, offset ±3 px with `steps()` timing for 120 ms bursts, max 2 bursts per loop.
- Easing: `cubic-bezier(.2,.8,.2,1)` for things arriving; `steps(n)` for typing and glitch; linear only for continuous scans.
- Animate only `transform`, `opacity`, `stroke-dashoffset`. Never width/height/x/y with CSS.
- **Reduced motion is mandatory in every SVG:** `@media (prefers-reduced-motion: reduce) { * { animation: none !important; } }` plus the final state drawn by default (animations start FROM hidden via keyframes, so with no animation the element shows its finished look). SMIL elements get `begin` but the static attributes must already be the final state.

## 4. Assets and layout

GitHub profile content column ≈ 830–900 px wide on desktop, ~360 px on phones. Every SVG uses `viewBox` width **1000** and is placed at `width="100%"`, so it scales; minimum readable text therefore 15 units (≈ 13 px on desktop). Centre-aligned page; text inside panels left-aligned.

```
┌──────────────────────── hero.svg 1000×420 ─────────────────────────┐
│ grid of mask lines; copper traces route in from the edges and     │
│ spell  S H R E Y A S  (trace letterforms) → vias light gold →     │
│ phosphor scope trace sweeps under it, glitch split twice           │
│ $ whoami  // typed: electronics · code · design... (bio, 3 lines)  │
└────────────────────────────────────────────────────────────────────┘
┌──────────── mech.svg 1000×520 ────────────┐
│ a flat dev board (chips, header pins) lies on the bench, then     │
│ UNFOLDS: chips rotate up into head + chest, header-pin strips      │
│ become arms/legs, the chest reveals a glowing toroidal transformer │
│ coil (phosphor), eyes flash glitch-pink. Idle: coil pulse, blink.  │
│ After 9 s it folds back into the board. Loop 14 s.                 │
└────────────────────────────────────────────────────────────────────┘
 stats.svg (generated)  |  projects/*.svg cards  |  hardware-loop.webp
 contrib-game.svg (generated): grid cells = solder pads; the mech's
 drone flies the rows and zaps cells, pads flash gold then copper.
 footer: portfolio "board connector" button + YouTube badge
```

## 5. The mech (R3) — original design brief

- Name in files: `bench-mech`. NOT based on any existing franchise robot; no faction logos, no car/truck shapes. Its alt mode is a **dev board**, which is the whole joke: an electronics board that transforms, with an electrical *transformer* in its heart.
- Parts as named groups so later assets can reuse them: `#head` (QFN chip, two glitch-pink LED eyes, antenna = header pin), `#chest` (board panel with `#coil`: a torus drawn as an ellipse ring with 8–12 copper windings), `#armL #armR` (header-pin strips, gold tips), `#legL #legR` (heatsink fins), `#shoulderL #shoulderR` (capacitors).
- Silhouette: chunky, wide shoulders, short legs, head small — reads at 360 px width.
- Colours: body `mask` fill with `copper` 3 px outlines, joints `gold`, coil `phosphor` glow, eyes `glitch`.

## 6. Accessibility

- Every README image has meaningful `alt` text. Links wrap images (`<a href><img></a>`).
- Text contrast on `void`: `silk` 16:1, `dim` ≥ 5:1, `phosphor` 13:1. Pink is never used for text below 22 units.
- No strobing: nothing flashes more than 3 times per second.
