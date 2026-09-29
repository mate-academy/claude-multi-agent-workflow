---
description: Run a full pre-PR check on the API — parallel review of routes and tests, then fill any coverage gaps found.
---
Run a pre-PR check on the current changes to this Express API. Orchestrate it in three steps:

**Step 1 — parallel review.** Launch two `code-reviewer` subagents at the same time, since neither depends on the other:
- one reviewing every changed file under `routes/` and `db/store.js` for bugs and convention violations
- one reviewing every changed file under `tests/` for gaps against the routes they're meant to cover

Wait for both to finish before moving on — step 2 needs their combined findings.

**Step 2 — dependent test fill-in.** Collect every "untested" or coverage-gap note from both step-1 reviews. If there are any, launch one `test-updater` subagent with that list, so it adds or updates the missing tests. This step must run after step 1 completes, not alongside it, since it needs step 1's findings as input. If step 1 found no coverage gaps, skip this step.

**Step 3 — summary.** Report a single pre-PR checklist: every review finding from step 1 grouped by severity (high/medium/low), which test file(s) step 2 touched (if it ran) and the resulting `npm test` outcome, and a final verdict — ready to open the PR, or what to fix first.

$ARGUMENTS may narrow the scope to specific files or a resource name; if given, apply it to both review passes.
