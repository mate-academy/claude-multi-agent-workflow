# api-quality

A Claude Code plugin that runs a multi-agent code-quality workflow on an Express API.

## What's inside

| Component | Name | Purpose |
|---|---|---|
| Subagent | `api-reviewer` | Read-only review against project conventions (sonnet) |
| Subagent | `coverage-analyst` | Read-only test-gap analysis (haiku) |
| Subagent | `test-writer` | Writes and runs tests (sonnet) |
| Command | `/api-quality:quality-check [dir]` | Runs review + gap analysis in parallel, then writes tests |
| Skill | `api-quality:api-conventions` | The API's conventions |
| Hook | PostToolUse `Write\|Edit` | Lints edited `.js` files via `scripts/lint-on-edit.sh` |

## Install

```
/plugin marketplace add douglax/claude-multi-agent-workflow
/plugin install api-quality@api-quality-marketplace
```

Or load locally from a checkout: `claude --plugin-dir .`

## Try it

```
cd course-api && npm install
cd .. && claude --plugin-dir .
> /api-quality:quality-check course-api
```

See [NOTES.md](NOTES.md) for design decisions.
