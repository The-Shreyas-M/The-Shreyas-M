# HANDOFF — The-Shreyas-M

Keep under 60 lines. Replace old content; git keeps the history.

## Owner reply 2026-11-24 — change request (recorded in DECISIONS, SPEC R3/R7/R16, TODO Sprint 2b)

- Mech → an original 80s wedge supercar (Countach spirit, no badge/exact copy) that the avatar rides; pop-up headlights → turrets that shoot cyberpsycho villains; car transforms into the robot for a boss.
- Project buildings get themed art (chip tower, Oculius eye that looks around, fast-charger power grid).
- Open questions for the owner (ask at Sprint 2b T1): building themes for ESP32-Synth, ChocoBao, NEURA, ai-video-editor, Axiom (one line each on what the project is/should look like); OK with the beat list.
- Sprint 2 is done and committed (bench-mech scene, character); its art is reused.

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

Start Sprint 2b T1 in a NEW session: write the beat list, ask the owner the open questions above.

## Gotchas found so far

- opencode/beam-free works again (2026-11-24) and did the T3 scene; opencode/big-pickle is the fallback.
- The `preview` launch config (`.claude/launch.json`, python http.server 8765) works with preview_start; starting a background server from Bash is refused.
- The built-in browser runs with reduced motion on. To see animation frames, delete the stylesheet's @media rules in the page and seek: `document.getAnimations().forEach(a=>{a.pause();a.currentTime=ms})`.
- Pixel art: whole-pixel motion only (`steps()`); embed PNG layers as data URIs; never hand-write vector illustration again (rejected). Dark navy on the night city disappears: keep sprites bright enough.
- hero.mjs writes its file when imported: copy its functions, never import it.
- GitHub strips JavaScript and blocks external resources inside SVGs, so fonts must be system or data URIs; the profile shows only if the repo The-Shreyas-M/The-Shreyas-M is PUBLIC.
- Local git identity is The-Shreyas-M (global identity is the college account): keep it.
