---
description: Review the current change and close its test gaps — runs the code-reviewer and a coverage baseline in parallel, then the test-author on the reviewer's findings.
argument-hint: "[branch, path, or nothing for the working-tree diff]"
---

# /quality-check

Run the full code-quality pass over a change. The target is `$ARGUMENTS` when given —
a branch name, a path, or a commit range — otherwise the uncommitted working-tree diff.

## Step 0 — Establish the target (blocking, do this first)

- If `$ARGUMENTS` is empty, use `git diff` plus `git status --porcelain` for the working tree.
- If it's a branch or range, use `git diff main...$ARGUMENTS`.
- If it's a path, scope everything below to that path.
- Print one line naming what's under review and the files it touches. If nothing changed, stop
  and say so.

## Step 1 — Parallel: review AND coverage baseline

Launch both of these **at the same time** in a single batch — they don't depend on each other:

1. **`code-reviewer`** on the target from Step 0. Pass it the diff and the list of changed
   files. Ask for its full report (Verdict / Findings / Test gaps).
2. **Coverage baseline** (run this yourself, no subagent): `cd course-api && npm test`, and
   list the files in `course-api/tests/`. Capture the current pass/fail count and which
   resources already have a test file. This is the "before" picture.

Wait for both to finish before continuing.

## Step 2 — Dependent: author the missing tests

This step **depends on Step 1** — it needs the reviewer's **Test gaps** list.

- If the reviewer's verdict is `fix first` for a correctness bug, surface that to the user now
  and ask whether to continue — a failing test against broken code is the point, but they
  should know.
- Hand **`test-author`** the **Test gaps** from Step 1, plus the baseline so it knows which
  test files already exist. Tell it to add exactly those tests and run the suite.

## Step 3 — Dependent: report

This step **depends on Step 2**. Produce one summary for the user:

- The reviewer's verdict and blocking findings (unresolved — this command doesn't fix code).
- Tests added, and the `npm test` count before (Step 1) vs. after (Step 2).
- Any code smells the test-author flagged.
- A clear next action: `ship`, or `fix these N things first`.
