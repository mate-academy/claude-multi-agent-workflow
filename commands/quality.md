---
description: Run the quality workflow — parallel review + coverage scan, then write tests for the gaps.
argument-hint: "[path to API, default: course-api]"
---

Run the **quality-flow** workflow on the Express API at `$ARGUMENTS` (if empty, use `course-api`).

## Step 1 — in parallel (independent analysis)
Launch these two subagents **at the same time, in a single message with two Agent calls**, because
neither needs the other's output:
- `code-reviewer` — review `routes/`, `db/store.js` and `server.js` in the target directory against its `CLAUDE.md`.
- `coverage-scout` — map every endpoint in the target directory to its tests and list the gaps.

Wait until **both** have returned.

## Step 2 — sequential (depends on Step 1)
Only after Step 1 finishes, launch `test-writer` with the target directory **and the full text of both
reports** pasted into its prompt. It writes the missing tests under `tests/` and runs `npm test`.
Do not start this step early — it needs the review's "untested behaviours" and the scout's gap list.

## Step 3 — summarise (you, not a subagent)
Reply to the user with:
1. Top review findings (high severity first).
2. Tests added and the `npm test` result.
3. Any bugs exposed (tests marked todo) and a recommended next fix.

Keep the summary under 25 lines.
