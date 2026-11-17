# api-quality

A Claude Code plugin that runs a code-quality pass on an Express API. Two read-only subagents review the routes and map test coverage in parallel. A third writes the missing tests from both results, and the main session runs the suite. A lint hook keeps every edit clean, and a skill teaches Claude the project's testing conventions.

This repo is both the plugin and the marketplace that offers it.

## Install

```
/plugin marketplace add christopherjuhl/claude-multi-agent-workflow
/plugin install api-quality@christopherjuhl-plugins
```

Or try it from a local checkout without installing:

```sh
claude --plugin-dir /path/to/claude-multi-agent-workflow
```

## What it adds

| Component | Name | What it does |
|---|---|---|
| Command | `/api-quality:quality-pass [files]` | Runs the whole workflow on the given route files, or on changed files vs `main` (default). |
| Subagent | `api-quality:reviewer` | **Read-only** (Read, Grep, Glob), Sonnet. Reviews routes for validation, 404 handling, status codes, error shape and logic bugs, and returns `file:line` findings with the expected behaviour. |
| Subagent | `api-quality:test-gap-finder` | **Read-only**, Haiku. Maps every handler × status code to the test that covers it, and lists the gaps with a request that would trigger each one. |
| Subagent | `api-quality:test-writer` | **Read, Grep, Glob, Write, Edit**, Sonnet. Writes tests for the gaps in `tests/` only. Bugs flagged by the reviewer become `test.todo` instead of passing tests. It can't run commands. |
| Skill | `api-quality:api-tests` | Conventions for Express endpoint tests: `node:test` + supertest, `store.reset()` in `beforeEach`, one test per status code, `{ error }` assertions. It loads when you ask Claude to write or fix endpoint tests. |
| Hook | PostToolUse on `Edit\|MultiEdit\|Write` | Runs the project's own ESLint with `--fix` on each edited `.js` file. Errors it can't fix go back to Claude. It skips projects without ESLint. |

## The workflow

```
/api-quality:quality-pass routes/users.js

1. Scope         main session      changed files, or the files given
2. In parallel:  reviewer          → findings + verdict
                 test-gap-finder   → coverage gap table
3. Then:         test-writer       ← gaps + findings → new tests, todos for known bugs
4. Then:         main session      npm test + npm run lint (one fix round if a new test is wrong)
5. Report        scope, findings, coverage, tests added, next step
```

The workflow only reviews and adds tests; it never changes application code. When the test-writer edits a test file, Claude Code asks you to approve it, because subagent edits to test files count as sensitive.

## Try it on the included API

```sh
cd course-api && npm install
claude --plugin-dir ..
> /api-quality:quality-pass routes/users.js
```

Use `/reload-plugins` after editing the plugin's files.

## Layout

```
.claude-plugin/
  plugin.json          manifest (name, version)
  marketplace.json     marketplace catalog listing this plugin (source "./")
agents/                reviewer.md, test-gap-finder.md, test-writer.md
commands/              quality-pass.md
skills/api-tests/      SKILL.md
hooks/hooks.json       PostToolUse lint hook
scripts/               lint-edited-file.sh (referenced via ${CLAUDE_PLUGIN_ROOT})
course-api/            the Express API used to test the plugin
```
