# NOTES

## What this plugin does

`code-quality-kit` bundles code-quality tooling for the `course-api` Express app:

- **`code-reviewer`** (agent) — reviews changed code for bugs, missing error handling, and unclear names.
- **`test-writer`** (agent) — writes/updates tests in `course-api/tests/` and runs the suite.
- **`/code-quality-kit:quality-check`** (command) — runs both subagents and produces a single ready/not-ready-to-merge report.
- **`lint-triage`** (skill) — explains `course-api`'s ESLint config and how to fix violations the formatting hook's auto-fix can't resolve.
- **formatting hook** (`hooks/hooks.json` + `hooks/format.js`) — runs `eslint --fix` automatically after any `.js` file is edited or written.

## Install

From a fresh Claude Code session:

```
/plugin marketplace add frankmamone/claude-multi-agent-workflow
/plugin install code-quality-kit@claude-multi-agent-workflow
```

Or to test locally, from the repo root:

```
claude --plugin-dir .
```

## Scoping decision

`code-reviewer` is restricted to `Read, Grep, Glob` — it only needs to read and search code to find issues, never to change anything. Giving it `Write`/`Edit`/`Bash` would let a reviewing step silently modify the code it's supposed to be checking. `test-writer` needs `Read, Write, Edit, Bash` because its job requires creating or editing test files and actually running `npm test` to confirm they pass — a read-only agent can't do either.

## Orchestration decision

`/code-quality-kit:quality-check` runs `code-reviewer` and `test-writer` in parallel first, because neither depends on the other's output — both only need the diff of what changed, so running them concurrently is strictly faster than running them one after another. The final report step is dependent: it can't be written until both subagents finish, since it merges the review's severity findings with the test run's pass/fail result to decide ready vs. not-ready-to-merge.
