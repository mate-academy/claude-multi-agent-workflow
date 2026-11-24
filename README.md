# quality-gate

`quality-gate` is a Claude Code plugin for a pre-PR quality pass on Express APIs. In one command it does three things:
- reviews your routes;
- checks the API docs against the code;
- writes the tests the review says are missing.

This repo is both the plugin and the marketplace that serves it.

## Install

```
/plugin marketplace add airnovaeurope/claude-multi-agent-workflow
/plugin install quality-gate@airnovaeurope-tools
```

To try it locally without installing, run `claude --plugin-dir .` from this folder.

## What's inside

| Piece | Name | What it does |
|---|---|---|
| Command | `/quality-pass [path]` | The workflow. It runs `route-reviewer` and `docs-checker` **in parallel**, then `test-writer` **after them** on the reviewer's `UNTESTED:` list, and merges everything into one report. |
| Subagent | `route-reviewer` | Read-only (`Read, Grep, Glob`) and runs on Sonnet. It returns findings by severity and the list of untested behaviours. |
| Subagent | `docs-checker` | Read-only and runs on Haiku. It returns MATCH, MISMATCH or UNDOCUMENTED for each endpoint in `docs/api.md`. |
| Subagent | `test-writer` | Can edit (`Edit, Write, Bash`) and runs on Sonnet. It adds supertest tests and runs `npm test`. It never changes app code. |
| Skill | `api-conventions` | The house rules for endpoints: status codes, the `{ "error" }` shape, validation order and store-only data. It fires when writing or reviewing routes. |
| Hook | PostToolUse `Write\|Edit` | Runs ESLint on the `.js` file Claude just changed through `${CLAUDE_PLUGIN_ROOT}/scripts/lint-changed.sh`. It exits 2 with the errors so Claude fixes them. |

## Try it on the included API

```
cd course-api && npm install && cd ..
claude --plugin-dir .
/quality-gate:quality-pass course-api
```

## Layout

```
.claude-plugin/plugin.json        # name quality-gate, version 0.1.0
.claude-plugin/marketplace.json   # marketplace "airnovaeurope-tools", source "./"
agents/  commands/  skills/api-conventions/SKILL.md  hooks/hooks.json  scripts/lint-changed.sh
course-api/                       # the Express API used to test the plugin
```
