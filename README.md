# quality-kit

A Claude Code plugin (and marketplace) that bundles a multi-agent **code-quality workflow** for Express APIs.

## What's inside

| Piece | Name | Purpose |
|---|---|---|
| Subagent | `code-reviewer` | Read-only reviewer (Read/Grep/Glob, sonnet). |
| Subagent | `test-writer` | Writes/edits tests and runs them (Write/Edit/Bash, haiku). |
| Command | `/quality-check` | Parallel review, then test writing, then lint/test verification. |
| Skill | `express-route-conventions` | Route conventions; fires when working on routes. |
| Hook | PostToolUse `Write` / `Edit` | Blocks leftover `console.debug`/`debugger` via `${CLAUDE_PLUGIN_ROOT}/scripts/post-edit-check.js`. |

## Install

```
/plugin marketplace add hernandezggg/claude-multi-agent-workflow
/plugin install quality-kit@quality-kit-marketplace
```

Local testing: `claude --plugin-dir .` then `/quality-kit:quality-check course-api`.

See `NOTES.md` for design decisions. A sample API to run against lives in `course-api/`.
