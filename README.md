# api-quality

A Claude Code plugin that runs a code-quality workflow on an Express API. One command reviews the code, finds untested paths, writes the missing tests, and reports what it found.

This repo is both the plugin and the marketplace that offers it. `course-api/` is a sample Express API to try the plugin on.

## Install

```bash
/plugin marketplace add vladfe25/claude-multi-agent-workflow
/plugin install api-quality@vecherok-tools
```

Or load it straight from a clone, without installing:

```bash
claude --plugin-dir .
```

## What's inside

| Type | Name | What it does |
|------|------|--------------|
| Command | `/api-quality:audit [path]` | Runs the whole workflow on an API folder (default `course-api`) |
| Subagent | `api-reviewer` | Read-only review: bugs, validation, status codes, conventions (Sonnet) |
| Subagent | `coverage-scout` | Read-only scan: which endpoint + status pairs are untested (Haiku) |
| Subagent | `test-writer` | Writes the missing tests under `tests/` and runs `npm test` (Sonnet) |
| Skill | `express-api-conventions` | Route and test conventions: status codes, error shape, supertest style |
| Hook | `PostToolUse` → `scripts/lint-on-edit.js` | After any `Write`/`Edit` of a `.js` file, runs the project's ESLint and sends errors back to Claude |

## How the workflow runs

```
            ┌── api-reviewer ───┐
/audit ─────┤                   ├──► test-writer ──► final report
            └── coverage-scout ─┘
             (Step 1: parallel)    (Step 2: waits)   (Step 3)
```

## Try it on the sample API

```bash
cd course-api && npm install && cd ..
claude --plugin-dir .
```

Then, inside Claude Code:

- `/api-quality:audit course-api`: runs the full workflow.
- "Review the users route": Claude should pick `api-reviewer`.
- "What isn't covered by tests in course-api?": Claude should pick `coverage-scout`.
- After editing plugin files, run `/reload-plugins`.

The lint hook needs ESLint installed in the target project (`npm install` in `course-api/`). If it can't find ESLint, it does nothing.

See [NOTES.md](NOTES.md) for the design decisions.
