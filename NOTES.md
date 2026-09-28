# NOTES — `api-quality` plugin

## What it does

`api-quality` is a code-quality plugin for small Express APIs (built and tested against `course-api/`). It bundles:

| Component | Name (namespaced) | Role |
|---|---|---|
| Subagent | `api-quality:api-reviewer` | Read-only review of routes + store against the project's `CLAUDE.md` conventions; returns findings and a list of behaviours worth a regression test. |
| Subagent | `api-quality:coverage-scout` | Read-only inventory: maps every route branch (200/201/400/404) to the test that covers it. |
| Subagent | `api-quality:test-writer` | Writes the missing tests under `tests/` and runs `npm test`. |
| Command | `/api-quality:quality-check [dir]` | The workflow: reviewer ‖ scout → test-writer → verify & report. |
| Skill | `api-quality:express-api-conventions` | Route and test conventions (status codes, `{ "error": … }` shape, `node:test` + `supertest` style). |
| Hook | `PostToolUse` on `Write\|Edit\|MultiEdit` | Runs the project's own ESLint on any edited `.js` file (`${CLAUDE_PLUGIN_ROOT}/hooks/scripts/lint-on-edit.js`); lint errors are fed back to Claude (exit 2) so it fixes them. |

## Install

From Claude Code:

```
/plugin marketplace add Nintendiuk/claude-multi-agent-workflow
/plugin install api-quality@nintendiuk-plugins
```

Or from the shell: `claude plugin marketplace add Nintendiuk/claude-multi-agent-workflow` then `claude plugin install api-quality@nintendiuk-plugins`.

For local development, load it straight from a checkout: `claude --plugin-dir .` from the repo root, and `/reload-plugins` after edits.

Then, with the API's dependencies installed (`cd course-api && npm install`):

```
/api-quality:quality-check course-api
```

## Scoping decision — why each agent got its tools and model

The interesting split is between the two read-only agents.

- **`coverage-scout` → `Read, Grep, Glob` on `haiku`.** Its job is mechanical: list routes, list tests, match them up. There is no judgement call, so the cheapest, fastest model is enough, and because it only needs to *look* at files it gets read-and-search tools only. It also runs in parallel with the reviewer, so keeping it fast means it never becomes the slow half of Step 1.
- **`api-reviewer` → `Read, Grep, Glob` on `sonnet`.** Spotting a missing `NaN` check or a store object leaking by reference needs real reasoning, so it gets a stronger model — but still read-only tools. A reviewer that can edit tends to "just fix" things, which mixes review with change and hides findings from the user. Denying it `Edit`/`Write`/`Bash` guarantees its output is a report, nothing else.
- **`test-writer` → `Read, Grep, Glob, Write, Edit, Bash` on `sonnet`.** It is the only agent that changes files, and it needs `Bash` to run `npm test` and verify its own work. Its body further restricts it to `tests/` and forbids touching app code; bugs a test proves are marked `todo` and reported rather than fixed, so the user decides.

## Orchestration decision — parallel vs. sequential

- **Step 1 is parallel (reviewer ‖ scout)** because the two jobs are independent: both only *read* the same code, neither needs the other's output, and neither writes anything, so there is no risk of them interfering. Running them together cuts wall-clock time to the slower of the two.
- **Step 2 (test-writer) is sequential and depends on Step 1** because its work list *is* the union of Step 1's outputs — uncovered branches from the scout plus regression cases from the reviewer. Starting it earlier would mean guessing what to test, and it would also be editing `tests/` while the scout was reading them, producing a stale coverage map.
- **Step 3 (verify & report) depends on Step 2**: the orchestrator re-runs `npm test` itself instead of trusting the writer's summary, then reports before/after coverage and any known bugs.
