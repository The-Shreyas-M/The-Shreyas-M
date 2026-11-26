# HANDOFF — The-Shreyas-M

Keep under 60 lines. Replace old content; git keeps the history.

## CHECKPOINT 2026-11-26 — Sprint 4 (v0.4 full page)
Built: workbench scene `assets/bench.svg` (R8) · ENTER PORTFOLIO + YouTube neon signs (R9) · README in demo order with 7 linked buildings in 4+3 rows (R7, R12)
Please test: 1. `node gen/preview.mjs`, start the `preview` launch config, open /preview/index.html → hero, chase, stats, 7 buildings, bench, city, two signs. 2. Click a building → its repo; the signs → iamshreyas.pages.dev and YouTube. 3. Narrow the window to phone width → buildings stay 4+3, no sideways scroll.
Need from you: (a) Bench: approve, or say what to change (rec: approve; the lamp head can be reshaped later). (b) On a phone the building labels and the hero tagline are tiny (images ~67 px wide). OK as is, since the alt text names each project, or do you want a phone-only layout? (rec: OK for v1)
Next sprint (proposed): v1.0 go-live. Create PUBLIC repo The-Shreyas-M/The-Shreyas-M via gitcp, push main, first Action run, live check on github.com at desktop and phone widths.
Skill improvements — need your OK: none new.

## Start line (owner pastes this to run a sprint unattended)

```
/goal Every task in the current sprint of TODO.md is ticked with evidence and the sprint's Done-when checks pass in shown output, or a CHECKPOINT or BLOCKED entry for the owner is at the top of HANDOFF.md. Stop after 40 turns.
```

**Open a new session for every sprint, on Sonnet or Opus (not the top model).** If `/goal` is not available: type `/sprint`.

## State (2026-11-26)

- Sprint 4 done, waiting on owner. New generators: `gen/pixel/bench.mjs`, `gen/pixel/footer.mjs` (both run directly, print BOX/TEXT lines).

- Pixel-art direction (`docs/DESIGN.md` is the style law; `assets/hero.svg` the quality reference).
- Sprites: `gen/pixel/sprites/mech.mjs` (parts as string grids, mirrored, then rim/shade/outline passes; exports FW/FH/TIMELINE/ANCHORS/mechFrames) and `gen/pixel/sprites/hero-char.mjs`. Uneven frame timing uses `spriteTimeline()` in `gen/pixel/sprite.mjs`.
- Review a sprite as an upscaled PNG: `node gen/pixel/strip.mjs preview/x.png 4 6 [mech|char]`, then view the image.
- Tests: `node gen/check.mjs` → ALL ASSETS OK · Deployed: no (local only, nothing pushed).

## Next step

Owner answers the Sprint 4 checkpoint → new session (Sonnet or Opus) plans the v1.0 go-live sprint (pushing and making the repo public is itself an owner checkpoint).

## Gotchas found so far

- A worker once ran `git checkout --` on files I had edited (observation 0014): commit first; every brief says "never run git". `gen/pixel/bldg/` = one file per building so workers run in parallel safely.

- opencode/beam-free works again (2026-11-24) and did the T3 scene; opencode/big-pickle is the fallback.
- The `preview` launch config (`.claude/launch.json`, python http.server 8765) works with preview_start; starting a background server from Bash is refused.
- The built-in browser runs with reduced motion on. To see animation frames, delete the stylesheet's @media rules in the page and seek: `document.getAnimations().forEach(a=>{a.pause();a.currentTime=ms})`.
- Pixel art: whole-pixel motion only (`steps()`); embed PNG layers as data URIs; never hand-write vector illustration again (rejected). Dark navy on the night city disappears: keep sprites bright enough.
- hero.mjs writes its file when imported: copy its functions, never import it.
- GitHub strips JavaScript and blocks external resources inside SVGs, so fonts must be system or data URIs; the profile shows only if the repo The-Shreyas-M/The-Shreyas-M is PUBLIC.
- Pixel font now has all digits + `%` `+`. Data layer = `gen/lib/github.mjs` (`--fixture` = gen/fixtures raw GraphQL). api.github.com sometimes times out from this machine (TLS handshake); Bash needs the sandbox off for gh/fetch.
- Neon helper in footer.mjs paints a white core on interior pixels: pass core = tube colour for FILLED shapes. The browser caches SVGs in preview: add `?v=` to img src after regenerating.
- Local git identity is The-Shreyas-M (global identity is the college account): keep it.
