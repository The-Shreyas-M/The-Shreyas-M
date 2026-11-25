# Skill feedback

One line per friction with a skill or WORKFLOW rule (see WORKFLOW → "Improving the skills").
Nothing here is applied without the owner's yes.

`date | skill or file | what happened | proposed change → applied <commit> / rejected / later`


2026-11-25 | new-project template WORKFLOW.md → Running opencode | a worker ran `git checkout --` and reverted my uncommitted edits (observation 0014) | commit before every dispatch; brief DO NOT line forbids any git command; verify step greps the log for git commands
2026-11-25 | new-project template WORKFLOW.md → The exact brief / verify | workers passed checks they gamed or broke: padded a count check, junk tokens at file end, visual layout wrong (observations 0010, 0013, 0009) | DONE WHEN must run the thing (never a bare count); `tail -3` each written file; look at the first visual output in its real scene before fanning out
2026-11-25 | new-project references/flow.md → interview/spec | a showpiece was built in a medium too weak for the brief and rejected (observation 0012) | for taste-judged deliverables, name a reference, pick the medium that reaches it, show one proof frame before planning sprints
2026-11-25 | new-project WORKFLOW.md → Session start + gitcp | diff check saw nothing in an uncommitted repo; commits authored by the wrong account (observations 0006, 0011) | at session start: no HEAD → local baseline commit; set repo-local git user.name/email to the pinned account and stop on mismatch
