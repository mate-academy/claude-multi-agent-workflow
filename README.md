# code-quality

A Claude Code plugin that bundles a multi-agent code quality workflow — review, lint/test, and fix — built and tested against the Express API in `course-api/`.

## What's in here

- **Subagents** (`agents/`)
  - `code-reviewer` — read-only worker that reviews code for bugs, security issues, style violations, and missing test coverage. Only reports findings, never edits.
  - `quality-fixer` — takes a concrete list of problems (lint output, failing tests, review findings) and applies minimal fixes, then re-runs lint/tests to confirm.
- **Workflow command** (`commands/quality.md`) — `/code-quality:quality` runs the full workflow: `code-reviewer` and `npm run lint`/`npm test` in parallel, then `quality-fixer` on the combined results.
- **Skill** (`skills/code-quality-standards/SKILL.md`) — this project's lint rules, error-handling conventions, and test patterns, so findings and fixes match how `course-api/` actually works.
- **Hook** (`hooks/hooks.json`) — runs a lint check after every `Edit`/`Write` via `${CLAUDE_PLUGIN_ROOT}/hooks/lint-check.js`.

See [`NOTES.md`](./NOTES.md) for the scoping and orchestration decisions behind these pieces.

## Install

From this repo as a marketplace:

```
/plugin marketplace add Bohdan-Maksymiuk/claude-multi-agent-workflow
/plugin install code-quality@claude-multi-agent-workflow
```

Or locally, from the repo root:

```
claude --plugin-dir .
```

## Try it

```
cd course-api && npm install
```

Then, from the repo root, run `/code-quality:quality` against `course-api/`.

