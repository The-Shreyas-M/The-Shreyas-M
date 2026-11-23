# HANDOFF — The-Shreyas-M

Keep under 60 lines. Replace old content; git keeps the history.

## Start line (owner pastes this to run a sprint unattended)

```
/goal Every task in the current sprint of TODO.md is ticked with evidence and the sprint's Done-when checks pass in shown output, or a CHECKPOINT or BLOCKED entry for the owner is at the top of HANDOFF.md. Stop after 40 turns.
```

**Open a new session for every sprint, on Sonnet or Opus (not the top model).** A long session re-reads itself every turn and is the biggest cost.

If `/goal` is not available: type `/sprint` (this repo's own skill — works in cloud sessions too).

## State (2026-11-23)

- Direction changed: owner rejected the flat vector look; PIXEL ART approved ("Yes, build on it"). Read `docs/DESIGN.md` first — it is the style law, and `assets/hero.svg` (from `gen/pixel/hero.mjs`) is the quality reference.
- Done: pixel toolkit `gen/pixel/px.mjs`, pixel city hero, check + preview scripts. `assets/mech.svg` is the OLD rejected vector mech — to be replaced in Sprint 2.
- Tests: `node gen/check.mjs` → ALL ASSETS OK · Deployed: no (local only, nothing pushed)

## Next step

Sprint 2 T4 first question to the owner: the look of their pixel character (hair, glasses, clothes, or a photo). Then T1 (`gen/pixel/sprite.mjs` via opencode) and T2 (author mech sprites yourself — taste-critical, review every frame zoomed in).

## Blocked / waiting on owner

- Character likeness (Sprint 2 T4).

## Gotchas found so far

- Pixel art: whole-pixel motion only (`steps()`); embed PNG layers as data URIs; never hand-write vector illustration again (rejected).
- GitHub strips JavaScript and blocks external resources inside SVGs served via img (camo), so fonts must be system or embedded data URIs; the profile shows only if the repo The-Shreyas-M/The-Shreyas-M is PUBLIC; Bash shell is Git Bash on Windows, folder `Github Mod` is an old empty folder that could not be renamed.
- Local git identity is set to The-Shreyas-M (global identity is the college account) — keep it.
- The built-in browser runs with reduced motion on: verify animation by seeking `document.getAnimations()` on the preview/*-anim.svg copies.
- preview_start reads the old `Github Mod` launch path; start the server via Bash and open the URL instead.
