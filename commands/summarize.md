---
description: Summarise the current branch as a per-file list, risks and test gaps, short enough to paste into a PR description. Runs reviewers and a coverage check in parallel, then merges the results.
argument-hint: [optional base branch, default main]
---
Summarise the changes on the current branch, with a quick risk check and a test-coverage check. The base branch is `$ARGUMENTS` if given, otherwise `main`.

## Step 0: Scope the work
Find everything that differs from the base, including work that is not committed yet. Let `<mb>` be the output of `git merge-base <base> HEAD`. Run `git diff --name-only <mb>` (committed, staged and unstaged changes to tracked files) and `git ls-files --others --exclude-standard` (new untracked files), and merge both into one list. Deleted files can be dropped. Ignore lockfiles and generated files. If nothing changed, say so and stop. Split the remaining files into groups of related files (for example one group per folder, at most three groups). Run `git diff <mb>` and keep each group's slice of the diff. Untracked files have no diff, so tell the reviewer to `Read` those whole.

## Step 1: Review and coverage check, in parallel
These jobs are independent of each other, so start them all in the same turn and let them run at the same time:

- One `code-reviewer` subagent per group.
- One `test-writer` subagent for the whole file list, in **report-only mode**: tell it explicitly not to create or edit any file and not to run anything that changes the repo. Ask it to return which changed code has no tests and which cases are missing (empty input, bad ids, failure paths). Use `/qa-kit:ship` if you want tests actually written.

Give each reviewer only its own group's file list and diff (it is read-only and cannot run git). Ask each reviewer to return, for its files:
- a one-line description of what changed in each file
- any bugs or risks it sees, High/Medium/Low, with `file:line`

Wait until every reviewer and the test-writer have finished before moving on.

## Step 2: Merge the results (depends on Step 1)
Only now, combine the answers from all the subagents. Do not write this from your own reading of the diff; use what came back.

1. **Changes:** one line per changed file, in the reviewers' words, as a single list.
2. **Risks:** all findings from every reviewer in one list, High first. Write "None found" if there are none.
3. **Test gaps:** the test-writer's list of untested code and missing cases. If a risk in step 2 has no test, say so next to it.

Keep the whole result short enough to paste into a pull-request description.
