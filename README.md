# quality-gate

A Claude Code plugin that runs a code-quality workflow on a Node.js/Express API. One command reviews the code and maps test coverage in parallel, then has a test writer fill the gaps it found. A hook lints every JavaScript file Claude edits.

## Install

```
/plugin marketplace add GoVolodya/claude-multi-agent-workflow
/plugin install quality-gate@govolodya-plugins
```

This repo is both the plugin and its marketplace (`govolodya-plugins`). To try it from a local clone without installing, run `claude --plugin-dir .` from the repo root.

## What's inside

| Component | Name | What it does |
|---|---|---|
| Command | `/quality-gate:check [dir]` | The workflow: review and coverage analysis in parallel, then test writing, then one report with a PASS / NEEDS WORK verdict. |
| Subagent | `quality-gate:code-reviewer` | **Read-only** (`Read, Grep, Glob`, Sonnet). Reviews routes and handlers for bugs, validation gaps and wrong status codes or error shapes. Returns findings by severity with `file:line`. |
| Subagent | `quality-gate:coverage-mapper` | **Read-only** (`Read, Grep, Glob`, Haiku). Maps every endpoint to its tests (happy / 400 / 404) and lists the missing cases. |
| Subagent | `quality-gate:test-writer` | **Writes** (`Read, Grep, Glob, Write, Edit, Bash`, Sonnet). Adds tests for the missing cases, edits test files only, and runs `npm test` / `npm run lint` until they pass. |
| Skill | `quality-gate:api-test-conventions` | How tests are written in node:test + supertest projects: layout, `store.reset()`, naming, and which cases to cover. Fires when you ask for Express endpoint tests. |
| Hook | `PostToolUse` on `Edit\|MultiEdit\|Write` | Runs `scripts/lint-edited-file.cjs` through `${CLAUDE_PLUGIN_ROOT}`. It finds the nearest package with ESLint installed and runs `eslint --fix` on the edited file. Leftover problems go back to Claude. |

## Usage

Try it on the bundled example API:

```bash
cd course-api && npm install && cd ..
claude --plugin-dir .
```

```
/quality-gate:check course-api
```

```
Step 1 (parallel)   code-reviewer ─┐
                    coverage-mapper ┴─▶ Step 2 (depends on step 1)  test-writer ─▶ Step 3  report
```

You can also use the pieces on their own:
- Ask "what endpoints in course-api aren't tested?" and Claude uses `coverage-mapper`.
- Ask "review the routes in course-api" and Claude uses `code-reviewer`.
- Ask "add a test for the 400 case of POST /users" and the `api-test-conventions` skill applies.

After editing any plugin file, run `/reload-plugins`.

> **Note:** with `--plugin-dir .`, `course-api/` is inside the plugin's own folder, and Claude Code doesn't let a plugin's agents edit files there. The review and coverage steps still work, but `test-writer`'s writes are refused. To see the full workflow add tests, copy `course-api` somewhere outside the repo and run `/quality-gate:check` there, or install the plugin and use it on your own project.

## Layout

```
.claude-plugin/
  plugin.json            # manifest: name, version
  marketplace.json       # marketplace catalog listing this plugin (source "./")
agents/                  # code-reviewer, coverage-mapper, test-writer
commands/check.md        # the workflow command
skills/api-test-conventions/SKILL.md
hooks/hooks.json         # PostToolUse lint hook
scripts/lint-edited-file.cjs
course-api/              # example Express API to test the plugin against
NOTES.md                 # design decisions
```

## Versioning

Bump `version` in both `.claude-plugin/plugin.json` and the `marketplace.json` entry for each release. Users get the update with `/plugin marketplace update govolodya-plugins`.
