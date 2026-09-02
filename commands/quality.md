---
description: Run the full code-quality workflow against course-api — review, lint/test, then fix.
argument-hint: [path]
---

Run the code-quality workflow against `course-api/` (or against `$ARGUMENTS` if a path/file was given).

## Step 1 — Parallel: gather findings

Do these two things at the same time, since neither depends on the other:

- Launch the `code-reviewer` subagent to review the target code (routes, db, tests) for bugs, security issues, style violations, and missing test coverage. It should only report findings, not edit anything.
- Separately, run `npm run lint` and `npm test` from `course-api/` yourself to capture the current lint errors and any failing tests.

Wait for both to finish before moving on.

## Step 2 — Dependent: fix what was found

Once both results from Step 1 are in hand, combine them into one list of concrete problems: the reviewer's findings plus the lint errors and failing tests. Pass that combined list to the `quality-fixer` subagent and have it apply fixes, re-running `npm run lint` and `npm test` itself to confirm each fix actually resolved the problem. This step must wait for Step 1 — it needs the findings as input.

## Step 3 — Report

Summarize for the user: what was found, what was fixed, and anything `quality-fixer` flagged as needing a human decision instead of an automatic fix. Finish by reporting the final `npm run lint` / `npm test` status.
