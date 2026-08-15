# course-quality-guard

A Claude Code plugin that runs a multi-agent code-quality workflow against
`course-api/`: review it for convention compliance, run its tests, and fix
scoped gaps — as one command.

## Install

Locally, from this repo's root:

```
claude --plugin-dir .
```

Or as a marketplace plugin, from any session:

```
/plugin marketplace add AlinaYamchuk/claude-multi-agent-workflow
/plugin install course-quality-guard@course-quality-guard-marketplace
```

Prerequisite: `cd course-api && npm install` (only needs to be done once).

## What's inside

| Component | What it does |
|---|---|
| `reviewer` (agent) | Read-only review of `course-api/` against its own `CLAUDE.md` conventions; flags convention violations and missing test coverage. |
| `fixer` (agent) | Applies already-scoped fixes and writes missing tests, then self-verifies with `npm test`/`npm run lint`. |
| `/course-quality-guard:audit` (command) | Orchestrates both agents: reviews and runs tests in parallel, then hands the combined results to `fixer` as a dependent step. |
| `api-conventions` (skill) | Encodes `course-api`'s validation/error-shape/data-access conventions so any agent working on it applies them consistently. |
| lint-fix (hook) | Auto-runs `eslint --fix` on `course-api/` files after they're edited. |

## Usage

Run `/course-quality-guard:audit` to audit and fix `course-api/` in one pass,
or ask Claude to review recent changes — it will reach for `reviewer` on its
own. After editing plugin files, run `/reload-plugins`.

See `NOTES.md` for the reasoning behind the scoping and orchestration choices.
