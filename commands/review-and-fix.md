Run a full code-quality review and fix workflow on this project. Execute in two phases:

**Phase 1 — Parallel review (run both simultaneously, do not wait for one before starting the other):**
- Invoke the `code-reviewer` subagent on all files in `routes/` — ask it to review every .js file there for convention violations, missing validation, wrong error shapes, and missing handler comments.
- Invoke the `code-reviewer` subagent on all files in `db/` — ask it to review every .js file there for correctness and any state leakage.

Wait for both reviews to complete before proceeding.

**Phase 2 — Sequential fix (depends on Phase 1 results):**
- Collect the numbered issue lists from both reviews into one combined list.
- If the combined list is empty or all entries say "No issues found", print: "Codebase is clean — no fixes needed." and stop.
- Otherwise, invoke the `code-fixer` subagent with the full combined issue list and let it apply fixes.

**Final summary (after Phase 2 completes):**
Print:
- Files reviewed (list them)
- Total issues found across both reviews
- Issues fixed vs skipped (from the fixer's summary)
