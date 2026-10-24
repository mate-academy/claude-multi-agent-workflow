---
description: Run the full code-quality workflow on an Express API — parallel review and coverage scan, then write the missing tests and report.
argument-hint: "[path to the API folder, default: course-api]"
---

Run the api-quality workflow on the API in `$ARGUMENTS` (if empty, use `course-api`). Call that folder the **target**. Pass the target path to every subagent and ask it to write file paths in its answer starting from the repo root (e.g. `course-api/routes/users.js`).

## Step 1 — Review and scan (in parallel)

These two jobs are independent, so launch both subagents **in the same message** so they run at the same time:

- `code-reviewer` — review `routes/`, `db/` and `server.js` in the target. Ask for its findings list and its "Behaviours that need tests" list.
- `coverage-scout` — map every endpoint in the target to its tests. Ask for its coverage table and its "Missing tests" list.

Wait for **both** to finish before going on.

## Step 2 — Merge the work list (depends on Step 1)

Combine the reviewer's "Behaviours that need tests" and the scout's "Missing tests" into one de-duplicated list of test titles. If the list is empty, skip Step 3 and say there is nothing to add.

## Step 3 — Write the tests (depends on Step 2)

Launch `test-writer` with the target path and the merged list from Step 2. It adds the tests under `tests/` and runs `npm test`. Wait for its result.

## Step 4 — Report

Run `npm run lint` in the target, then reply to the user with:

1. **Review findings** — the reviewer's list, most severe first.
2. **Coverage** — the scout's table, updated to mark rows the test-writer just covered.
3. **Tests added** — files and titles, plus the `npm test` pass/fail line.
4. **App bugs exposed** — failing tests that point at application code, each with the fix the reviewer suggested. Do not fix application code yourself; leave that decision to the user.
