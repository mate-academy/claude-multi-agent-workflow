# code-quality-workflow

A Claude Code plugin that reviews Express route/store code for bugs and convention drift, then writes tests to cover whatever gaps it finds — two scoped subagents run together as one workflow.

This repo is both the plugin and the marketplace that offers it.

## What's inside

- **`agents/code-reviewer.md`** — read-only subagent (`Read`, `Grep`, `Glob`, `haiku`). Reviews route handlers or store code for bugs, missing validation, convention drift, and untested behavior. Never edits.
- **`agents/test-writer.md`** — writing subagent (`Read`, `Grep`, `Glob`, `Write`, `Edit`, `sonnet`). Adds or updates tests in `course-api/tests/` to cover gaps it's handed.
- **`commands/check.md`** — the `/check` workflow command. Runs `code-reviewer` twice in parallel (once over `routes/`, once over `db/store.js`), then feeds the merged findings to `test-writer` as a dependent step.
- **`skills/api-conventions/SKILL.md`** — the routing/validation/error-shape/test conventions from `course-api`, loaded before either subagent touches the code.
- **`hooks/hooks.json`** — a `PostToolUse` hook that lints any `course-api/*.js` file right after an `Edit` or `Write`, via the bundled `hooks/scripts/lint-check.js` (advisory only, never blocks).

## Install

From a fresh Claude Code session:

```
/plugin marketplace add <this-repo>
/plugin install code-quality-workflow@code-quality-marketplace
```

Or load it directly from a local checkout for development:

```
claude --plugin-dir .
```

## Use it

Against the API in `course-api/` (run `cd course-api && npm install` once first):

```
/check
```

This reviews `course-api/routes/` and `course-api/db/store.js` in parallel, then writes tests for whatever the reviews flag as untested or buggy.

You can also invoke either subagent directly by name — `code-reviewer` for a read-only pass, `test-writer` once you already know what needs covering.

See `NOTES.md` for the scoping and orchestration decisions behind this design.
