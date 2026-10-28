---
description: Review course-api/ for bugs and style issues across its core files in parallel, then apply the fixes in one dependent pass.
---

Run a full review-and-fix pass over course-api/.

Step 1 — Parallel review:
Dispatch three separate `code-reviewer` subagent runs at the same time, one per file, since each file is independent and none of these reviews depends on another:
- `course-api/routes/health.js`
- `course-api/routes/users.js`
- `course-api/db/store.js`

Each run returns its own findings list (file, line, problem, severity, suggested fix direction) for just that file.

Step 2 — Dependent fix pass:
Wait until all three parallel reviews have finished. Combine their findings lists into a single list. Only then dispatch one `fix-applier` subagent run, passing it the combined findings list. This step must not start until every review from Step 1 has returned — `fix-applier` needs the full picture, not a partial one, to avoid fixing issues it already saw duplicated across files or missing ones that arrive late.

Step 3 — Report:
Summarize what was found in Step 1 and what was fixed or skipped in Step 2, grouped by file.
