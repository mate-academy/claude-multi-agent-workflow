# NOTES

## What the plugin does

`code-quality-workflow` bundles a small multi-agent code quality pass for the `course-api` Express service:

- **`api-reviewer`** — a read-only subagent that reviews code against `course-api`'s own conventions (input validation, `400`/`404` handling, error shape, routes never holding state directly) plus general correctness/security issues.
- **`test-writer`** — a subagent that writes or updates tests in `tests/` for gaps the reviewer found, runs `npm test`, and reports rather than silently "fixing" a real application bug.
- **`/qa`** — the workflow command that orchestrates both.
- **`api-conventions`** skill — the project's conventions, loaded before any of the above touch `course-api/` code.
- **`lint-check` hook** — runs after every `Edit`/`Write` to catch lint issues as soon as they're introduced.

## Install

Locally, from the repo root:

```
claude --plugin-dir .
```

As a marketplace, from any Claude Code session:

```
/plugin marketplace add DenShysh/claude-multi-agent-workflow
/plugin install code-quality-workflow@claude-multi-agent-workflow
```

Then run `/qa` (optionally with a path/area argument) against `course-api/`.

## One scoping decision

`api-reviewer` gets `tools: Read, Grep, Glob` and `model: sonnet`; `test-writer` gets `tools: Read, Write, Edit, Bash, Grep, Glob` and `model: haiku`.

The reviewer only ever reads and reports — it never edits files — so it has no business holding write access, and judging whether something is a real bug versus an acceptable deviation from convention benefits from the stronger model. The test-writer's job is mechanical by comparison (follow the existing `tests/users.test.js` pattern, fill in the success/`400`/`404` cases) but it needs `Write`/`Edit` to create test files and `Bash` to run `npm test`/`npm run lint` and confirm the suite actually passes — a faster, cheaper model is enough for that.

## Why the workflow runs parallel then sequential

`/qa`'s Step 1 launches two `api-reviewer` instances in parallel — one on the users flow (`routes/users.js` + `db/store.js`), one on the app wiring (`server.js` + `routes/health.js`) — because those areas are independent of each other; there's no reason to make one review wait on the other.

Step 2 (test-writer) has to run after both reviews finish, because it needs their combined findings to know which edge cases actually lack coverage — it can't write meaningful tests for gaps it doesn't yet know about. So Step 1 is parallel (independent work), Step 2 is dependent (needs Step 1's output).
