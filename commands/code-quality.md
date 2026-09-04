---
description: Run the full code-quality workflow against course-api — parallel reviews, then a dependent fix pass.
---

Run a code-quality pass over `course-api/` using the plugin's subagents, in this order:

## Step 1 — Review in parallel

Launch two `code-reviewer` subagents at the same time, since they read different, non-overlapping parts of the codebase and don't depend on each other:

- **Reviewer A** reads `course-api/routes/` and `course-api/db/store.js` and reports convention violations and logic bugs (missing `400`/`404` handling, wrong error shape, state held outside `db/store.js`, off-by-one or type bugs).
- **Reviewer B** reads `course-api/tests/` against those same routes and reports missing test coverage — error paths, edge cases, or routes with no test at all.

Wait for both reviewers to finish before moving on.

## Step 2 — Fix, depending on Step 1's results

Once both reviews are back, combine their findings into a single list and hand it to one `quality-fixer` subagent. This step cannot start until Step 1 completes, since the fixer needs the actual findings to act on — it doesn't go looking for problems itself.

The fixer applies the smallest correct edit for each finding, adds any regression tests the reviewers flagged as missing, and then runs `npm run lint` and `npm test` inside `course-api/` to confirm everything actually passes.

## Step 3 — Report

Summarize the run for the user: what each reviewer found, what the fixer changed or skipped and why, and the final lint/test result.
