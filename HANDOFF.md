# HANDOFF — The-Shreyas-M

Keep under 60 lines. Replace old content; git keeps the history.

## Start line (owner pastes this to run a sprint unattended)

```
/goal Every task in the current sprint of TODO.md is ticked with evidence and the sprint's Done-when checks pass in shown output, or a CHECKPOINT or BLOCKED entry for the owner is at the top of HANDOFF.md. Stop after 40 turns.
```

**Open a new session for every sprint, on Sonnet or Opus (not the top model).** A long session re-reads itself every turn and is the biggest cost.

If `/goal` is not available: type `/sprint` (this repo's own skill — works in cloud sessions too).

## CHECKPOINT — Sprint 1 (2026-11-23)

Owner: open the preview and judge the look. Run `python -m http.server 8765 --bind 127.0.0.1` in this folder, then open http://127.0.0.1:8765/preview/index.html (re-run `node gen/preview.mjs` after README edits).
If Windows "Animation effects" is off, the browser shows only the finished still frame — open preview/hero-anim.svg and preview/mech-anim.svg to see the motion (local copies with the reduced-motion rule removed).
Questions for the owner: does the hero + mech look insane enough? Tagline wording OK? Which tech-stack items go in the Sprint 2 skills panel?

## State (2026-11-23)

- Sprint: 1 done (T1–T7 ticked) · Sprint 2 is next
- Builds: n/a · Tests: `node gen/check.mjs` → ALL ASSETS OK (2 files) · Deployed: no (local only, nothing pushed)

## Next step

New session: Sprint 2 T1 — decide generator interfaces in `gen/lib/svg.mjs`, capture `gen/fixtures/contrib.json` and `stats.json` with `gh api graphql` (personal account The-Shreyas-M is the active gh login).

## Blocked / waiting on owner

- Checkpoint 1 feedback (above).

## Gotchas found so far

- GitHub strips JavaScript and blocks external resources inside SVGs served via img (camo), so fonts must be system or embedded data URIs; the profile shows only if the repo The-Shreyas-M/The-Shreyas-M is PUBLIC; Bash shell is Git Bash on Windows, folder `Github Mod` is an old empty folder that could not be renamed.
- Local git identity is set to The-Shreyas-M (global identity is the college account) — keep it.
- The built-in browser runs with reduced motion on: verify animation by seeking `document.getAnimations()` on the preview/*-anim.svg copies.
- preview_start reads the old `Github Mod` launch path; start the server via Bash and open the URL instead.
