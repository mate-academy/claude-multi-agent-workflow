---
description: Run the code quality workflow — parallel review and baseline checks, then tests and fixes
argument-hint: [target directory, default course-api/]
---

Run the code quality workflow on `$ARGUMENTS` (use `course-api/` if no argument was given).

**Step 1 — in parallel.** These three jobs are independent, so start them together in a single message:
- the `code-reviewer` subagent on the `routes/` directory
- the `code-reviewer` subagent on `db/` and `server.js`
- a baseline run of `npm test` and `npm run lint` in the target directory

**Step 2 — wait for all of Step 1, then merge.** Combine the two review reports and the baseline results into one list. Remove duplicates, sort by severity (high first), and show the user a short summary: how many findings, and whether the baseline tests and lint passed.

**Step 3 — sequential, depends on Step 2.** Hand the merged report to the `test-writer` subagent so it can add the missing tests and fix the reported defects. Do not start it before Step 2 is done.

**Step 4 — verify.** Run `npm test` and `npm run lint` again in the target directory and finish with a summary: found / fixed / left unfixed, and the final test and lint status.
