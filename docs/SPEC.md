# SPEC — The-Shreyas-M (GitHub profile README)

Living document. Always the current truth; history is in `DECISIONS.md` and git.

## 1. Summary
A GitHub profile README for the personal account `The-Shreyas-M` that looks insane: a **pixel-art cyberpunk city at night** (owner references: Huntdown, Cloudpunk — style only, all art original) full of motion. It lives in the special public repo `The-Shreyas-M/The-Shreyas-M`. GitHub runs no JavaScript in a README, so every moving part is an SVG made of embedded pixel-art PNG layers animated with CSS, some regenerated daily by a GitHub Action from live GitHub data. For anyone who opens Shreyas's profile (recruiters, hackathon judges, YouTube viewers).

## 2. The 2-minute demo
1. Open github.com/The-Shreyas-M.
2. ONE horizontally scrolling city strip (Sprint 6): a rainy pixel city scrolls in parallax; a neon "SHREYAS" sign flickers over the skyline with the tagline; flying cars pass; Shreyas's pixel character stands on a rooftop.
3. A rooftop workshop: a dev board powers up and transforms into the bench-mech, idles, folds back.
4. A holographic billboard shows live stats and languages.
5. Project shop-fronts / billboards, each clickable to its repo.
6. The contribution grid is a city block of lit windows; the mech patrols and zaps them, redrawn daily.
7. Footer: a pixel "ENTER PORTFOLIO" station sign → iamshreyas.pages.dev, and a YouTube billboard.

## 3. Requirements

| Id | Requirement (testable) | Priority | Done when |
|---|---|---|---|
| R1 | Pixel-art design system + toolkit (`docs/DESIGN.md`, `gen/pixel/px.mjs`) used by every asset | Must | all assets built with px.mjs and the DESIGN palette |
| R2 | Hero: pixel cyberpunk city, parallax, rain, flying cars, neon name sign + tagline | Must | `node gen/pixel/hero.mjs` → `assets/hero.svg` (DONE, approved 2026-11-23) |
| R3 | Street-chase scene: the owner's avatar jumps into an original 80s wedge supercar (scissor doors, pop-up headlights), drives a neon street; headlights flip up into turrets that shoot cyberpsychos (R16); a boss blocks the road, the car transforms into the robot and the avatar jumps out, and both fight side by side (avatar on foot with the handheld as a blaster), win, folds back, drives off; one loop ≈ 16–20 s, frame-by-frame | Must | `node gen/pixel/mech.mjs` → `assets/mech.svg`; owner approves look |
| R4 | Contribution game: real contribution calendar as a lit-window city block, mech patrols and zaps windows | Dropped 2026-11-26 (owner: one strip) | `node gen/contrib.mjs` writes `dist/contrib-game.svg` from live data; `--fixture` works offline |
| R5 | Live stats + languages as an in-world holographic billboard | Dropped 2026-11-26 (owner: one strip) | `node gen/stats.mjs` writes `dist/stats.svg` with real numbers |
| R6 | Daily GitHub Action regenerates R4 + R5 and pushes them to the `output` branch | Dropped 2026-11-26 (owner: one strip) | workflow run succeeds; README images update next day |
| R7 | Project showcase: one themed pixel BUILDING per project (art shows the project: Oculius = tower with a giant eye that looks around; 65W fast charger = power-grid substation with arcs; a microprocessor-facade chip tower; ESP32-Synth, ChocoBao, NEURA, ai-video-editor, Axiom themes to confirm), each its own linked SVG and reused as the backdrop of the R3 street; projects: Oculius, ESP32-Synth, 65W fast charger, ChocoBao, NEURA, ai-video-editor, Axiom | Must | 7 SVGs in `assets/projects/`, each wrapped in a link |
| R8 | Hardware piece: pixel-art workbench close-up (ESP32 board, synth, drone) with blinking LEDs and scope — replaces the dropped 3D loop | Should | `assets/bench.svg` |
| R9 | Footer: pixel "ENTER PORTFOLIO" sign → iamshreyas.pages.dev + YouTube billboard (https://www.youtube.com/@The-Shreyas-M/). No other socials | Must | both clickable in preview |
| R10 | GitHub-safe assets: no script, no external URLs, each SVG ≤ 1 MB, always animate (no reduced-motion freeze — owner 2026-11-26) | Must | `node gen/check.mjs` prints `ALL ASSETS OK` |
| R11 | Local preview through GitHub's markdown API | Must | `node gen/preview.mjs` (DONE) |
| R12 | Layout in demo order, readable at 1280 px and 360 px (phone variant via `<picture media>` if needed) | Must | preview checked at both widths |
| R13 | Owner's pixel character on the hero rooftop (coat, hair moving in the wind) | Should | owner approves likeness |
| R14 | Mech appears in the contribution game | Dropped 2026-11-26 (owner: one strip) | contrib SVG shows the mech sprite |
| R16 | Enemies: original cyberpsycho villains (2–3 street grunts + 1 boss), pixel sprites with hit/explode frames, used in R3 (and R4 later) | Must | owner approves the villains |
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
- **Pixel generators** (`gen/pixel/*.mjs`): Node >= 20, zero npm dependencies. `px.mjs` = toolkit (layers, PNG via `node:zlib`, dithering, glow, 5×7 font). Each scene script writes one SVG into `assets/` (static) or `dist/` (live). Sprites as palette-indexed string grids in `gen/pixel/sprites/`.
- **SVG format**: logical-resolution `viewBox` (400 wide), embedded PNG data-URI layers, CSS `steps()` animation for parallax and sprite frames. See DESIGN §1.
- **Live generators** (`gen/stats.mjs`, `gen/contrib.mjs`): fetch with `GITHUB_TOKEN` (GraphQL), `--fixture` mode from `gen/fixtures/*.json`, draw with px.mjs.
- **Action** (`.github/workflows/update.yml`): daily cron + manual dispatch; runs generators; force-pushes `dist/` to orphan branch `output`. README references `https://raw.githubusercontent.com/The-Shreyas-M/The-Shreyas-M/output/<file>.svg`.
- **Checks**: `gen/check.mjs` (R10), `gen/preview.mjs` (R11).
- Folder layout: `README.md`, `assets/`, `gen/` (`pixel/`, `lib/`, `fixtures/`), `dist/` (gitignored), `preview/` (gitignored), `.github/workflows/`, `docs/`.
- Dropped: hand-written vector SVG illustration (rejected), Blender/3D (owner: no 3D).

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
| v0.1 | R1, R2, R10, R11 (done) | pixel city hero approved 2026-11-23 |
| v0.2 | R3 mech scene, R13 character | mech + character look |
| v0.3 | R4, R5, R6 live HUD + contribution city | live numbers + game in preview |
| v0.4 | R7, R8, R9, R12 | full page, desktop + phone |
| v1.0 | all Must, repo public | live profile on github.com |

## 11. Assumptions
- Project folder `~/Projects/The-Shreyas-M` (old empty `Github Mod` to be deleted by the owner).
- Tagline: "HARDWARE HACKER / CODER / DESIGNER" (owner can change).
- Generated live SVGs live on an `output` branch so main history stays clean.
- Style references are games the owner named; only the genre and mood are borrowed.

## 12. Open questions
- R13 character likeness: hair style/colour, glasses or not, clothing (ask at the v0.2 checkpoint, or the owner sends a photo/description).
- Which tech-stack items appear on the stats billboard.
