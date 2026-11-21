---
description: Audit the codebase for code quality problems and fix them
argument-hint: [optional path to limit the scope]
---

Run the full code quality workflow: audit the code, merge the findings, fix them, and report. Follow the steps in order. Only the quality-fixer agent may change files.

Scope: if the user gave a path ($ARGUMENTS), limit the audit to that path and use a single quality-reviewer run for it. Otherwise audit the whole project as described below.

## Step 1: Audit and baseline (run in parallel)

These four jobs do not depend on each other, so start all of them at the same time, in a single message, and wait for all of them to finish:

- A quality-reviewer on the route and server code: `course-api/server.js` and `course-api/routes/`.
- A quality-reviewer on the data layer: `course-api/db/`.
- A quality-reviewer on the tests and docs: `course-api/tests/` and `course-api/docs/`.
- A baseline check: run `npm test` and `npm run lint` in `course-api/` and note whether each passes, before anything is changed.

Each reviewer returns findings in its standard format (`Q-01`, severity, `file:line`, problem, suggested fix, risk).

## Step 2: Merge the findings (waits for step 1)

Once every job from step 1 is back:

- Combine the three findings lists into one. Remove duplicates, renumber the findings, and order them by severity, highest first.
- If there are no findings, stop here and tell the user the code looks fine.
- If the baseline check was already failing, tell the user which check failed and ask whether to continue. The fixer cannot tell its own breakage from breakage that was already there.

## Step 3: Fix (waits for step 2)

Give the merged findings list to a single quality-fixer run. It must start only after step 2 is done, and it runs alone because it edits files. It fixes the findings in severity order and re-runs tests and lint.

## Step 4: Report (waits for step 3)

Show the user:

- The fixer's table: each finding marked fixed, skipped, or needs-human-decision.
- The files that changed.
- Test and lint results before and after.

Do not commit anything. Leave the changes in the working tree so the user can review them.
