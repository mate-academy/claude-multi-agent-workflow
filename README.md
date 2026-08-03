# api-qa

A Claude Code plugin that runs a multi-agent QA workflow on an Express API: audit every route file **in parallel**, then hand the combined findings to a test-writing agent. This repo is both the plugin and the marketplace that serves it; the API it was built and tested against lives in `course-api/`.

## Install

```
/plugin marketplace add lboetzle/claude-multi-agent-workflow
/plugin install api-qa@lboetzle-plugins
```

Or load it straight from a checkout: `claude --plugin-dir .`

## What it bundles

| Component | Name | What it does |
|---|---|---|
| Command | `/api-qa:qa-flow [path]` | The workflow trigger: one `route-auditor` per route file in parallel → merge findings → one `test-writer` fills the coverage gaps → report. |
| Subagent | `route-auditor` | Read-only (Read/Grep/Glob, Haiku). Audits a single route file against the API's conventions and returns a findings list. |
| Subagent | `test-writer` | Read/write (Edit/Write/Bash, Sonnet). Takes the audit's list of missing test cases, adds exactly those tests, and runs `npm test`. |
| Skill | `api-conventions` | The house rules (route layout, store access, error shape, test style) so any API change lands in the right style. |
| Hook | `PostToolUse` on `Edit\|Write` | Runs `scripts/lint-fix.js` (via `${CLAUDE_PLUGIN_ROOT}`): ESLint `--fix` on every edited `.js` file; unfixable errors are fed back to Claude. |

## Try it

```
cd course-api && npm install && cd ..
claude --plugin-dir .
> /api-qa:qa-flow course-api
```

See `NOTES.md` for the scoping and orchestration decisions.
