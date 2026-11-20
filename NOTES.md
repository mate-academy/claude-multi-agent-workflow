# NOTES — quality-flow

## What it does
`quality-flow` is a code-quality plugin for Express APIs. `/quality-flow:quality <dir>` runs three subagents:
`code-reviewer` and `coverage-scout` analyse the API in parallel, then `test-writer` turns their findings
into new tests and runs `npm test`. A skill (`api-test-conventions`) tells the writer how tests are written
in this codebase, and a PostToolUse hook syntax-checks every `.js` file Claude writes or edits.

## How to install
```text
/plugin marketplace add 2005igor2023-crypto/claude-multi-agent-workflow
/plugin install quality-flow@quality-flow-marketplace
```
Then, in a project with an Express API (e.g. this repo): `/quality-flow:quality course-api`.
For local development: `claude --plugin-dir .` from the repo root, `/reload-plugins` after edits.

## Scoping decision: tools and models
- **`code-reviewer` — `Read, Grep, Glob`, model `sonnet`.** A reviewer that can edit tends to "just fix"
  things, which hides findings and mixes review with change. Read-only tools make its output a report the
  user can trust and act on. Spotting subtle validation bugs needs real reasoning, so it gets sonnet.
- **`coverage-scout` — `Read, Grep, Glob`, model `haiku`.** Matching `router.get(...)` lines to
  `test(...)` calls is mechanical pattern work; haiku is fast and cheap enough, and it runs alongside the
  reviewer so it should not be the bottleneck.
- **`test-writer` — `Read, Grep, Glob, Write, Edit, Bash`, model `sonnet`.** It is the only agent that
  changes files, and it needs `Bash` solely to run `npm test` to prove the tests pass. Its body restricts
  writes to `tests/` and forbids touching app code — if a test exposes a bug it is marked `todo` and
  reported, so the workflow never silently "fixes" the app.

## Orchestration decision: parallel vs sequential
- **Parallel (Step 1):** the review and the coverage map read the same code but neither needs the other's
  output. Running them in one message with two Agent calls halves wall-clock time, and each gets its own
  clean context.
- **Sequential (Step 2):** `test-writer` depends on both reports — the reviewer's "untested behaviours"
  (bug-driven cases) and the scout's gap list (coverage-driven cases). Starting it earlier would mean
  guessing what to test, so the command waits for both before launching it.
- **Summary (Step 3)** is done by the main agent, which is the only one that has seen all three results.

## Local test log
- `node .github/scripts/validate-plugin.js` → "Plugin structure looks complete ✓".
- `claude plugin validate .` → no errors; lists `quality-flow:code-reviewer`, `quality-flow:coverage-scout`,
  `quality-flow:test-writer`, `quality-flow:quality`, `quality-flow:api-test-conventions` and the PostToolUse hook.
- `claude -p --plugin-dir . "/quality-flow:quality course-api"`: the main agent launched `code-reviewer` and
  `coverage-scout` in **one message** (parallel), waited for both, then launched `test-writer` with both reports.
  The reviewer found real issues in course-api: no JSON 404/error handler, non-numeric ids give 404 instead of 400,
  validation ignores types, duplicate emails are allowed, and the store returns live references.
- In headless (`-p`) mode the session's permission rules denied the test-writer's file writes, so run the
  write step interactively and approve the edits. That run also showed the writer trying to write through a Bash
  heredoc, so its body now limits Bash to running `npm test`.
- Hook script verified directly: invalid JS → exit 2 with the syntax error; valid JS / non-JS → exit 0.
- `course-api`: `npm test` → 5/5 passing.
