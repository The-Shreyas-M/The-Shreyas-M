# TODO — The-Shreyas-M (GitHub profile README)

Rules: top to bottom. Every task cites an R-id and has a check. Tick with one line of evidence.
Every task carries a tag: `[oc]` = a free model via `opencode run` writes it (the default), `[me]` = orchestrator, `[tool]` = orchestrator with its own tool (browser, image viewing). See `docs/WORKFLOW.md` → Routing.
Only the current and next sprint are detailed; the rest are milestones.

## Sprint 1 — hero banner + transformer mech visible in a local GitHub-style preview  ✔ done 2026-11-23

- [x] T1 [me] (R1) Load `frontend-design` + `ui-ux-pro-max`; write `docs/DESIGN.md` (palette hex list, type stack, motion rules, glitch/scanline recipes, reduced-motion rule) and mirror it in `gen/lib/theme.mjs` — check: `node -e "import('./gen/lib/theme.mjs').then(m=>console.log(Object.keys(m.palette).length))"` prints ≥ 6  ✔ DESIGN.md "Signal Bench" + theme.mjs (8 colours)
- [x] T2 [oc] (R10) `gen/check.mjs`: scan `assets/**/*.svg` + `dist/*.svg`, fail on `<script`, `href="http`, `url(http`, `@import`, file > 1 MB, missing `prefers-reduced-motion`; print `ALL ASSETS OK` — check: `node gen/check.mjs` on a bad fixture fails, on good passes  ✔ good fixture OK, bad fixture 3 PROBLEMS exit 1
- [x] T3 [oc] (R11) `gen/preview.mjs`: render `README.md` via `gh api markdown` (mode gfm, context The-Shreyas-M/The-Shreyas-M) into `preview/index.html` with GitHub dark CSS, rewriting `output`-branch URLs to local `dist/` and `assets/` paths — check: `node gen/preview.mjs` writes the file, opens in browser  ✔ src rewrites to ../assets and ../dist verified
- [x] T4 [oc] (R2) `assets/hero.svg` from DESIGN.md: boot sequence, glitching SHREYAS, typed tagline, scanlines, loop — check: `node gen/check.mjs` OK + [tool] screenshot reviewed by me  ✔ check OK; frames reviewed, glitch colours + cursor fixed by me
- [x] T5 [oc] (R3) `assets/mech.svg`: original transformer-style mech, parts fly in and lock, idle breathing, loop; parts as named `<g>` ids — check: `node gen/check.mjs` OK + [tool] screenshot frames reviewed by me  ✔ check OK; v2 armour/shockwave/traces, scale fixed to 1.15
- [x] T6 [oc] (R12) First `README.md` skeleton with hero + mech in the demo order, placeholders for later sections — check: `node gen/preview.mjs` shows both animating  ✔ README with hero + mech, preview renders
- [x] T7 [tool] (R2,R3) Review in browser preview at 1280 px and 390 px; fix list → rerun T4/T5 briefs — check: owner checkpoint  ✔ reviewed at 1280/375 px; mobile hero text too small → R12 (v0.3)

**Done when:**
- `node gen/check.mjs` prints `ALL ASSETS OK`
- `preview/index.html` shows hero + mech animating in GitHub dark styling; owner says it looks insane (checkpoint)


## Sprint 1b — pixel-art direction (change request 2026-11-23)  ✔ done

- [x] T1 [me] (R1,R2) Owner rejected vector look; built `gen/pixel/px.mjs` + `gen/pixel/hero.mjs` → `assets/hero.svg` pixel city  ✔ owner: "Yes, build on it"
- [x] T2 [me] (R1) DESIGN.md rewritten for pixel art; SPEC R-table restyled  ✔ docs updated

## Sprint 2 — pixel bench-mech scene + owner character  ✔ done 2026-11-24

Quality bar: DESIGN.md §5. Compare every frame to `assets/hero.svg` before ticking. Old vector `assets/mech.svg` gets replaced.

