---
description: Run the code-quality workflow (review + test coverage in parallel, then regression tests and verification)
argument-hint: [path, defaults to course-api/]
---

Run a code-quality workflow on `$ARGUMENTS` (use `course-api/` if empty).

**Step 1 — in parallel.** In a single message, launch both subagents at the same time, since neither depends on the other:
- `code-reviewer`: review the target code and return ranked findings.
- `test-writer`: add tests for any untested route behaviour in the target.

**Step 2 — depends on step 1.** Wait for both to finish. Then launch `test-writer` again, giving it the reviewer's high and medium severity findings, and ask it to write regression tests that reproduce each one. Skip this step if there are no such findings.

**Step 3 — depends on step 2.** Run `npm test` and `npm run lint` in `course-api/`.

Finish with one combined report: the review findings, the tests added, and the test/lint results. Do not change non-test source code without asking.
