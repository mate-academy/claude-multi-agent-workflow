# api-quality

A Claude Code plugin that runs a small multi-agent code-quality workflow against an Express API.

## What's inside

| Component | Name | Purpose |
|---|---|---|
| Subagent | `api-reviewer` | Read-only reviewer (Read, Grep, Glob; sonnet) |
| Subagent | `test-writer` | Writes and runs tests (adds Write, Edit, Bash; haiku) |
| Command | `/api-quality:quality-check` | Orchestrates both agents: parallel review + lint/tests, then test writing |
| Skill | `api-conventions` | The API's routing, validation, error-shape and test conventions |
| Hook | `PostToolUse` on Write/Edit | Lints edited `.js` files via `scripts/lint-edited.js` |

## Install

```
/plugin marketplace add JoNo782/claude-multi-agent-workflow
/plugin install api-quality@api-quality-marketplace
```

## Try it locally

```
cd course-api && npm install && cd ..
claude --plugin-dir .
/api-quality:quality-check course-api
```

Use `/reload-plugins` after editing plugin files.

## Layout

```
.claude-plugin/plugin.json        manifest
.claude-plugin/marketplace.json   marketplace catalog
agents/                           subagents
commands/                         workflow command
skills/api-conventions/SKILL.md   skill
hooks/hooks.json                  hook (script via ${CLAUDE_PLUGIN_ROOT})
scripts/lint-edited.js            hook script
course-api/                       the Express API the plugin is tested against
```

See [NOTES.md](NOTES.md) for design decisions.
