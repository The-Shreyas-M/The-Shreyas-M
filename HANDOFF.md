# HANDOFF — The-Shreyas-M

Keep under 60 lines. Replace old content; git keeps the history.

## Sprint 3 APPROVED 2026-11-25 — next: plan v0.4 in a new session

Owner approved the stats billboard, contribution city and daily Action (city stays honest/sparse; repo stats PUBLIC non-fork only; Action tested at v1 go-live). Skill improvement "write files first, then DONE WHEN" applied in Shreyas-AI-Skills 087731c.

## Start line (owner pastes this to run a sprint unattended)

```
/goal Every task in the current sprint of TODO.md is ticked with evidence and the sprint's Done-when checks pass in shown output, or a CHECKPOINT or BLOCKED entry for the owner is at the top of HANDOFF.md. Stop after 40 turns.
```

**Open a new session for every sprint, on Sonnet or Opus (not the top model).** If `/goal` is not available: type `/sprint`.

## State (2026-11-25)

- Pixel-art direction (`docs/DESIGN.md` is the style law; `assets/hero.svg` the quality reference).
- Sprites: `gen/pixel/sprites/mech.mjs` (parts as string grids, mirrored, then rim/shade/outline passes; exports FW/FH/TIMELINE/ANCHORS/mechFrames) and `gen/pixel/sprites/hero-char.mjs`. Uneven frame timing uses `spriteTimeline()` in `gen/pixel/sprite.mjs`.
- Review a sprite as an upscaled PNG: `node gen/pixel/strip.mjs preview/x.png 4 6 [mech|char]`, then view the image.
- Tests: `node gen/check.mjs` → ALL ASSETS OK · Deployed: no (local only, nothing pushed).

## Next step

New session (Sonnet or Opus): plan Sprint 4 = v0.4 from TODO (R7 project shop-fronts in README, R8 workbench, R9 portfolio sign + YouTube billboard, R12 phone pass), then v1.0 go-live sprint.

## Gotchas found so far

- A worker once ran `git checkout --` on files I had edited (observation 0014): commit first; every brief says "never run git". `gen/pixel/bldg/` = one file per building so workers run in parallel safely.

- opencode/beam-free works again (2026-11-24) and did the T3 scene; opencode/big-pickle is the fallback.
- The `preview` launch config (`.claude/launch.json`, python http.server 8765) works with preview_start; starting a background server from Bash is refused.
- The built-in browser runs with reduced motion on. To see animation frames, delete the stylesheet's @media rules in the page and seek: `document.getAnimations().forEach(a=>{a.pause();a.currentTime=ms})`.
- Pixel art: whole-pixel motion only (`steps()`); embed PNG layers as data URIs; never hand-write vector illustration again (rejected). Dark navy on the night city disappears: keep sprites bright enough.
- hero.mjs writes its file when imported: copy its functions, never import it.
- GitHub strips JavaScript and blocks external resources inside SVGs, so fonts must be system or data URIs; the profile shows only if the repo The-Shreyas-M/The-Shreyas-M is PUBLIC.
- Pixel font now has all digits + `%` `+`. Data layer = `gen/lib/github.mjs` (`--fixture` = gen/fixtures raw GraphQL). api.github.com sometimes times out from this machine (TLS handshake); Bash needs the sandbox off for gh/fetch.
- Local git identity is The-Shreyas-M (global identity is the college account): keep it.
