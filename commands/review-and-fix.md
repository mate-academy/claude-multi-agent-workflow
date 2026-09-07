---
description: Review course-api for code quality issues in parallel, then apply fixes.
---

Run a two-stage code quality workflow over `course-api/`:

1. **Parallel review (independent, run at the same time):**
   - Invoke the `code-reviewer` subagent on `course-api/routes/` and `course-api/db/`.
   - At the same time, invoke a separate `code-reviewer` subagent run on `course-api/tests/`.
   Neither review depends on the other, so run them in parallel and wait for both to finish.

2. **Dependent fix (runs only after step 1 completes):**
   - Combine the findings from both review runs into a single list.
   - Invoke the `code-fixer` subagent with that combined list so it can apply fixes.
   This step must wait for both parallel reviews to finish before it starts.

Finish by presenting the `code-fixer` subagent's summary of what was fixed.
