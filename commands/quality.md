---
description: Run the code-quality workflow on a path. Review and coverage mapping run in parallel, then tests are written for the gaps, then the suite is checked.
argument-hint: "[path, default: course-api]"
---

Run the code-quality workflow on: **$ARGUMENTS** (if empty, use `course-api/`).

Follow these steps in order. Do not skip ahead.

## Step 1 — Review and map coverage (in parallel)

These two jobs do not depend on each other, so start both at the same time, in a single message with two subagent calls:

- **code-reviewer** subagent: review every source file in the target and return its review report. The report must include:
  - a **Verdict** line (`SHIP`, `SHIP WITH FIXES` or `DO NOT SHIP`);
  - a **Findings** table with a severity (`high`, `medium` or `low`) for each finding;
  - a **Behaviors that need tests** list, one line per behavior (write "none" if empty).
- **coverage-mapper** subagent: map the target's source paths to its existing tests and return the coverage map and gap list.

Wait until both have returned before going on. If the reviewer's report is missing the Verdict, the severity findings or the "Behaviors that need tests" list, send it back to code-reviewer and ask for the missing sections before Step 2. Steps 2 and 4 depend on them.

## Step 2 — Write the missing tests (depends on Step 1)

Start the **test-writer** subagent. Give it, in its prompt:

- the target path;
- the full "Behaviors that need tests" list from the code-reviewer report;
- the full "Gaps" list from the coverage-mapper report.

It must not start until both Step 1 results are in, because its work list is built from them.

## Step 3 — Verify (depends on Step 2)

Run the target's test suite yourself (for `course-api/`: `cd course-api && npm test`) and confirm the result matches what test-writer reported.

## Step 4 — Report

Reply with one summary:

1. **Verdict** from the review, and the high- and medium-severity findings as a short table.
2. **Coverage**: number of gaps found and number now closed.
3. **Tests**: files changed and the final pass/todo count.
4. **Bugs found** by new tests, and the next fix you recommend.

Keep it short. Do not repeat the full subagent reports.
