# SPEC — The-Shreyas-M (GitHub profile README)

Living document. Always the current truth; history is in `DECISIONS.md` and git.

## 1. Summary
A GitHub profile README for the personal account `The-Shreyas-M` that looks insane: a cyberpunk / hacker-terminal page full of motion. It lives in the special public repo `The-Shreyas-M/The-Shreyas-M`, whose `README.md` GitHub shows on the profile page. GitHub runs no JavaScript in a README, so every moving part is an animated SVG (CSS/SMIL), an animated WebP, or an SVG that a scheduled GitHub Action regenerates from live GitHub data. It is for anyone who opens Shreyas's profile (recruiters, hackathon judges, YouTube viewers) and replaces today's empty default profile.

## 2. The 2-minute demo
1. Open github.com/The-Shreyas-M.
2. A full-width cyberpunk hero boots up: scanlines, glitching "SHREYAS", a terminal that types the tagline.
3. An original transformer-style mech assembles itself from flying parts, then loops.
4. Live stats + skills panel animates in (commits, stars, top languages, streak, tech stack) with today's numbers.
5. Project showcase: animated cards for 7 public projects, each linking to its repo.
6. A 3D hardware hero shot loops (exploded electronics board under neon light).
7. The contribution grid is a game: the mech/ship hunts the real commit cells of the last year, redrawn daily.
8. Footer: a big animated "ENTER PORTFOLIO" link to iamshreyas.pages.dev and a YouTube badge.

## 3. Requirements

