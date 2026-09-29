# shipcheck

A Claude Code plugin that runs a pre-merge quality gate over [`course-api/`](./course-api): it reviews route and data-layer code for bugs and convention drift, audits test coverage, and keeps the test suite in sync — all as one orchestrated workflow.

This repo is both the plugin and the marketplace that serves it.

## What's inside

| Component | Path | Purpose |
|---|---|---|
| Subagent (read-only) | `agents/api-reviewer.md` | Reviews `course-api` route/store code for bugs, security issues, and convention drift. Never edits files. |
| Subagent (writes) | `agents/test-writer.md` | Audits and writes `node:test`/`supertest` tests for `course-api`, and runs `npm test` to confirm they pass. |
| Workflow command | `commands/shipcheck.md` | `/shipcheck` — runs the reviewer and a coverage audit in parallel, then writes/updates tests in a dependent step. |
| Skill | `skills/api-conventions/SKILL.md` | Documents `course-api`'s REST conventions and test patterns so agents (and you) stay consistent. |
| Hook | `hooks/hooks.json` | Lints a file with ESLint right after it's edited or written. |

## Install

### Local development
```
cd course-api && npm install   # once, so the API/tests are ready to run
cd ..
claude --plugin-dir .
```
Then run `/shipcheck` inside the session. Use `/reload-plugins` after editing any plugin file.

### As a marketplace plugin
```
/plugin marketplace add <this-repo-url-or-path>
/plugin install shipcheck@shipcheck-marketplace
```

## Usage

Run `/shipcheck` to execute the full workflow: the reviewer and the test-coverage audit run in parallel, and once both finish, the test writer closes any gaps and adds regression tests for anything the reviewer flagged, then verifies the suite still passes.

See [`NOTES.md`](./NOTES.md) for the scoping and orchestration decisions behind this design.
