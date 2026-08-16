# api-quality

A Claude Code plugin that bundles a code-quality workflow for Express APIs: a read-only
reviewer, a test-writing agent, a conventions skill, and an auto-lint hook — all wired
together by one command, `/quality`.

This repo is both the plugin and the marketplace that serves it, tested against the sample
Express API in `course-api/`.

## What it does

Run `/api-quality:quality [path]` and it:
1. Reviews the target code for correctness and convention drift (`api-reviewer`), and lints
   it with ESLint — in parallel, since neither depends on the other.
2. Merges both sets of findings into one ranked list.
3. Hands that list to `test-author`, which writes regression tests (`node:test` +
   `supertest`, matching the existing test style) and runs the suite.
4. Reports findings found, tests added, and the suite result.

## Install

**Local (for development/testing):**
```
claude --plugin-dir .
```
from the repo root. Use `/reload-plugins` to pick up edits as you iterate.

**Published (from the marketplace in this repo):**
```
/plugin marketplace add Krupkolllia/claude-multi-agent-workflow
/plugin install api-quality@krupkolllia-marketplace
```

## Components

| Component | What it is |
|---|---|
| `agents/api-reviewer.md` | Read-only reviewer (`Read`, `Grep`, `Glob`, sonnet). Checks route/store code against conventions and returns numbered findings — never edits. |
| `agents/test-author.md` | Writer (`Read`, `Write`, `Edit`, `Bash`, `Grep`, opus). Turns findings into regression tests and runs `npm test`. |
| `commands/quality.md` | `/quality` — the workflow trigger: review ∥ lint, then merge, then test-author, then report. |
| `skills/express-api-conventions/SKILL.md` | The house rules (route layout, store contract, status codes, error shape) both agents check against. |
| `hooks/hooks.json` + `scripts/lint-fix.sh` | `PostToolUse` hook that auto-fixes lint issues on any `.js` file a Claude session writes or edits. |

## Example

Against `course-api/routes/users.js`, `/quality course-api/routes/users.js` runs
`api-reviewer` and `npm run lint` together, merges their output (e.g. a missing `400` check
or an inconsistent error shape), then has `test-author` write a `node:test` case that
locks in the fix and confirms `npm test` passes.

## The subject codebase

`course-api/` is a small Express API (routers per resource, an in-memory store, `node:test`
+ `supertest`, ESLint 9 flat config) used as the target the agents read and write. See
`course-api/README.md` and `course-api/CLAUDE.md` for its own conventions.
