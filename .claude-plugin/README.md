# code-quality

A Claude Code plugin that runs a small multi-agent code quality workflow against an Express API.

## What's inside
| Component | Namespaced name | Purpose |
|---|---|---|
| Agent | `code-quality:code-reviewer` | Read-only reviewer (Read, Grep, Glob; sonnet) |
| Agent | `code-quality:test-writer` | Writes tests under `tests/` and runs them (sonnet) |
| Command | `/code-quality:quality [path]` | Parallel review + baseline checks, then test writing, then a report |
| Skill | `code-quality:api-conventions` | Route, validation, and error-shape conventions |
| Hook | `PostToolUse` on Write/Edit | Lints edited JS files with ESLint (`hooks/lint-on-edit.js`) |

## Install
```
/plugin marketplace add kenu21/claude-multi-agent-workflow
/plugin install code-quality@code-quality-marketplace
```

## Try it locally
```
cd course-api && npm install
cd .. && claude --plugin-dir .
/code-quality:quality course-api
```
Use `/reload-plugins` after editing plugin files.