- [x] T1 [oc] (R1) `gen/pixel/sprite.mjs`: `parseSprite(rows, paletteMap)` → Layer, `sheet(frames)` → one Layer with frames side by side, `spriteSvg(sheetUri, fw, fh, frames, x, y, cls)` → `<svg>`/`<g>` snippet using a clipPath + `steps(frames)` CSS frame animation. Copy patterns from `px.mjs` — check: `node -e` builds a 2-frame test sprite and prints the snippet; `node gen/check.mjs` OK on a test SVG  ✔ 2-frame test prints w=4 h=2 + snippet; test SVG → ALL ASSETS OK (big-pickle)
- [x] T2 [me] (R3) Author the bench-mech sprites in `gen/pixel/sprites/mech.mjs` (~56 px tall, DESIGN §2 metal ramp, 1-px outline, right rim light, dithered shading): frame list = board (1), unfold (6), robot idle (4), with coil glow and visor colours. Review each frame zoomed in the browser — check: screenshot of the frame strip reviewed against hero quality  ✔ 11 frames (parts grids + rim/outline passes); strip `node gen/pixel/strip.mjs` reviewed, torso/head reworked once
- [x] T3 [oc] (R3) `gen/pixel/mech.mjs` → `assets/mech.svg` 400×168: rooftop workshop at night reusing hero.mjs sky/far/mid functions (copy, don't import side effects), workbench with tools and a lamp cone, rain, the mech timeline (board 2 s → unfold 1 s → idle 7 s → fold 1 s → board), steam puffs, sparks on power-on — check: `node gen/check.mjs` OK + [tool] frame review  ✔ beam-free x2 + my fixes; 87 KB, ALL ASSETS OK; frames at 1.7/2.4/4.0 s reviewed in browser
- [x] T4 [me] (R13) Ask owner for character look (hair, glasses, clothes) at the start of the sprint; author a ~32-px character sprite (idle 4 frames, coat/hair wind) in `gen/pixel/sprites/hero-char.mjs` and add it to the hero near rooftop — check: hero frame review  ✔ owner chose "generic hacker"; hoodie/headphones/handheld, 4-frame wind idle on a static ledge, check OK
- [x] T5 [tool] (R3,R13,R12) Review hero + mech at 1280 px and 375 px; fix list → rerun — check: owner checkpoint  ✔ reviewed 1280/375 px; owner reply 2026-11-24 = change request (Sprint 2b)

**Done when:**
- `node gen/check.mjs` prints `ALL ASSETS OK`; `node gen/pixel/hero.mjs && node gen/pixel/mech.mjs` regenerate both
- Owner approves the mech scene and the character (checkpoint)

## Sprint 2b — supercar chase + project buildings (change request 2026-11-24)  ← current

Reuse: px.mjs, sprite.mjs (spriteTimeline), sprites/hero-char.mjs (avatar), sprites/mech.mjs (robot frames), strip.mjs. Review every sprite composited in its scene (observation: contact sheets lie).

- [x] T1 [me] (R3) Storyboard the loop as a timed beat list (seconds per beat, which sprite/frames, camera/parallax) in `docs/DESIGN.md` §4; owner OKs it  ✔ DESIGN §4a/§4b; owner OK 2026-11-24 (beats + 7 themes)
- [x] T2 [me] (R3) Supercar sprite `gen/pixel/sprites/car.mjs`: side view ~64×20, drive (wheel 2 frames), scissor door open, headlights up + turret out, transform frames car→robot (reuse robot parts) — check: strip + in-scene review  ✔ 16 frames (drive 2, door 3, lamps 2, armed 3, transform 6 ending on robot idle f0); `strip.mjs … car` + `street-preview.mjs` lists reviewed in-scene
- [x] T2b [me] (R3,R13) Avatar shoot frames ×2 (handheld raised as a blaster) + bolt sprite in `sprites/hero-char.mjs` — owner change 2026-11-24: avatar fights beside the robot — check: strip + in-scene review  ✔ shootFrames() aim/fire + boltLayer() 4×2 + MUZZLE; composited beside robot idle (.oc/fight-comp.mjs → preview/fight-comp.png) reviewed
- [x] T4b [me] (R7) Oculius eye: owner wants a clear left↔right look-around — replace the 4-pose jump with a sweep (pupil steps 2 px per frame from x 26 to 46 and back, plus glances up; ~10 frames, period 6 s) in `gen/pixel/bldg/oculius.mjs` — check: buildings.mjs + check.mjs OK, eye watched animating in the browser  ✔ 14 frames (x 26→46 step 2 + 3 up-glances), period 6.0 s; ALL ASSETS OK; seeked 1.0/2.0/3.5/4.8 s in browser = centre/right/left/up (tiny edit, done by me)
- [x] T3 [me] (R16) Cyberpsycho sprites `gen/pixel/sprites/villains.mjs`: 2 grunts (idle/run/hit/explode) + boss — check: strip review  ✔ gruntFrames(0|1) idle2/run4/hit1 (24×32), bossFrames() walk2/idle2/hit1 (48×56), explosionFrames() ×5 (32×32, orange, no white); composites preview/villains-a/b/c.png + grunt-zoom reviewed, heads/colours reworked once
- [x] T4 [oc] (R7) Building generator `gen/pixel/buildings.mjs` → `assets/projects/<name>.svg`: chip tower, Oculius eye tower (pupil looks around), power-grid substation (arcs) first — check: check.mjs OK + review  ✔ all 7 (registry + gen/pixel/bldg/*.mjs, beam-free ×7); ALL ASSETS OK (9 files), 4–5 KB each; row composite reviewed
- [x] T5 [oc] (R3) Rewrite `gen/pixel/mech.mjs` as the street-chase scene per the T1 beat list (turret muzzle flashes ≤3/s, explosions, transform) — check: check.mjs OK, beats sampled in browser  ✔ track.mjs (me) + street-bg.mjs and mech.mjs (beam-free, 1st try each); 144 KB, ALL ASSETS OK; positions read via getComputedStyle; beats seeked at 1.8/5.85/6.9/9.8/10.65/12.55/13.3/13.8/15.1/16.9 s + reduced-motion rest reviewed
- [ ] T6 [tool] (R3,R7,R16) Review at 1280/375 px → owner checkpoint  (reviewed by me 2026-11-24 at 1280/375 px; CHECKPOINT written — waiting for owner)

**Done when:** check.mjs OK; owner approves car, villains, buildings and the chase loop.

## Sprint 3 — live stats billboard + contribution city game + daily Action

- [ ] T1 [me] (R4,R5) Decide interfaces; capture `gen/fixtures/contrib.json` and `stats.json` with `gh api graphql` — check: fixtures parse
- [ ] T2 [oc] (R5) `gen/stats.mjs` (+ `--fixture`): holographic billboard on a building, neon-tube language bars, live numbers, via px.mjs — check: `node gen/stats.mjs --fixture` → `dist/stats.svg`, check OK
- [ ] T3 [oc] (R4,R14) `gen/contrib.mjs` (+ `--fixture`): 53×7 lit-window city block from the calendar, mech sprite patrols and zaps windows — check: `node gen/contrib.mjs --fixture` → `dist/contrib-game.svg`, check OK
- [ ] T4 [oc] (R6) `.github/workflows/update.yml` daily cron + dispatch → orphan `output` branch — check: diff read + YAML parse
- [ ] T5 [tool] (R4,R5) Live run with real data, numbers match github.com — check: screenshots

## Later milestones (not planned yet)

- v0.4 — R7 project shop-fronts (7), R8 pixel workbench, R9 portfolio station sign + YouTube billboard, R12 phone pass
- v1.0 — create PUBLIC repo `The-Shreyas-M/The-Shreyas-M` via `gitcp` after owner approval, first Action run, live check

## Parking lot (ideas with no R-id — not built unless the owner adds them to SPEC)

- Visitor counter, tabla/music easter egg, blog/YouTube latest-video feed
