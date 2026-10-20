---
description: Run the code-quality workflow — review and check in parallel, then format, then verify.
argument-hint: "[path, defaults to course-api/]"
---
Run the code-quality workflow on $ARGUMENTS (if empty, use course-api/).

**Step 1 — in parallel (these are independent, so start them together):**
- Use the code-reviewer subagent to review the target for bugs, missing error handling, and unclear names.
- At the same time, run `npm test` and `npm run lint` in the target directory and capture the results.

**Step 2 — after Step 1 finishes (depends on its results):**
Use the code-formatter subagent on the target. Pass it any formatting or indentation problems the reviewer or the lint run reported, so it fixes those files first. Do not start this step until both Step 1 tasks have returned — the formatter edits files the reviewer and tests are reading.

**Step 3 — after Step 2 finishes:**
Re-run `npm test` to confirm formatting broke nothing.

**Finally, report to the user:**
1. Review findings, grouped by severity (from the code-reviewer).
2. Test and lint results before and after formatting.
3. Files the formatter changed.
Do not fix the reviewer's non-formatting findings yourself — list them for the user to decide.
