---
description: Run the full code-quality workflow — parallel review and test-writing, then a combined summary — against changed files in the project.
---

Run the code-quality workflow for this repository (or for the files/paths the user names in `$ARGUMENTS`, defaulting to the currently changed/staged files if none are given).

## Step 1 — parallel: review and test-writing run at the same time

These two are independent of each other, so start them together, in parallel:

- Dispatch the **code-reviewer** subagent to review the target files for correctness bugs, convention violations, and missing edge cases. It is read-only and returns a findings report — it does not change any files.
- At the same time, dispatch the **test-writer** subagent to inspect the same target files, write or extend tests for any uncovered behavior (happy path, validation failures, missing-record cases), and run the test suite. It may create or edit test files.

Wait for both subagents to finish before moving on — do not start Step 2 until both results are in.

## Step 2 — dependent: combined summary (waits on both results above)

Using the outputs of both Step 1 subagents together, produce one combined report:

- List the code-reviewer's findings, most severe first.
- List the test cases the test-writer added, and whether the suite passed.
- Cross-check the two results: if the reviewer flagged a bug that the new tests do not cover, call that out explicitly as a gap — this is the reason this step must wait for both prior results rather than running earlier.
- End with a short verdict: is this change ready to merge, or what's blocking it.

This final step depends on both parallel results, so it must not start until Step 1 has fully completed.
