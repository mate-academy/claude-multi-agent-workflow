---
description: Review recent course-api/ changes and fill in missing tests, in parallel, then summarize the combined result.
---

Run a ship-readiness check on `course-api/` by orchestrating the `code-reviewer` and `test-writer` subagents:

1. **Parallel step** — launch both subagents at the same time, since neither depends on the other's output:
   - `code-reviewer` to review the recent changes in `course-api/` for bugs, missing validation, and edge cases.
   - `test-writer` to find untested behavior in `course-api/` routes and write the missing tests, running the suite to confirm they pass.

2. **Dependent step** — wait for both subagents to finish, then combine their results into a single summary covering:
   - What the review found, grouped by severity (critical / missing validation / edge cases), and its overall verdict.
   - What tests were added or changed, and what behavior they now cover.
   - Whether the full test suite still passes after the new tests were added.

Present this as one combined report, not two separate outputs. If the review surfaced a critical issue that the new tests didn't already cover, call that out explicitly as follow-up work rather than treating the check as clean.
