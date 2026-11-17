# api-quality — a Claude Code plugin

One command that reviews an Express API, maps which behaviours have no test, and writes the missing tests, run by three scoped subagents as a multi-agent workflow.

This repo is both the plugin and the marketplace that offers it.

## Install

```text
/plugin marketplace add milangit/claude-multi-agent-workflow
/plugin install api-quality@milan-plugins
```

On Claude Code 2.1.275 or later you can do it in one step:

```text
/plugin install api-quality --marketplace milangit/claude-multi-agent-workflow
```

To try it from a local clone without installing:

```bash
claude --plugin-dir .
```

## Usage

```text
/api-quality:quality              # run on the current project
/api-quality:quality course-api   # run on a sub-folder
```

The command runs:

```
            ┌─ api-reviewer    (read-only, sonnet) ─┐
Step 1  ────┤                                        ├──► Step 2  test-writer (writes tests, sonnet)
 parallel   └─ test-gap-scout  (read-only, haiku)  ─┘           │
                                                                ▼
                                                      Step 3  npm test + lint, final report
```

Application code is never changed. If a new test exposes a real bug, the test is kept as `todo` and the bug goes into the report for a person to decide on.

## What's inside

| Component | Path | Namespaced name | Purpose |
|-----------|------|-----------------|---------|
| Subagent | `agents/api-reviewer.md` | `api-quality:api-reviewer` | Read-only correctness and conventions review of routes and store |
| Subagent | `agents/test-gap-scout.md` | `api-quality:test-gap-scout` | Read-only map of endpoint × status code → covered / missing |
| Subagent | `agents/test-writer.md` | `api-quality:test-writer` | Writes tests under `tests/` only, runs `npm test` and `npm run lint` |
| Command | `commands/quality.md` | `/api-quality:quality` | Runs the workflow above |
| Skill | `skills/express-api-conventions/SKILL.md` | `api-quality:express-api-conventions` | House rules for routes, status codes, error shape and the test pattern; preloaded into the reviewer and the test writer |
| Hook | `hooks/hooks.json` → `hooks/scripts/lint-on-edit.js` | PostToolUse `Write\|Edit\|MultiEdit` | Runs the project's own ESLint on every edited `.js` file and sends errors back to Claude |

The hook does nothing outside projects that have an ESLint config and a local `node_modules/.bin/eslint`, and it reports only errors, not warnings.

## Requirements

- Claude Code with plugin support
- Node.js on `PATH` (for the hook)
- A target project that runs tests with `npm test` and lints with `npm run lint` (the included `course-api/` does both)

## Repository layout

```
.claude-plugin/
  plugin.json         # plugin manifest (name, version)
  marketplace.json    # marketplace catalog listing this plugin (source "./")
agents/               # subagents
commands/             # workflow command
skills/               # skill
hooks/                # hooks.json + bundled script
course-api/           # sample Express API to test the plugin against
NOTES.md              # design notes: scoping and orchestration decisions
ASSIGNMENT.md         # original course brief
```

## Versioning

The version lives in `.claude-plugin/plugin.json` and is mirrored in `marketplace.json`. Bump both when releasing; installed users get the update with `/plugin marketplace update milan-plugins`.
