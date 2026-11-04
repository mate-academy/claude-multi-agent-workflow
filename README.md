# qa-crew

A small QA team for course-api: a read-only reviewer and a test writer, run together by one command.

## What it does

`/qa-crew:check <file>` runs two subagents in parallel on one course-api file, then runs the full test suite once and returns a single report: review findings by severity, the test files added or changed, and the pass/fail result. It never commits anything.

## What's inside

- **`code-reviewer` agent** - read-only (Read, Grep, Glob). Reviews a file for bugs, missing error handling and unclear names.
- **`test-writer` agent** - can edit and run commands (Edit, Write, Bash). Adds missing tests in the project's house style.
- **`/qa-crew:check` command** - runs both agents in parallel, then the test suite, then writes the combined report.
- **`course-api-tests` skill** - the house test style: node:test, supertest, one file per resource, flat `test()` cases covering success, 400 and 404.
- **PreToolUse hook** - blocks `git push` to main (`scripts/block-push-main.js`, referenced via `${CLAUDE_PLUGIN_ROOT}`).

## Try it locally

From the repo root:

```
claude --plugin-dir .
```

Then run `/qa-crew:check course-api/routes/users.js`. Use `/reload-plugins` after edits.

## Install it

```
/plugin marketplace add aleekx1981-cpu/claude-multi-agent-workflow
/plugin install qa-crew@alex-plugins
```
