# NOTES

## What the plugin does and how to install it

`code-quality-crew` turns "is this code good and is it tested?" into one command. `/code-quality-crew:quality course-api` sends a reviewer and a coverage mapper over the code at the same time, hands both reports to a test writer that fills the gaps, re-runs the suite, and returns one short summary. A bundled skill tells the test writer how tests are written in this repo, and a `PostToolUse` hook lints every JavaScript file Claude writes or edits so lint errors are fixed right away instead of piling up.

Install it as a marketplace:

```
/plugin marketplace add ajhoward96-ops/claude-multi-agent-workflow
/plugin install code-quality-crew@aj-quality-tools
```

For local development, run `claude --plugin-dir .` from the repo root and use `/reload-plugins` after edits. To test against the bundled API, run `cd course-api && npm install` once.

## Scoping decision: why each subagent got its tools and model

**code-reviewer: `Read, Grep, Glob` on Sonnet.** A reviewer's value comes from being independent of the change. If it could edit, it would "fix" what it found and the user would lose the review as a separate check. Read-only tools also make it safe to run on any branch in parallel with other agents, since it can't race another agent's writes. It runs on Sonnet because review needs judgment: telling a real bug (string vs number IDs, a `404` that should be a `400`) from a style nit.

**coverage-mapper: `Read, Grep, Glob` on Haiku.** Mapping routes and branches to tests is mechanical: list handlers, grep the tests, mark matches. It doesn't need a stronger model, and Haiku keeps the parallel step cheap and fast. It deliberately has no `Bash`, so it can't "measure" coverage by running the suite while test-writer may later be changing test files.

**test-writer: `Read, Grep, Glob, Write, Edit, Bash` on Sonnet.** It is the only agent that changes files, and it is scoped by its instructions to test files only. It needs `Bash` to run `npm test` and prove its tests pass. It isn't allowed to fix application code: when a test exposes a bug it marks the test `todo` and reports it, so the plugin never ships a silent behavior change.

## Orchestration decision: parallel vs. sequence

**Step 1 is parallel** because the reviewer and the coverage mapper read the same code but don't need each other's output. Both are read-only, so running them together can't cause conflicting writes, and the step takes as long as the slower of the two instead of both added together.

**Step 2 is sequential (depends on Step 1)** because test-writer's work list is made from both reports: the reviewer's "behaviors that need tests" (what *should* be true) and the mapper's "gaps" (what *isn't* tested). Starting it early would mean writing tests without knowing about the bugs the reviewer found, or duplicating tests that already exist.

**Step 3 is sequential (depends on Step 2)** because verification only means something after the tests exist. The orchestrator runs the suite itself instead of trusting test-writer's report, so a subagent can't mark its own work as done.

## Testing log

- `node .github/scripts/validate-plugin.js` passes locally (same check as CI).
- The lint hook was tested by piping sample `PostToolUse` payloads into `hooks/scripts/lint-on-edit.js`: a clean file exits 0, a file with an ESLint error exits 2 with the error on stderr, and non-JS files are skipped.
