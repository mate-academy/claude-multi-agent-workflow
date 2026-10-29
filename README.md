# code-quality-workflow

A Claude Code plugin that runs a multi-agent code-quality workflow. It is tested against the Express API in `course-api/`, and this repo is also the marketplace that offers it.

## What's inside

| Piece | Name | Purpose |
| --- | --- | --- |
| Subagent | `api-reviewer` | Read-only reviewer (`Read, Grep, Glob`, model `sonnet`). Checks routes and the store against the API conventions. |
| Subagent | `test-writer` | Writes and runs tests (`Write, Edit, Bash`, model `haiku`). Only touches `course-api/tests/`. |
| Command | `/code-quality-workflow:quality-check` | Runs both subagents in parallel, then lint + tests, then one combined report. |
| Skill | `api-conventions` | The API conventions, loaded when routes are added or changed. |
| Hook | `PostToolUse` on `Edit\|Write` | Lints edited `.js` files under `course-api/` via `scripts/lint-on-edit.sh`. |

## Install

```
/plugin marketplace add rezaparamarta/claude-multi-agent-workflow
/plugin install code-quality-workflow@code-quality-marketplace
```

## Use

```
/code-quality-workflow:quality-check
/code-quality-workflow:quality-check users routes only
```

The hook needs the API dependencies: `cd course-api && npm install`.

## Try it locally

```
cd course-api && npm install && cd ..
claude --plugin-dir .
```

Use `/reload-plugins` after editing plugin files.

## Layout

```
.claude-plugin/plugin.json        manifest
.claude-plugin/marketplace.json   marketplace catalog
agents/                           subagents
commands/                         workflow command
skills/api-conventions/SKILL.md   skill
hooks/hooks.json                  hook
scripts/lint-on-edit.sh           script run by the hook
course-api/                       the codebase the plugin is tested on
NOTES.md                          design decisions
```

See [NOTES.md](NOTES.md) for the scoping and orchestration decisions.
