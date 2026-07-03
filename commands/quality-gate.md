---
description: Run the GQPlug quality gate over recent changes to the course API — review, lint, then close the test-coverage gaps the review found.
---

# /quality-gate

Orchestrate GQPlug's agents into one quality pass over the course API. Argument (optional): a file or route to focus on, e.g. `/quality-gate routes/users.js`. With no argument, work from the current git diff.

## Step 1 — Gather scope (sequential, first)
Determine what changed. Run `git diff --name-only` (and `git diff`) to list the touched files under `course-api/`. If an argument was given, narrow to that file/route. Summarise the scope in one line before continuing.

## Step 2 — Review and lint in parallel (independent work, run together)
Launch these two at the same time — they don't depend on each other:
- **api-reviewer** subagent: review the in-scope changes and return blocking issues, suggestions, and a list of untested behaviours (coverage gaps).
- **Lint**: run `npm run lint` inside `course-api/` and capture any ESLint findings.

Wait for both to finish before moving on.

## Step 3 — Write the missing tests (dependent — needs Step 2's output)
This step consumes the coverage gaps from the reviewer, so it must wait for Step 2.
- Hand the reviewer's coverage-gap list to the **test-author** subagent and have it write tests in `course-api/tests/` for each gap, then run `npm test` until green.
- If the reviewer reported a blocking correctness bug, surface it to the user for a decision **before** writing tests around the buggy behaviour.

## Step 4 — Report (sequential, last)
Produce one consolidated summary:
- Blocking issues (with `file:line`) and the lint findings from Step 2.
- New tests added and the final `npm test` pass/fail result from Step 3.
- A clear verdict: **pass** (no blocking issues, tests green) or **needs work** (with the shortest list of what to fix).
