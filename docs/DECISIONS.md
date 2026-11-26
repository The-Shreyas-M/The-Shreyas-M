# DECISIONS — The-Shreyas-M

One line each, newest first: `date — decision or change — why`. Change requests from the owner go here too.

- 2026-11-26 — removed every prefers-reduced-motion freeze; check.mjs now fails if one comes back. Why: owner's laptop has Windows animation effects off, so the live profile looked dead; other profiles (snake SVG) never gate.
- 2026-11-26 — stats billboard: full language names, whole-number percents (owner: "JAVASCRI? where is the PT"). Long names trim to fit.
- 2026-11-25 — Sprint 3 data interface = `gen/lib/github.mjs` (STATS/CONTRIB GraphQL on `user(login)`, not `viewer`, so the Action's GITHUB_TOKEN works; `loadStats`/`loadContrib` → normalized objects; fixtures = raw GraphQL `data`). Fixtures are deterministic placeholders (`_placeholder: true`) because api.github.com timed out from this machine; real numbers checked in T5.
- 2026-11-25 — Process change (owner, /new-project:continue "the new way, with skill improvement"): WORKFLOW.md refreshed from the template (parallel opencode jobs, owner-approved skill-improvement loop); skill improvements proposed at each checkpoint — no SPEC change.
- 2026-11-24 — Turret rises from the rear deck and fires over the roof; the pop-up lamp pods only light up — a gun inside the lamp pods did not read at 64 px. Owner asked at checkpoint (SPEC R3 says lamps flip into turrets).
- 2026-11-24 — Scene split: `gen/pixel/track.mjs` (actor = sheet + whole-pixel position keys, seq must sum to 18 s) + `street-bg.mjs` (parallax) + `mech.mjs` (beats) — one interface the workers fill with numbers.
- 2026-11-24 — Car sheet is 18 frames (adds empty-seat drive so the car arrives without a driver) — beat B0 needs it.
- 2026-11-23 — Project started from /new-project interview — see SPEC.
- 2026-11-23 — Own SVG generators instead of third-party stat services.
- 2026-11-23 — robot is an original animated SVG mech, not a 3D model and not a franchise copy.
- 2026-11-23 — 3D loop is a Blender hardware hero shot rendered to animated WebP.
- 2026-11-23 — live SVGs go to an orphan `output` branch.
- 2026-11-23 — repo goes public only at v1.
- 2026-11-23 — showcase = public repos Oculius, ESP32-Synth, 65w-super-fast-charger-type-c, chocobao, NEURA, ai-video-editor, Axiom.
- 2026-11-23 — only social = YouTube https://www.youtube.com/@The-Shreyas-M/.
- 2026-11-23 — CHANGE REQUEST: owner rejected the flat vector SVG look ("like a 3-year-old drew it"); switched to pixel art (refs Huntdown, Cloudpunk, style only), no 3D. Pixel city hero approved. R3/R4/R5/R7 restyled, R8 3D loop replaced by pixel workbench, R13 owner character added.
- 2026-11-24 — owner character is a generic hacker (hoodie, headphones, handheld) — owner chose it instead of giving a likeness now.
- 2026-11-24 — CHANGE REQUEST: the mech becomes an 80s wedge supercar (owner's reference: Countach) that the owner's avatar rides; pop-up headlights flip to reveal turrets that shoot cyberpsycho villains; the car transforms into the robot for a boss. Project buildings get themed pixel art (microprocessor chip tower, Oculius eye that looks around, fast-charger power grid with arcs). Car is OUR OWN design in that spirit — no badge, no name, no exact copy of the real car (DESIGN rule: never copy).
- 2026-11-24 — chase loop = 18.0 s, every period divides 18; parallax travel = whole tiles (far 400, buildings 560, near 1120, dashes 2240) — seamless loop.
- 2026-11-24 — buildings.mjs interface: 72 px wide, ground row h-1, pure exports building()/buildingSvg(), files written only under a main guard; animated part exposed as anim {frames,x,y,fw,fh,period}.
- 2026-11-24 — owner OKed the car look (drive frames). CHANGE REQUEST: when the car turns into the robot, the avatar jumps out and fights the enemies on foot ALONGSIDE the robot (not sitting in a chest cockpit).
- 2026-11-24 — owner OKed the 18 s beat list and all 7 building themes (chip tower = ChocoBao, ESP32-Synth speaker stack, NEURA glass HUD tower, ai-video-editor cinema, Axiom archive tower).
