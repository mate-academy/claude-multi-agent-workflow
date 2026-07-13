# Implementation notes

## What the plugin does

Code Quality Flow provides a multi-agent workflow for reviewing current
repository changes, running tests and lint checks, fixing confirmed
implementation issues, and verifying whether a branch is ready for a pull
request.

## Install

Locally, without publishing, from the repo root:

    claude --plugin-dir .

Via a marketplace, once this repo is registered:

    /plugin marketplace add <owner>/<repo>
    /plugin install code-quality-flow@code-quality-marketplace

## Scoping decision: agent boundaries

`code-reviewer` never uses `Write` or `Edit`, so it cannot alter files during
Phase 1 while the independent test/lint check runs alongside it. It does use
`Bash`, though, to run `git diff`, `npm test`, and `npm run lint` for its own
inspection — those invocations are read-only in effect even though the tool
itself isn't restricted to read-only operations. `test-fixer` is the only
agent granted `Write`/`Edit`, and the workflow invokes it strictly after
Phase 2 consolidation, scoped to confirmed implementation issues only — never
during the initial review.

## Orchestration decision: parallel review, dependent fix

Phase 1 runs the `code-reviewer` agent and the local test/lint check in
parallel, since neither depends on the other's output and both are read-only.
Phase 3 (the `test-fixer` agent) is deliberately sequenced after Phase 2
consolidation, because it needs the merged, de-duplicated, severity-classified
findings as its input — fixing directly from raw, possibly-overlapping
reviewer and lint output would risk duplicate or contradictory edits.
