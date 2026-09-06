---
name: ship-check
description: Run the full ship-check workflow on course-api — review the current change and close any test-coverage gaps it exposes — before opening a PR.
argument-hint: [path]
---
Run this as one workflow, over `$ARGUMENTS` if given, otherwise over the
current uncommitted diff in `course-api/`.

**Step 1 — parallel.** At the same time, launch both:
- the `code-reviewer` subagent, to review the change for bugs, missing
  error handling, unclear naming, and deviations from `course-api`'s
  conventions;
- the `test-writer` subagent, to check `course-api/tests/` against the
  change and note (without yet writing anything) which parts of the
  change aren't covered by an existing test.

These two don't depend on each other — reviewing the code doesn't need
to know what's covered by tests, and checking test coverage doesn't need
the review's findings — so run them concurrently rather than one after
the other.

**Step 2 — dependent.** Wait for both to finish, then combine their
output: for every **high** or **medium** finding from the code-reviewer
that is really a missing-test problem (the reviewer will flag these
explicitly) — plus every gap the test-writer already noticed on its own —
have the `test-writer` subagent write the missing test(s). This step can
only start once step 1's results are in, since it needs the review's
findings to know what to write tests for.

**Step 3 — report.** Once test-writer is done, run `npm test` inside
`course-api/` to confirm everything is green, and give a short summary:
what the review found (by severity), what tests were added or updated and
why, and the final test result.
