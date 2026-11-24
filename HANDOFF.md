# HANDOFF — The-Shreyas-M

Keep under 60 lines. Replace old content; git keeps the history.

## CHECKPOINT 2026-11-24 — Sprint 2b done (waiting for owner)

Built: car sheet (door ×3, pop-up lamps, roof turret, car→robot ×6, empty-seat drive) · avatar aim/fire frames + bolt · 2 cyberpsycho grunts, boss, explosion · the 18-s street-chase loop `assets/mech.svg` (144 KB) over a parallax street with all 7 buildings · Oculius eye now sweeps left↔right.
Please test: 1) `node gen/preview.mjs`, open `preview/index.html` in Chrome (motion ON) — watch one full 18-s loop of the second banner. 2) Beats to look for: car rolls in → you jump in → lamps flip into a turret → two grunts explode → boss walks in → car becomes the robot, you jump out → beam + blaster → boss explodes → fold, drive off. 3) Phone width: the street sprites are small at 375 px.
Need from you: a) approve car, villains, buildings, chase loop (or list changes) — recommended: approve, then Sprint 3. b) The boss hit frame tints pale pink for 0.2 s (×3) — OK, or prefer a red tint? Recommended: keep.
Next sprint (proposed): Sprint 3 as in TODO (live stats billboard, contribution city game, daily Action).

## Start line (owner pastes this to run a sprint unattended)

```
/goal Every task in the current sprint of TODO.md is ticked with evidence and the sprint's Done-when checks pass in shown output, or a CHECKPOINT or BLOCKED entry for the owner is at the top of HANDOFF.md. Stop after 40 turns.
```

**Open a new session for every sprint, on Sonnet or Opus (not the top model).** If `/goal` is not available: type `/sprint`.

## State (2026-11-24)

- Pixel-art direction (`docs/DESIGN.md` is the style law; `assets/hero.svg` the quality reference).
- Sprites: `gen/pixel/sprites/mech.mjs` (parts as string grids, mirrored, then rim/shade/outline passes; exports FW/FH/TIMELINE/ANCHORS/mechFrames) and `gen/pixel/sprites/hero-char.mjs`. Uneven frame timing uses `spriteTimeline()` in `gen/pixel/sprite.mjs`.
- Review a sprite as an upscaled PNG: `node gen/pixel/strip.mjs preview/x.png 4 6 [mech|char]`, then view the image.
- Tests: `node gen/check.mjs` → ALL ASSETS OK · Deployed: no (local only, nothing pushed).

## Next step

Owner answers the checkpoint. If approved: new session, plan Sprint 3 (TODO). Changes → change request into Sprint 2b. Scene = `gen/pixel/mech.mjs` (actors via `track.mjs`) + `street-bg.mjs`; actor positions can be checked with getComputedStyle after seeking.

## Gotchas found so far

- A worker once ran `git checkout --` on files I had edited (observation 0014): commit first; every brief says "never run git". `gen/pixel/bldg/` = one file per building so workers run in parallel safely.

- opencode/beam-free works again (2026-11-24) and did the T3 scene; opencode/big-pickle is the fallback.
- The `preview` launch config (`.claude/launch.json`, python http.server 8765) works with preview_start; starting a background server from Bash is refused.
- The built-in browser runs with reduced motion on. To see animation frames, delete the stylesheet's @media rules in the page and seek: `document.getAnimations().forEach(a=>{a.pause();a.currentTime=ms})`.
- Pixel art: whole-pixel motion only (`steps()`); embed PNG layers as data URIs; never hand-write vector illustration again (rejected). Dark navy on the night city disappears: keep sprites bright enough.
- hero.mjs writes its file when imported: copy its functions, never import it.
- GitHub strips JavaScript and blocks external resources inside SVGs, so fonts must be system or data URIs; the profile shows only if the repo The-Shreyas-M/The-Shreyas-M is PUBLIC.
- Local git identity is The-Shreyas-M (global identity is the college account): keep it.
