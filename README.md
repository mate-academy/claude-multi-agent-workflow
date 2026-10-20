# api-quality

A Claude Code plugin that runs a code-quality pass on an Express API. Two read-only subagents review the code at the same time. A third agent then writes tests for the gaps they found. Every `.js` file Claude touches is linted.

This repo is both the plugin and the marketplace that offers it.

## Install

```
/plugin marketplace add Leoshiva/claude-multi-agent-workflow
/plugin install api-quality@leoshiva-plugins
```

To develop locally, run from the repo root:

```
claude --plugin-dir .
```

## What's inside

| Piece | Name | What it does |
|---|---|---|
| Command | `/api-quality:quality-pass [path]` | The workflow: review + docs check in parallel, then tests for the gaps, then a report |
| Subagent | `route-reviewer` (sonnet, read-only) | Reviews `routes/` for validation, status codes, error shape, untested cases |
| Subagent | `docs-checker` (haiku, read-only) | Finds drift between `docs/api.md` and the implemented routes |
| Subagent | `test-writer` (sonnet, can write) | Adds the missing tests under `tests/` and runs `npm test` |
| Skill | `api-test-conventions` | How endpoint tests are written (node:test + supertest, naming, assertions) |
| Hook | PostToolUse `Write\|Edit` | Runs the project's ESLint `--fix` on edited `.js` files and reports anything it can't fix |

## Layout

```
.claude-plugin/
  plugin.json          # manifest (name, version)
  marketplace.json     # marketplace catalog listing this plugin
agents/                # route-reviewer, docs-checker, test-writer
commands/              # quality-pass
skills/api-test-conventions/SKILL.md
hooks/hooks.json       # references ${CLAUDE_PLUGIN_ROOT}/scripts/lint-edited-file.js
scripts/lint-edited-file.js
course-api/            # the Express API used to test the plugin
```

## Try it

```
cd course-api && npm install && cd ..
claude --plugin-dir .
> /api-quality:quality-pass course-api
```
