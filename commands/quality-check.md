---
description: Run the API quality workflow — parallel review, then tests for the gaps
argument-hint: [path to the API folder, default: current folder]
---

Run the API quality workflow on `$ARGUMENTS` (use the current folder if empty). Work inside that folder.

Step 1 — in parallel (these two do not depend on each other, launch both subagents at the same time in one message):
- the `route-reviewer` subagent: review every file in `routes/`
- the `docs-checker` subagent: compare `docs/api.md` with the routes

Step 2 — after Step 1 finishes (it needs the reviewer's "Tests to add" list):
- give the `test-writer` subagent the "Tests to add" list from `route-reviewer` and have it write those tests and run `npm test`.

Step 3 — report back in this order:
1. Review findings (from `route-reviewer`)
2. Docs status (from `docs-checker`)
3. Tests added and the `npm test` result (from `test-writer`), clearly marking any failing test as a real bug to fix.
