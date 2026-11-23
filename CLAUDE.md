# The-Shreyas-M

An insane, fully animated cyberpunk/terminal GitHub profile README for The-Shreyas-M, built from hand-made animated SVGs, a Blender WebP loop and live SVGs a daily GitHub Action regenerates.

**Type:** Something else (GitHub profile README: static assets + Node generators + GitHub Action) · **Stage:** demo · **Runs:** local

## Start here (every session)

1. Read `docs/WORKFLOW.md` — the build method. Follow it exactly. **Workers are free models through `opencode run` (default `opencode/beam-free`); that is what "delegate" and "subagent" mean in this project. The Agent tool (Claude subagents) is blocked by a hook except for the three exceptions in WORKFLOW → Routing. Run sprints on Sonnet or Opus, one sprint per session.**
2. Read `HANDOFF.md`, then `TODO.md`. Continue from **Next step**.
3. `docs/SPEC.md` is the source of truth for what to build. Nothing outside it gets built.

## Stack

- Markdown README.md
- animated SVG (CSS keyframes + SMIL, no JS)
- Node >= 20 plain ESM scripts in gen/ with zero npm dependencies
- GitHub Actions daily cron pushing generated SVGs to orphan branch `output`
- Blender 5.2 + ffmpeg for the animated WebP hardware loop
- gh CLI for markdown preview and GraphQL

## Commands

| Do | Command |
|---|---|
| Install | `none (no npm deps; needs node, gh, blender, ffmpeg)` |
| Run / dev | `node gen/preview.mjs` then open preview/index.html |
| Build | `node gen/stats.mjs && node gen/contrib.mjs` |
| Test | `node gen/check.mjs` (prints ALL ASSETS OK) |
| Deploy / flash | `push main via gitcp skill; Action pushes dist/ to output branch` |

## Conventions

- `README.md` = the profile page
- `assets/` = static animated SVGs and WebP
- `gen/` = Node generators, check and preview scripts, `gen/fixtures/` offline data, `gen/lib/` shared helpers
- `dist/` = generated SVGs (gitignored on main)
- `blender/` = 3D scene
- `.github/workflows/` = daily update Action
- Commits: `S<sprint>-T<task>: <what>`. commit per task; NO push and NO public repo until the owner approves v1 at the go-live checkpoint; push only via the gitcp skill on the personal account The-Shreyas-M.
- Commit and push with the `gitcp` skill when it is available (account is pinned in `.gitcp.md`).

## Confidential

Personal project — free models allowed for tier-0 tasks.
Secrets live in GitHub Actions built-in GITHUB_TOKEN and the local gh CLI login, never in the repo.

## Shared knowledge base

If `~/.claude/workspace-registry.txt` exists, look things up in the owner's knowledge base (`<that path>/knowledge/INDEX.md`) yourself with Grep (never an agent) **before asking the owner for context and before installing or setting up anything**. Ask or install only what is not found there; write new durable facts back (`shreyas-workspace-replicate:kb`).

## Toolchain log (mandatory)

- When any tool, SDK, toolchain, global package, driver, CLI, MCP server or skill is installed or first used for this project, add a row to `docs/TOOLCHAIN.md` in the same session: name, version, install command, why. Make the edit yourself (one line).
- If `~/.claude/workspace-registry.txt` exists, also record it in the workspace registry with the `shreyas-workspace-replicate:log-tool` skill, so a new machine can be set up from it. Nothing gets installed untracked.
- When the stack changes (a tool is replaced), mark the old row "replaced by <new>" instead of deleting it.

## Skills to load when relevant

frontend-design and ui-ux-pro-max, loaded at Sprint 1 T1 (design system) and any later visual task; gitcp for commit/push.
