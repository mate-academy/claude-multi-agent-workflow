---
description: Run a full code-quality pass over course-api — parallel review, then a dependent fix-and-test pass.
---

Run a code-quality pass over `course-api/`.

## Step 1 — parallel review

Launch two `code-reviewer` subagents at the same time, independent of each other, so they run in parallel:

- Reviewer A scopes `course-api/routes/` and `course-api/server.js` — routing, input validation, and status-code conventions.
- Reviewer B scopes `course-api/db/store.js` and `course-api/tests/` — state-handling bugs and test-coverage gaps.

Neither reviewer needs the other's output, so do not wait for one before starting the other. Wait for both to finish before moving on.

## Step 2 — dependent fix-and-test pass

This step depends on Step 1's results, so it only starts once both reviews are back. Merge the two findings lists into one prioritized list (most severe first, de-duplicated). Then run the `test-writer` subagent once, passing it that combined list, and ask it to:

- apply the small, well-scoped fixes the reviews flagged;
- add or update tests in `course-api/tests/` covering what was found;
- run `npm test` and `npm run lint` inside `course-api/` to confirm everything passes.

## Step 3 — report

Summarize for the user, in plain language: what each reviewer found, what the test-writer fixed versus skipped (and why), and the final `npm test` / `npm run lint` status. Do not just paste the raw agent output — synthesize it into one readable summary.
