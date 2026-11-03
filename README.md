# api-quality — a Claude Code plugin

A code-quality workflow for small Express APIs: review the routes and the API docs in parallel, then write tests for every gap the review found.

## Install

```
/plugin marketplace add kostyaskiba-a11y/claude-multi-agent-workflow
/plugin install api-quality@kostya-skyba-plugins
```

Or load it locally while developing: `claude --plugin-dir <path to this repo>` (use `/reload-plugins` after edits).

## What's inside

| Component | Name | What it does |
|---|---|---|
| Command | `/api-quality:quality-check [folder]` | The workflow: `route-reviewer` + `docs-checker` in parallel → `test-writer` on the reviewer's list → one combined report. |
| Subagent | `route-reviewer` | Read-only (Read, Grep, Glob), Sonnet. Finds validation / 400 / 404 problems in `routes/` and lists the tests that would expose them. |
| Subagent | `docs-checker` | Read-only (Read, Grep, Glob), Haiku. Compares `docs/api.md` with the real routes. |
| Subagent | `test-writer` | Can write (Read, Grep, Glob, Write, Edit, shell), Sonnet. Adds `node:test` + `supertest` tests for the listed cases and runs `npm test`. |
| Skill | `api-error-format` | The `{ "error": "..." }` contract and when to use 400 / 404 / 201 / 204. |
| Hook | PostToolUse on `Write|Edit` | Runs ESLint on the edited `.js` file (`${CLAUDE_PLUGIN_ROOT}/scripts/lint-edited-file.js`) and feeds problems back to Claude. |

## Try it on the bundled API

```
cd course-api
npm install
claude --plugin-dir ..
> /api-quality:quality-check
```
