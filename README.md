# productivity plugin

A Claude Code plugin bundling a multi-agent productivity workflow — scoped subagents, an orchestration command, a skill, and a hook. (This is `README.md`, the plugin's overview — for the design rationale behind it, see `NOTES.md`; for the original course brief, see `ASSIGNMENT.md`.)

## Install

From a Claude Code session:
```
/plugin marketplace add https://github.com/thunderTheNakedGun/claude-multi-agent-workflow.git
/plugin install productivity@productivity-marketplace
```

To test locally against this repo's own `course-api/` app without publishing first, run `claude --plugin-dir .` from the repo root, then `cd course-api && npm install` once before invoking any command.

## Commands

- `/productivity:pre-pr-review` — the workflow command. Runs `unit-tests` first (it may repair failing tests), then `diff-reviewer` and `lint` in parallel against the settled tree, then `pr-summarizer` to draft a PR description from all three results.
- `/productivity:standup` — summarizes your recent commits across repos.

## Other components

- `agents/` — `diff-reviewer` (read-only), `lint`, `unit-tests` (write-capable), `pr-summarizer`
- `skills/` — `pr-description`, `commit-messages`
- `hooks/` — `pretest-git-add`, runs the related unit test file before a `git add` that touches it

See `NOTES.md` for the scoping and orchestration decisions behind this design.
