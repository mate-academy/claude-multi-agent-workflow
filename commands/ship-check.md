---
description: Review changed API routes and run the test suite in parallel, then sync the docs if the review found drift.
---

Run the code-quality workflow for the changes in this repo:

**Step 1 — run these two at the same time, they don't depend on each other:**
- Dispatch the `api-reviewer` subagent to review whatever route/handler files have changed (use `git diff` / `git status` to find them if it isn't obvious) against this project's conventions, and report its findings.
- Separately, run the project's test suite and linter (e.g. `npm test` and `npm run lint` in `course-api/`) directly and capture the results.

Do not wait for one before starting the other — they're independent checks on the same change.

**Step 2 — only after both of those finish:**
Look at what `api-reviewer` reported. If any finding says a route's behavior, status codes, or fields no longer match what `docs/api.md` describes, dispatch the `docs-syncer` subagent, telling it exactly which routes/files were flagged so it can update the doc. If the review didn't flag any doc drift, skip this step entirely — don't sync docs on every run, only when they're actually stale.

**Step 3 — report back to the user:**
Summarize in one pass: whether tests/lint passed, what `api-reviewer` found (or that it found nothing), and whether docs were updated and how. Keep it to what changed and what needs a human decision — don't repeat clean results back verbatim.
