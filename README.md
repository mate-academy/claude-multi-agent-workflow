# code-quality

A Claude Code plugin that runs a multi-agent code quality workflow against an Express API (`course-api/`).

## What's inside

| Piece | Name | Purpose |
|---|---|---|
| Subagent | `code-reviewer` | Read-only review against the project conventions (Read, Grep, Glob; sonnet) |
| Subagent | `test-writer` | Adds tests and minimal fixes, runs tests and lint (Read, Grep, Glob, Write, Edit, Bash; sonnet) |
| Command | `/code-quality:quality` | Runs the workflow: parallel review + baseline checks, then test-writer |
| Skill | `course-api-conventions` | The API's validation, error and data-access rules |
| Hook | PostToolUse `Edit\|Write` | Lints edited JS files in `course-api/` with ESLint |

## Install

```
/plugin marketplace add iryna-knyzh/claude-multi-agent-workflow
/plugin install code-quality@code-quality-marketplace
```

## Try it locally

```
cd course-api && npm install && cd ..
claude --plugin-dir .
/code-quality:quality course-api/
```

Use `/reload-plugins` after editing plugin files.

See [NOTES.md](NOTES.md) for the design decisions.
