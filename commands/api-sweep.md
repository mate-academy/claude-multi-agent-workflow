---
description: Run a full quality sweep of an Express API — parallel review + coverage scan, then a dependent fix-and-verify pass.
argument-hint: "[target-dir, default course-api]"
---

Run the `api-quality` plugin's full sweep against `$1` (default to `course-api` if no argument
is given). Orchestrate the three bundled subagents as a four-step workflow. Follow the step
order below exactly — steps 2a/2b run together, steps 3 and 4 each wait on what came before.

## Step 1 — Prep (sequential, do this yourself, no subagent)

Resolve the target directory. Confirm it exists and contains `routes/`, `tests/`, and
`CLAUDE.md`; if `CLAUDE.md` or `docs/api.md` is missing, note that the sweep will run against
undocumented conventions. This step just establishes what the two inspectors will read — it
produces no findings of its own.

## Step 2 — Inspect (PARALLEL — launch both in the same message)

Launch **both** of these subagents together, as two concurrent `Agent` tool calls in a single
message, not one after another:

- `api-reviewer` — review every route handler under `<target>/routes/` against the project's
  documented conventions. Ask it to return its numbered findings list.
- `test-gap-scout` — enumerate every route and every existing test under `<target>/tests/` and
  return the coverage matrix plus the uncovered-branch list.

These two run in parallel because they read disjoint concerns (convention compliance vs. test
coverage), touch no shared state, and neither one's output depends on the other's — there is
nothing to serialize. Running them together instead of back-to-back is what makes this step
fast.

## Step 3 — Fix (DEPENDENT — do not start until both Step 2 agents have returned)

This step cannot begin early: its input is the union of both reports from Step 2. Once you have
*both* the review findings and the coverage gap list:

1. Merge them into one prioritized worklist: `blocker` findings first, then `should-fix`
   findings, then uncovered branches from the coverage scan.
2. Hand that single merged worklist to `test-author` in one `Agent` call, asking it to add the
   missing tests, apply the low-risk convention fixes, and run `npm test` + `npm run lint` in
   `<target>`.

## Step 4 — Verify (DEPENDENT — do not start until Step 3 has returned)

After `test-author` reports back, launch `api-reviewer` one more time, scoped only to the files
`test-author` changed, to confirm each blocker/should-fix finding from Step 2 is actually
closed. This step also has to wait — there is nothing to verify until the fix step exists.

Finish by printing a short summary table: findings opened in Step 2, findings closed by Step 4,
anything still open and why (e.g. flagged by `test-author` as needing a human decision), and the
final `npm test` / `npm run lint` result.
