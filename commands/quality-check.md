---
description: Review Express route files for convention and correctness issues, then write the tests that close whatever the review finds. Reviews run in parallel; test-writing waits for every review to finish.
argument-hint: "[route-file ...]"
allowed-tools: Task, Glob, Read
---

Orchestrate the two-step code-quality workflow below over `course-api/`.
Do not review or write tests yourself — every check and every edit happens
inside the subagents you launch.

## Determine targets

- If arguments were given (`$ARGUMENTS`), treat each one as a route file
  path relative to the repo root.
- Otherwise, use Glob to list every file matching `course-api/routes/*.js`
  and use all of them as targets.

## Step 1 — Parallel review

Launch the `api-reviewer` subagent once per target file, as a single batch
of parallel Task calls in one message — do not call them one after another.
The reviews are fully independent: `api-reviewer` is read-only, so running
several at once is safe. Wait for every review to return before moving on.

## Step 2 — Dependent test-writing

This step depends on all of Step 1's results, so it cannot start until
every review above has returned. Launch one `test-writer` subagent, passing
it the full list of target route files and the combined findings from every
reviewer in Step 1. Ask it to add or update the test file(s) under
`course-api/tests/` — one case per finding — and to run the suite to
confirm it passes before it returns.

## Step 3 — Report

Summarize for the user:

- per target file, the findings from Step 1;
- the test file(s) `test-writer` touched, which finding each new test
  covers, and the final `npm test` result from Step 2.

If `test-writer` reports a finding it couldn't close with a test (for
example, because it points at a real bug in the route rather than a
missing test), call that out separately — it still needs a human fix and
should not be reported as resolved.
