---
description: Review and map the current branch's changes in parallel, then write a short PR-ready summary from both results.
---

Summarise the changes on the current branch.

## Step 1 — Collect the diff

Run `git diff --stat` against the base branch to list the touched files, then `git diff` for the full diff. If there are no changes, say so and stop.

## Step 2 — Analyse (parallel)

Start these two subagents at the same time, in a single message, and wait for both to finish. Give each one the list of touched files and the diff.

- **codebase-scout**: for each touched file, explain what it is for and what depends on it.
- **code-reviewer**: review the changed code for bugs and unclear names.

These two don't depend on each other, so don't run them one after the other.

## Step 3 — Write the summary (sequential, waits for step 2)

Read both reports, then write the summary. List each file that was touched with a one-line description of what changed in it, then add any bugs or risks the reviewer found. Keep the whole thing short enough to paste into a pull-request description.