| Id | Requirement (testable) | Priority | Done when |
|---|---|---|---|
| R1 | Design system: one palette, type, motion rules for every asset (cyberpunk/terminal) | Must | `docs/DESIGN.md` exists; every SVG uses only its colours |
| R2 | Hero banner SVG: glitch name, typed tagline/bio, scanlines, boot sequence, loops | Must | `assets/hero.svg` animates in Chrome and in the GitHub-render preview |
| R3 | Original transformer-style mech SVG: parts fly in and assemble, idle pose, loops | Must | `assets/mech.svg` animates; design is original (no franchise likeness) |
| R4 | Contribution game SVG generated from the real contribution calendar (GraphQL) | Must | `node gen/contrib.mjs` writes `dist/contrib-game.svg` from live data; offline fixture also works |
| R5 | Live stats + skills panel SVG generated from GitHub API data | Must | `node gen/stats.mjs` writes `dist/stats.svg` with real numbers |
| R6 | Daily GitHub Action regenerates R4 + R5 and pushes them to the `output` branch | Must | workflow run succeeds; README images update next day |
| R7 | Project showcase: animated SVG card per project, linked to its repo: Oculius, ESP32-Synth, 65W fast charger, ChocoBao, NEURA, ai-video-editor, Axiom | Must | 7 cards in `assets/projects/`, each wrapped in a link in README |
| R8 | 3D hardware hero loop: original Blender scene, rendered to animated WebP ≤ 5 MB | Must | `assets/hardware-loop.webp` plays in README preview |
| R9 | Portfolio link (iamshreyas.pages.dev) as an animated button + YouTube badge (https://www.youtube.com/@The-Shreyas-M/). No other socials | Must | both visible and clickable in preview |
| R10 | GitHub-safe assets: no `<script>`, no external URLs/fonts inside SVGs, each SVG ≤ 1 MB, `prefers-reduced-motion` respected | Must | `node gen/check.mjs` prints `ALL ASSETS OK` |
| R11 | Local preview: README rendered through GitHub's markdown API into `preview/index.html` with GitHub's dark styling | Must | `node gen/preview.mjs` then open the file: matches github.com layout |
| R12 | README layout: section order of the demo, centred, looks right at desktop and mobile width | Must | preview checked at 1280 px and 390 px |
| R13 | Light-mode variants via `<picture>` + `prefers-color-scheme` | Should | preview in light mode is readable |
| R14 | Mech appears inside the contribution game as the hunter | Should | contrib SVG shows the mech sprite |
| R15 | Extra socials, blog feed, visitor counter, music/tabla easter egg | Later | — |

## 4. Non-goals
- No third-party stat/badge services (readme-stats, shields, snk action) as the main visuals — we build our own SVGs. (A small static shields badge is fine only if R9 needs it; prefer our own.)
- No private projects and no employer work (BuildOptix, BACnet, esp32s3 stack) anywhere on the page.
- No socials other than YouTube in v1.
- No copying of an existing franchise's robot design, logos or names.
- No JavaScript-based tricks (GitHub strips it); no hosted site — the README is the product.

## 5. Users and flows
Visitor opens the profile → scrolls top to bottom through: hero (R2) → mech (R3) → stats + skills (R5) → project showcase (R7) → hardware loop (R8) → contribution game (R4) → portfolio button + YouTube (R9). Clicking a project card opens its repo; the button opens the portfolio. Owner flow: edit generators/assets locally → `node gen/preview.mjs` → check → push; the Action keeps live SVGs fresh daily.

## 6. Architecture and stack
- **Static animated SVGs** (`assets/`): hand-built or generated once by Node scripts; animation by CSS `@keyframes` inside `<style>` and SMIL. Fonts: system monospace stack or a subset font embedded as a base64 data URI (GitHub serves SVGs through `<img>` via camo, which blocks external loads).
- **Live SVG generators** (`gen/*.mjs`): Node ≥ 20, plain ESM, **zero npm dependencies** (built-in `fetch`). Read `GITHUB_TOKEN`; GraphQL `contributionsCollection` for R4, REST/GraphQL for R5. Each has `--fixture` mode reading `gen/fixtures/*.json` for offline runs and tests.
- **Action** (`.github/workflows/update.yml`): cron daily + manual dispatch; runs generators; force-pushes `dist/` to orphan branch `output`. README references `https://raw.githubusercontent.com/The-Shreyas-M/The-Shreyas-M/output/<file>.svg`.
- **3D loop**: Blender 5.2 (installed) scene in `blender/`, rendered PNG frames → ffmpeg (installed) → animated WebP.
- **Checks**: `gen/check.mjs` (R10 lint), `gen/preview.mjs` (R11, uses `gh api markdown` or the REST markdown endpoint).
- Folder layout: `README.md`, `assets/` (static SVG/WebP), `gen/` (generators, checks, fixtures), `dist/` (generated, gitignored on main), `blender/`, `preview/` (gitignored), `.github/workflows/`, `docs/`.

## 7. Data and interfaces
- Contribution data: GraphQL `user(login:"The-Shreyas-M"){contributionsCollection{contributionCalendar{weeks{contributionDays{date contributionCount contributionLevel}}}}}` → fixture `gen/fixtures/contrib.json` same shape.
- Stats: total commits (year), public repos, stars, followers, top 6 languages by bytes over public non-fork repos, current + longest streak (computed from the calendar).
- Shared generator helper `gen/lib/svg.mjs`: palette import from `gen/lib/theme.mjs` (mirror of `docs/DESIGN.md`), `esc()` for XML escaping, `writeSvg(path, str)`.

## 9. Constraints
- Deadline: none; quality first, sprint checkpoints with the owner judging visuals.
- Budget: free only. Action uses the built-in `GITHUB_TOKEN` (public data) — no extra secrets unless private contribution counts are wanted (Later).
- Account: personal `The-Shreyas-M`; push via `gitcp`. Repo is created PUBLIC only at the end of v1, after owner approval (go-live checkpoint).
- Confidentiality: personal project — free models allowed. Only public info goes in.
- Quality bar: demo-ready showpiece. Tests: smoke checks (`check.mjs`, fixture runs of generators).

## 10. Milestones
| Version | Contains | Owner checks |
|---|---|---|
| v0.1 | R1, R2, R3, R10, R11 | hero + mech in local preview |
| v0.2 | R4, R5, R6 (Action tested on a fork-free dry run) | live numbers + game in preview |
| v0.3 | R7, R8, R9, R12 | full page in preview, desktop + mobile |
| v1.0 | all Must, repo public | live profile on github.com |

## 11. Assumptions
- Project folder `~/Projects/The-Shreyas-M` (old empty `Github Mod` can be deleted by the owner).
- Bio/tagline text drafted by the orchestrator from the knowledge base (electronics + code + design, builds IoT/hardware, web and AI tools, posts on YouTube), first name only; owner edits at checkpoint 1.
- Contribution game concept: the mech (or its ship form) flies along the grid firing at commit cells, cells shatter by level; exact look settled in DESIGN.md.
- Generated live SVGs live on an `output` branch so the main branch history stays clean.

## 12. Open questions
- None blocking. At checkpoint 1: tagline wording, which tech-stack items appear in the skills panel.
