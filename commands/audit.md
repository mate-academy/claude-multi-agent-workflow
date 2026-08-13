---
description: Run the full code-quality workflow over course-api — a parallel review of the routes and data layers, then a dependent fix-and-verify pass.
argument-hint: "[optional focus, e.g. a route name]"
---

Run a code-quality audit of `course-api/`. If the user gave a focus in $ARGUMENTS, scope both review passes to it; otherwise review the whole app.

## Step 1 — Parallel review

Launch two `code-reviewer` subagents at the same time, working independently:

1. One reviewing everything in `course-api/routes/` against the conventions in `course-api/CLAUDE.md`.
2. One reviewing `course-api/db/store.js` and `course-api/server.js` for the same categories of issues.

These two reviews don't depend on each other — run them concurrently and wait for both to return their findings before moving on.

## Step 2 — Dependent fix-and-verify

This step depends on Step 1 and must not start until both reviews are back. Combine the findings from both `code-reviewer` runs into one list, then launch a single `test-fixer` subagent and give it:

- The combined findings from Step 1.
- An instruction to first run `npm test` and `npm run lint` inside `course-api/` to see the current, real failures before changing anything.

The `test-fixer` subagent should fix the blocking issues, add missing test coverage, and re-run `npm test` and `npm run lint` until both pass — or clearly report what's still failing and why.

## Step 3 — Report

Print one final summary combining: the findings from both Step 1 reviews, what `test-fixer` changed in Step 2, and the final `npm test` / `npm run lint` status.
