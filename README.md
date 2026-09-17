# quality-guard

A Claude Code plugin that runs a two-agent code-quality workflow — parallel review, then a dependent fix-and-test pass — against an Express codebase. This repo is both the plugin and the marketplace that offers it.

## What's in it

- **`agents/code-reviewer.md`** — read-only reviewer (`Read`, `Grep`, `Glob`; model `opus`). Reads code, checks it against the project's own conventions, and returns a prioritized findings list. Never edits anything.
- **`agents/test-writer.md`** — fix-and-test worker (`Read`, `Grep`, `Glob`, `Write`, `Edit`, `Bash`; model `sonnet`). Turns findings into small code fixes and regression tests, then runs `npm test` / `npm run lint` to confirm.
- **`commands/qguard.md`** — the `/qguard` command. Runs two `code-reviewer` subagents in parallel over different parts of the codebase, waits for both, then runs `test-writer` once on the combined findings (a dependent step).
- **`skills/code-review-checklist/SKILL.md`** — the project-specific checklist (route/store separation, validation, status codes, error shape) both agents and any manual review should check first.
- **`hooks/hooks.json`** — a `PostToolUse` hook that lints a `.js` file inside `course-api/` right after Claude edits or writes it, surfacing eslint issues immediately instead of waiting for a review pass.

## Install

From any Claude Code session:

```
/plugin marketplace add kfhawas/claude-multi-agent-workflow
/plugin install quality-guard@kfhawas-marketplace
```

Or, to try it locally without publishing anything, from this repo's root:

```
claude --plugin-dir .
```

## Try it

This plugin is built and tested against the small Express API in `course-api/`:

```
cd course-api && npm install
```

Then, in a Claude Code session with the plugin loaded, run `/qguard` from the repo root. It reviews `course-api/routes/`, `server.js`, `db/store.js`, and `tests/` in parallel, then fixes what it safely can and adds tests for it.

See `NOTES.md` for the scoping and orchestration decisions behind the plugin.
