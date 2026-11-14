---
description: Summarise the current branch as a per-file list plus risks, short enough to paste into a PR description. Fans out reviewers in parallel, then merges their results.
argument-hint: [optional base branch, default main]
---
Summarise the changes on the current branch, with a quick risk check on each part. The base branch is `$ARGUMENTS` if given, otherwise `main`.

## Step 0: Scope the work
Run `git diff --name-only <base>...HEAD`. Ignore lockfiles and generated files. If nothing changed, say so and stop. Split the remaining files into groups of related files (for example one group per folder, at most three groups). Run `git diff <base>...HEAD` and keep each group's slice of the diff.

## Step 1: Review each group, in parallel
The groups are independent of each other, so start one `code-reviewer` subagent per group in the same turn and let them run at the same time. Give each one only its own group's file list and diff (it is read-only and cannot run git). Ask each to return, for its files:
- a one-line description of what changed in each file
- any bugs or risks it sees, High/Medium/Low, with `file:line`

Wait until every reviewer has finished before moving on.

## Step 2: Merge the results (depends on Step 1)
Only now, combine the reviewers' answers. Do not write this from your own reading of the diff; use what came back.

1. **Changes:** one line per changed file, in the reviewers' words, as a single list.
2. **Risks:** all findings from every reviewer in one list, High first. Write "None found" if there are none.

Keep the whole result short enough to paste into a pull-request description.
