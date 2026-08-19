# api-quality-kit

A Claude Code plugin that bundles a code-quality workflow for small Express APIs: a read-only reviewer and a test-writing agent, orchestrated by one command, backed by a shared conventions skill and a test-on-save hook. Built and tested against `course-api/` in this repo.

## What's in the plugin

- **`agents/api-reviewer.md`** — read-only subagent (`Read, Grep, Glob`, model `sonnet`). Reviews routes and data-access code for validation gaps, wrong status codes, and inconsistent error shapes. Never edits.
- **`agents/test-writer.md`** — writing subagent (`Read, Grep, Glob, Write, Edit, Bash`, model `sonnet`). Adds or fixes `node:test` + `supertest` tests for gaps the reviewer or a failing run surfaces, and re-runs the suite to confirm.
- **`commands/quality-check.md`** — the `/api-quality-kit:quality-check` workflow: runs the reviewer and `npm test`/`npm run lint` in parallel (step 1), then hands their combined output to `test-writer` as a dependent step (step 2), and summarizes (step 3).
- **`skills/api-conventions/SKILL.md`** — the route/status/error-shape and test conventions both agents and the command lean on, so review and test-writing stay consistent with each other.
- **`hooks/hooks.json`** — a `PostToolUse` hook that runs after any `Write`/`Edit` touching a `routes/`, `db/`, or `tests/` file: it runs that project's `npm test` and reports pass/fail inline, without blocking the edit. The bundled script is referenced via `${CLAUDE_PLUGIN_ROOT}` so it resolves regardless of where the plugin is installed.

## Install

From a marketplace (this repo doubles as one):

```
/plugin marketplace add <this-repo>
/plugin install api-quality-kit@tvairakt-marketplace
```

Or load it directly from a local checkout without a marketplace:

```
claude --plugin-dir .
```

## Try it

Against the included `course-api/`:

```
cd course-api && npm install && cd ..
claude --plugin-dir .
/api-quality-kit:quality-check
```

See `NOTES.md` for the scoping and orchestration decisions behind this design.
