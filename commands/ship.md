---
description: Pre-PR check. Reviews the branch, fills test gaps, adds regression tests for real bugs, and returns a PR-ready report.
argument-hint: [optional base branch, default main]
---
Run a pre-PR check on the current branch. The base branch is `$ARGUMENTS` if given, otherwise `main`.

## Step 0: Scope the work
Find everything that differs from the base, including work that is not committed yet. Let `<mb>` be the output of `git merge-base <base> HEAD`. Run `git diff --name-only <mb>` (committed, staged and unstaged changes to tracked files) and `git ls-files --others --exclude-standard` (new untracked files), and merge both into one list. Deleted files can be dropped. Make one list of the changed source files (ignore lockfiles, generated files and existing tests). If the list is empty, say there is nothing to check and stop. Also run `git diff <mb>` and keep the output (untracked files have no diff; the reviewer must `Read` them whole). Pass the exact file list to every subagent below so none of them wanders, and paste the diff into the `code-reviewer` prompt (it is read-only and cannot run git).

## Step 1: Review and test gaps, in parallel
These two jobs do not depend on each other, so start both in the same turn and let them run at the same time:

- **`code-reviewer` subagent:** review only the files on the list from Step 0 and return its findings grouped High, Medium, Low.
- **`test-writer` subagent:** find changed code on the list that has no tests, write tests for it, run them, and return what it added and the result.

Wait until both have finished before moving on.

## Step 2: Regression tests for real bugs (depends on Step 1)
Read the reviewer's High findings. For each one that is a genuine bug (not style or naming), hand it to the `test-writer` subagent with the `file:line` and the problem, and ask for a test that fails because of that bug. Do this one finding after another, since they may touch the same test file. Do not fix the bug yourself. If there are no High bugs, skip this step.

Also skip a finding if Step 1's tests already fail for the same reason; mention that instead.

## Step 3: Report
Write a short PR-ready report:

1. **Summary:** each changed file with a one-line description of the change.
2. **Review:** the reviewer's findings, High first. Mark which ones now have a failing regression test.
3. **Tests:** files added, the command run, and pass/fail counts. Say plainly if anything fails.
4. **Verdict:** "Ready to open the PR" only if there are no High findings and the tests pass. Otherwise list what to fix first.
