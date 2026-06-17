---
description: Run a full code-quality pass — review the code and map test coverage in parallel, then write the missing tests.
---

# /quality-pass

Run a complete quality pass over the target code. If the user named files or a route, focus there; otherwise target the routes and data layer under `course-api/`.

Orchestrate the bundled subagents in two phases. **Do not do the work yourself — dispatch the subagents.**

## Phase 1 — Inspect (parallel)

Dispatch these two agents **at the same time, in a single message** — they share no state and must not wait on each other:

1. **`code-reviewer`** — review the target code for correctness bugs, missing validation, and convention violations. It returns a PASS / NEEDS WORK report with `file:line` findings.
2. **`code-reviewer`** (second, independent run) **or a coverage scan** — point it at the same source plus the existing `tests/` and ask specifically: *which behaviours have no test?* It returns a list of untested cases (happy path, `400` validation, `404` missing record, etc.).

Wait for **both** results before continuing.

## Phase 2 — Fix the gaps (dependent)

This phase **depends on Phase 1** — it must not start until both Phase-1 reports are in, because its input is their combined output.

Dispatch **`test-author`** once, handing it:
- the untested cases from the coverage scan, and
- any reviewer findings that a test could pin down (e.g. a wrong status code).

It writes/extends the test files and runs `npm test` to confirm green.

## Final summary

Report back to the user, concisely:
- the reviewer's verdict and its top findings,
- what `test-author` added and the resulting pass/fail counts,
- anything still open that a human should decide.
