# NOTES — api-quality plugin

## What it does

`api-quality` is a code-quality plugin for Express APIs. Its main entry point, `/api-quality:quality-check [path]`, runs three subagents as a workflow: a reviewer and a coverage scout look at the API at the same time, then a test writer turns their combined findings into new tests, runs the suite, and the command reports review findings, coverage, tests added and any app bugs those tests expose. An `express-api-conventions` skill gives Claude the project's rules for routes and tests, and a `PostToolUse` hook lints every JS file Claude writes or edits.

## How to install

From GitHub (as any user would):

```text
/plugin marketplace add Lemonch1ks/claude-multi-agent-workflow
/plugin install api-quality@lemonch1ks-plugins
```

For local development, from the repo root:

```bash
cd course-api && npm install && cd ..
claude --plugin-dir .
# then: /api-quality:quality-check course-api
# after edits: /reload-plugins
```

The hook needs Node on the PATH and only lints when the edited file sits in a project with ESLint installed (`course-api` after `npm install`).

## Scoping decision: who can write, and which model

- **`code-reviewer` and `coverage-scout` are read-only (`Read, Grep, Glob`).** Their job is to look, not to act. Taking away `Write`, `Edit` and `Bash` means a review can never "helpfully" patch application code, and it is safe to run them in parallel because neither can change the files the other is reading.
- **`coverage-scout` runs on Haiku, `code-reviewer` on Sonnet.** Mapping `router.get(...)` calls to `test(...)` titles is mechanical pattern matching, so the cheapest, fastest model is enough. Spotting a `NaN` ID reaching the store or a missing email check needs real reasoning about code paths, so the reviewer gets Sonnet.
- **`test-writer` is the only agent with `Write`, `Edit` and `Bash`.** It needs to create test files and run `npm test` to know the tests work. Its prompt limits it further to `tests/` only: if a new test fails because the app is wrong, it keeps the failing test and reports the bug instead of changing the route. Fixing app code is a decision left to the user.

## Orchestration decision: what runs in parallel vs in sequence

- **Step 1 is parallel.** The reviewer and the scout both only read the same code and neither needs the other's output, so running them together halves the wall-clock time.
- **Step 2 depends on Step 1.** The work list for tests is the union of the reviewer's "behaviours that need tests" and the scout's "missing tests". It cannot be built until both have returned, and merging them first avoids writing the same test twice.
- **Step 3 depends on Step 2.** The test writer needs the final, de-duplicated list. Running it earlier would mean it either guesses what to test or has to be re-run once the review finishes.
- **Step 4 (lint and report) runs last** so it reflects the files the test writer actually changed.
