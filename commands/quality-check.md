---
description: Run a full code-quality check on course-api — review and tests in parallel, then a combined report.
---

Run a code-quality check on the `course-api` project:

1. In parallel, dispatch both:
   - the **code-reviewer** subagent to review the code in `course-api/` for bugs, style issues, and convention violations (read-only, no edits).
   - the **test-runner** subagent to run `npm test` and `npm run lint` in `course-api/`, fixing any failures it finds.

2. Once both have finished, combine their results into a single quality report: list the review findings (with severity) and the test/lint outcome (including anything test-runner fixed). Present this as one report to the user.
