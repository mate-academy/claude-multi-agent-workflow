# code-quality

A Claude Code plugin that ships a small multi-agent code-quality workflow, tested against the Express API in `course-api/`. This repo is both the plugin and the marketplace that offers it.

## What's inside

- **`agents/code-reviewer.md`** — read-only reviewer (`Read, Grep, Glob`, model `opus`). Reviews code for bugs, missing input validation, security issues, and style drift; never edits files.
- **`agents/test-writer.md`** — write-capable worker (`Read, Grep, Glob, Write, Edit, Bash`, model `sonnet`). Writes or updates `node:test` + `supertest` tests to close gaps the reviewer finds, and runs the suite.
- **`commands/ship.md`** → `/ship` — the one-word workflow trigger. Runs two `code-reviewer` subagents in **parallel** (routes vs. db/tests), then a **dependent** `test-writer` pass that waits on both reviews before writing tests.
- **`skills/express-test-patterns/SKILL.md`** — conventions for writing tests against this API (status codes, error shape, edge cases to cover).
- **`hooks/hooks.json`** — a `PostToolUse` hook that lints any `.js` file just written or edited inside `course-api/`, via a bundled script (`hooks/scripts/lint-changed.js`) resolved with `${CLAUDE_PLUGIN_ROOT}`.

## Install

From a marketplace (this repo doubles as one):

```
/plugin marketplace add ktroch/claude-multi-agent-workflow
/plugin install code-quality@ktroch-marketplace
```

Or load it locally while developing:

```
cd claude-multi-agent-workflow
claude --plugin-dir .
```

## Try it against course-api

```
cd course-api && npm install
```

Then, in a Claude Code session with the plugin loaded, run:

```
/ship
```

This reviews `course-api/routes/`, `course-api/db/`, and `course-api/tests/` in parallel, then writes tests for whatever gaps the reviews surface.

See `NOTES.md` for the scoping and orchestration decisions behind this design.
