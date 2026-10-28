# code-quality-workflow

A Claude Code plugin that reviews and fixes an Express API codebase. Built and tested against `course-api/`.

## What it does

- **`code-reviewer`** (subagent, read-only) — inspects a file and reports findings: bugs, missing input validation, inconsistent error handling, style issues.
- **`fix-applier`** (subagent, read/write) — takes a findings list and edits the flagged files to fix them.
- **`/review-and-fix`** (command) — runs `code-reviewer` over `routes/health.js`, `routes/users.js`, and `db/store.js` in parallel, then runs `fix-applier` once on the combined findings.
- **`express-review-checklist`** (skill) — this codebase's own conventions (input validation → `400`, missing record → `404`, `{ "error": "message" }` error shape, all data access through `db/store.js`), used by the reviewer and fixer to stay consistent.
- **Lint hook** — runs `npm run lint` in `course-api/` after any `Edit`/`Write`, as a non-blocking signal.

## Install

From a Claude Code session:
```
/plugin marketplace add linmaweb/claude-multi-agent-workflow
/plugin install code-quality-workflow@code-quality-marketplace
```

For local development without installing, run from this repo's root:
```
claude --plugin-dir .
```

## Usage

```
/review-and-fix
```
This reviews `course-api/routes/health.js`, `course-api/routes/users.js`, and `course-api/db/store.js` concurrently, waits for all three reviews to finish, then applies fixes for the combined findings in a single pass. It reports what was found and what was fixed (or skipped, with a reason) per file.

## Repo layout

```
.claude-plugin/
  plugin.json        — plugin manifest (name, version)
  marketplace.json    — marketplace listing for /plugin install
agents/
  code-reviewer.md    — read-only reviewer (sonnet)
  fix-applier.md       — writer/fixer (opus)
commands/
  review-and-fix.md    — the workflow command
skills/
  express-review-checklist/SKILL.md
hooks/
  hooks.json           — PostToolUse lint hook
  scripts/lint-check.sh
course-api/            — the Express API this plugin is built and tested against
```

See `NOTES.md` for scoping and orchestration decisions, and `ASSIGNMENT.md` for the original course brief this project was built from.
