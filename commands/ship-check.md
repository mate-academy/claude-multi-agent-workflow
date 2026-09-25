---
description: Run the full code-quality gate on course-api before shipping — parallel review + test run, then a dependent fix pass.
---

Run a ship-readiness check on the Express API in `course-api/`, orchestrating the plugin's two subagents as a workflow.

## Step 1 — parallel: gather findings

Run these two independent checks **at the same time**, since neither depends on the other:

- Launch the `code-reviewer` subagent to review everything under `course-api/routes/`, `course-api/db/`, and `course-api/server.js` for correctness bugs and convention violations (see the `api-conventions` skill for the rules it checks against).
- In parallel, run `npm test` and `npm run lint` inside `course-api/` directly (via Bash) to capture the current test and lint output.

Wait for both to finish before moving on.

## Step 2 — dependent: fix what's broken

This step depends on Step 1's results, so it only starts once both parallel checks are done.

- Collect the `code-reviewer` findings and the `npm test` / `npm run lint` output from Step 1.
- If there's anything to fix, launch the `code-fixer` subagent with that combined input (reviewer findings + failing tests/lint output) and have it patch `course-api/` accordingly. The fixer will re-run `npm test` and `npm run lint` itself to confirm its changes work.
- If Step 1 found nothing wrong, skip the fixer and say so.

## Step 3 — report

Summarize the outcome: what the reviewer found, what was broken in tests/lint, what the fixer changed, and the final test/lint status. State clearly whether `course-api/` is ready to ship.
