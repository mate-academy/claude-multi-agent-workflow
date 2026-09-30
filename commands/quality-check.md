---
description: Run the full code-quality workflow (review + tests + lint) on a path or the whole API
argument-hint: [path, default course-api/]
---

Run a code-quality workflow on `$ARGUMENTS` (default: `course-api/`). Follow these steps in order.

## Step 1 — Parallel
Launch these two subagents **at the same time, in a single message**, since neither needs the other's output:
- the `code-reviewer` agent: review the target code and report findings;
- the `test-writer` agent: add missing tests for the target code and run them.

## Step 2 — Sequential (wait for both)
Only after both agents have finished, run `npm run lint` in the project and collect its output. This depends on Step 1 because the test-writer may have added files that must be linted.

## Step 3 — Summary
Combine everything into one report: reviewer findings ranked by severity, tests added and their result, lint result, and a short list of recommended next actions. Do not fix reviewer findings unless the user asks.
