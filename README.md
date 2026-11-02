# code-quality plugin

A Claude Code plugin that runs a small multi-agent code-quality workflow, tested against the Express API in `course-api/`.

## What's inside

| Piece | Path | Purpose |
|-------|------|---------|
| Subagent | `agents/code-reviewer.md` | Read-only reviewer (`Read, Grep, Glob`) |
| Subagent | `agents/test-writer.md` | Writes and runs tests (`Write, Edit, Bash`, ...) |
| Command | `commands/quality-check.md` | `/code-quality:quality-check` - runs the whole workflow |
| Skill | `skills/quality-conventions/SKILL.md` | Route, validation, error and testing conventions |
| Hook | `hooks/hooks.json` | After a Write/Edit of a JS file in `course-api/`, lints it via `scripts/lint-changed.js` |

## Install

```
/plugin marketplace add <github-user>/claude-multi-agent-workflow
/plugin install code-quality@code-quality-marketplace
```

## Try it locally

```
cd course-api && npm install && cd ..
claude --plugin-dir .
/code-quality:quality-check course-api
```

See `NOTES.md` for the design decisions.
