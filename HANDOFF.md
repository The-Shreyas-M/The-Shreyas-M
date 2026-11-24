# HANDOFF — The-Shreyas-M

Keep under 60 lines. Replace old content; git keeps the history.

## CHECKPOINT 2026-11-24 — Sprint 2

Built:
- Bench-mech: an original pixel mech that unfolds from a dev board (11 frames), in a rainy rooftop workshop (`assets/mech.svg`, 87 KB): board 2 s → unfold → idle 7 s (coil pulse, visor scan) → fold, with sparks and steam.
- Your character ("generic hacker": hoodie with pink trim, headphones, glowing handheld, wind idle) on a ledge in the hero.
- Checks: `node gen/check.mjs` → ALL ASSETS OK; `node gen/pixel/hero.mjs && node gen/pixel/mech.mjs` regenerate both.

Please test:
1. `node gen/preview.mjs`, then open `preview/index.html` (or run the `preview` launch config, port 8765). Expected: hero with the character bottom-left, mech scene below, both animating.
2. Watch one 11-second mech loop: the board on the bench lights up, unfolds into the mech, idles, then folds back.

Need from you:
- Does the mech scene pass, or is it "toy"? My own fix list (recommended next): brighter floor with real puddle reflections; a thicker lamp arm and a lamp head closer to the mech; the character is tiny on phones (could go to ~40 px tall).
- Is the character OK as a generic hacker, or do you want your own likeness later?

Next sprint (proposed): Sprint 3 as planned in TODO (stats billboard, contribution city game, daily Action), plus the fix list above if you want it.

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

Owner verdict on the Sprint 2 checkpoint, then apply their fix list or plan Sprint 3.

## Gotchas found so far

- opencode/beam-free works again (2026-11-24) and did the T3 scene; opencode/big-pickle is the fallback.
- The `preview` launch config (`.claude/launch.json`, python http.server 8765) works with preview_start; starting a background server from Bash is refused.
- The built-in browser runs with reduced motion on. To see animation frames, delete the stylesheet's @media rules in the page and seek: `document.getAnimations().forEach(a=>{a.pause();a.currentTime=ms})`.
- Pixel art: whole-pixel motion only (`steps()`); embed PNG layers as data URIs; never hand-write vector illustration again (rejected). Dark navy on the night city disappears: keep sprites bright enough.
- hero.mjs writes its file when imported: copy its functions, never import it.
- GitHub strips JavaScript and blocks external resources inside SVGs, so fonts must be system or data URIs; the profile shows only if the repo The-Shreyas-M/The-Shreyas-M is PUBLIC.
- Local git identity is The-Shreyas-M (global identity is the college account): keep it.
