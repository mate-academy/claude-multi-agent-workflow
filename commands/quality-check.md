---
description: Run the code-quality review-and-fix workflow against course-api — review and tests run together, then fixes are applied.
---

Run this workflow against `course-api/`:

1. Do these two things at the same time, since neither depends on the
   other:
   - Launch the `code-reviewer` subagent to review everything under
     `course-api/` for bugs, convention violations, and quality issues.
   - Run `npm test` and `npm run lint` inside `course-api/` and capture
     their output (pass/fail and any failure details).

2. Once both of those finish, launch the `code-fixer` subagent. Give it
   the reviewer's findings plus any failing tests or lint errors from step
   1, and have it apply the minimal fixes needed, then re-run `npm test`
   and `npm run lint` inside `course-api/` to confirm the fixes hold. This
   step has to wait for step 1 because it needs both the review findings
   and the test/lint results before it knows what to fix.

3. Summarize the run: what the reviewer found, what the fixer changed,
   and the final `npm test` / `npm run lint` result.
