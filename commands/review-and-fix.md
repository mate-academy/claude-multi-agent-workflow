---
description: Audit course-api routes/db conventions, then fix what's found
argument-hint: [path]
---

Orchestrate `api-reviewer` and `api-fixer` to bring `$ARGUMENTS` (default: `routes/` and `db/store.js`) in line with the conventions in CLAUDE.md.

**Step 1 — parallel audit.** Invoke two `api-reviewer` subagent calls at the same time (via the Agent tool, in a single message with both calls): one scoped to `routes/`, one scoped to `db/store.js`. Both are read-only and independent of each other — they must not edit anything, only return findings lists.

**Step 2 — dependent fix.** Once both audits above have returned, merge their findings into one list. This step depends on step 1's results and cannot start before both audits finish.
- If the merged list is empty, say so and stop — do not invoke api-fixer for a no-op.
- Otherwise invoke the `api-fixer` subagent with the exact merged findings list and have it apply fixes, run tests/lint, and report results.

**Step 3 — report.** Show the user the findings list briefly, then summarize what changed (or that nothing needed to change) in 2-3 sentences.
