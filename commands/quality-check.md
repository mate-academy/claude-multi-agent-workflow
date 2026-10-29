---
description: Review code and find test gaps in parallel, then write the missing tests and report.
argument-hint: "[path to project or file, e.g. course-api]"
---

Run a code-quality workflow on: $ARGUMENTS
(If no argument was given, use the current directory.)

Follow the `express-api-conventions` skill for what "correct" means in this codebase.

## Step 1 — in parallel

Launch these two subagents **at the same time, in a single message**. They are independent: neither needs the other's output.

- `code-reviewer` — review the target for bugs, validation gaps and convention violations.
- `test-gap-finder` — map the target's route behaviours to existing tests and list the missing ones.

Wait for both to finish before continuing.

## Step 2 — depends on Step 1

Launch the `test-writer` subagent. Pass it, verbatim:
- the `## Missing tests` section from `test-gap-finder`, and
- every `high` and `medium` finding from `code-reviewer`.

It must add the tests, run `npm test` in the target project, and report results. Do not start this step until Step 1 is complete — its input is Step 1's output.

## Step 3 — summarise (depends on Step 2)

Reply to the user with:
1. **Review verdict** — `READY` / `NEEDS WORK` and the high-severity findings.
2. **Tests added** — from `test-writer`.
3. **Test run** — pass/fail counts; for each failing test, whether it exposes a real bug from the review.
4. **Next step** — one sentence.

Do not modify application code yourself in this workflow.
