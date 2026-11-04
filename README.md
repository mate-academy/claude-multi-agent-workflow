# code-quality

A Claude Code plugin that reviews an Express API, writes tests for what it finds, and catches syntax errors as you edit.

## What's inside

| Piece | Name | What it does |
|---|---|---|
| Command | `/code-quality:quality-check` | Runs the full workflow: two parallel reviews, then tests, then a summary |
| Subagent | `code-reviewer` | Read-only reviewer that reports bugs, validation gaps, and security issues |
| Subagent | `test-writer` | Writes and runs tests for the reviewer's findings |
| Skill | `express-conventions` | Shared rules for good Express routes |
| Hook | PostToolUse on Write/Edit | Runs `node --check` on edited `.js` files and flags syntax errors |

## Install

```
/plugin marketplace add Dcb7305/claude-multi-agent-workflow
/plugin install code-quality@chris-quality-tools
```

## Use

```
/code-quality:quality-check course-api
```

Pass any folder, or leave it blank to default to `course-api`.