---
description: Run the quality-guard workflow — parallel code review, then dependent test writing, over the Express API.
argument-hint: [path-to-api-root]
---

Run the quality-guard multi-agent workflow against the API at `$ARGUMENTS` (default to `course-api/` if no path is given). Orchestrate it in three steps:

## Step 1 — Parallel review (independent, run together)

Dispatch the `code-reviewer` subagent **twice, in parallel, in the same message** — these two runs don't depend on each other, so launch them together rather than one after another:

- One `code-reviewer` run scoped to the route layer: `routes/` and `server.js`.
- One `code-reviewer` run scoped to the data layer: `db/`.

Wait for both to finish before moving on.

## Step 2 — Dependent test writing (waits on Step 1)

This step cannot start until both reviews from Step 1 are back, because it needs their combined findings as input.

Merge the "Untested paths" (and any "Bugs") sections from both `code-reviewer` reports into a single list of concrete gaps. Dispatch the `test-writer` subagent once, handing it that merged list, and have it write or update tests in `tests/` to cover the gaps, then run `npm test` to confirm the suite passes.

## Step 3 — Summary

Report back to the user with:
- The combined findings from both reviews (bugs, security, convention drift), grouped by area (routes vs. data layer).
- What `test-writer` added or changed, and the final `npm test` result.
- Anything still open (e.g. a real bug found that tests now demonstrate but that hasn't been fixed).

Keep the summary short and scannable — headings and bullets, not prose.
