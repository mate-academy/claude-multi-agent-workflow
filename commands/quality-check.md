---
description: Run the code-quality-kit workflow — parallel review + test-coverage check, then a combined report.
argument-hint: "[path or description of what changed, optional]"
---

Run the full code-quality workflow for this repo. Target scope: $ARGUMENTS (if empty, use the currently uncommitted/staged changes — check with `git status`/`git diff`; if there are none, ask the user which files to check).

**Step 1 — Parallel.** Dispatch both of these subagents in a single message so they run at the same time — neither needs the other's output to do its job:
- `code-reviewer`, to review the target files for correctness bugs, missed edge cases, and violations of this project's conventions.
- `test-writer`, to check whether the same target files have regression test coverage, add or update tests as needed (happy path, validation failure, missing-record), and run `npm test` in `course-api/` to confirm the suite passes.

Do not run these one after another — they touch overlapping code but don't depend on each other's findings, so launching them together halves the wall-clock time of the workflow.

**Step 2 — Dependent.** Only after both subagents above have returned, synthesize one combined report. This step cannot start earlier because it needs both results to do its real job — cross-referencing them:
- List `code-reviewer`'s findings, ordered by severity (blocker / warning / nit).
- List which tests `test-writer` added or updated, and the final `npm test` result.
- Explicitly call out any blocker or warning from `code-reviewer` that isn't covered by a test `test-writer` added — that gap is the most important thing in the report, and it only exists once you can compare both agents' output side by side.

Present the combined report to the user as the final output of this command.
