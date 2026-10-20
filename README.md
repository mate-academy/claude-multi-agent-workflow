# code-quality

A Claude Code plugin that reviews, checks, and formats JavaScript code with a multi-agent workflow. This repo is both the plugin and the marketplace that offers it.

## Install

In Claude Code:

```
/plugin marketplace add donci70/claude-multi-agent-workflow
/plugin install code-quality@donci70-plugins
```

To try it from a local clone without installing, run `claude --plugin-dir .` from the repo root.

## Usage

```
/code-quality:quality [path]
```

Runs the workflow on `path` (default: `course-api/`):

1. **In parallel:** `code-reviewer` reviews the code while `npm test` and `npm run lint` run.
2. **Then:** `code-formatter` fixes indentation, starting with files flagged in step 1.
3. **Then:** `npm test` runs again to confirm nothing broke.
4. You get a report: review findings by severity, test and lint results, and the files that were formatted.

The target project needs its dependencies installed (`npm install`), since the workflow and hook run its tests and ESLint.

## What's included

| Piece | Name | What it does |
|---|---|---|
| Subagent | `code-reviewer` | Read-only review for bugs, missing error handling, and unclear names (`Read, Grep, Glob`, `sonnet`) |
| Subagent | `code-formatter` | Fixes indentation to 2 spaces, whitespace only (`Read, Glob, Edit`, `haiku`) |
| Command | `/code-quality:quality` | Orchestrates the workflow above |
| Skill | `code-style` | Conventions for the course API: formatting, route layout, status codes, `{ "error": "message" }` responses, data access through `db/store.js` |
| Hook | `PostToolUse` on `Edit\|Write` | Lints each edited `.js` file with the project's ESLint and sends errors back to Claude to fix |

## Layout

```
.claude-plugin/
  plugin.json        plugin manifest (name, version)
  marketplace.json   marketplace catalog listing this plugin
agents/              code-reviewer.md, code-formatter.md
commands/            quality.md
skills/code-style/   SKILL.md
hooks/hooks.json     lint hook, runs ${CLAUDE_PLUGIN_ROOT}/scripts/lint-edited.js
scripts/             lint-edited.js
course-api/          Express API the plugin is built and tested against
```

See [NOTES.md](NOTES.md) for the scoping and orchestration decisions.
