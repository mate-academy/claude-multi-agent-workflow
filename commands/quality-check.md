---
description: Run the code-quality multi-agent workflow — parallel review + inventory, then dependent test writing
---

# Quality check workflow

Run a full code-quality pass against the target codebase (default: `course-api/`).

## Step 1 — Parallel discovery (run both at once)

Launch these two pieces of work **in parallel** — they do not depend on each other:

1. **code-reviewer** subagent — review routes, store, and server for validation, status codes, error shape, and convention issues. Ask it to return findings + test gaps.
2. A quick inventory (you can do this yourself with Glob/Grep, no subagent required) — list route files under `routes/` and matching test files under `tests/`, and note any route without a corresponding test suite.

Wait until **both** finish before continuing.

## Step 2 — Dependent test pass (sequential)

Only after Step 1 completes, launch the **test-writer** subagent with:
- the reviewer's findings and test-gap list
- the inventory of missing suites from Step 1

Instruct test-writer to add or fix tests for the high and medium items first, then re-run `npm test` in `course-api/`.

## Step 3 — Report

Summarize for the user:
- review findings (by severity)
- what tests were added or changed
- whether the suite is green

Do not skip the parallel step or start test-writer before the reviewer finishes — the writer needs those results.
