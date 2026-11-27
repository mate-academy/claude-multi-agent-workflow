---
description: Review changed files for bugs, code smells, and complexity, then fix the issues found
argument-hint: "[file or folder paths]"
---

Review the changed files and then resolve the issues found, using this plugin's `review-code` and `resolve-issues` subagents. You coordinate the workflow. Leave the reviewing and fixing to the subagents.

Requested paths (may be empty): $ARGUMENTS

## Step 1: Find the changed files

First run `git rev-parse --show-prefix` to note where the current directory is within the repository. Then run every other Git command from the repository root, given by `git rev-parse --show-toplevel`, so that all file paths are relative to the root.

1. Find the point this branch started from with `git merge-base HEAD <branch>`. For `<branch>`, use the first of these that exists: `origin/HEAD`, `origin/main`, local `main`, or the repository's default branch. If none works, use `HEAD`.
2. List the files changed since that point, including staged and unstaged changes, with `git diff --name-only --diff-filter=d <base>`.
3. Add new untracked files from `git ls-files --others --exclude-standard`.
4. List deleted files separately with `git diff --name-only --no-renames --diff-filter=D <base>`. This includes the old paths of renamed files.
5. If paths were requested above, keep only the changed and deleted files that match them. A requested path is relative to the current directory, so add the prefix noted above. If it then matches no changed or deleted file, treat it as relative to the repository root.
6. Remove dependencies, lockfiles, generated files, and binary files from both lists.

If both lists are empty, say that there is nothing to review, and stop.

## Step 2: Review in parallel

Launch two `review-code` subagents at the same time, both in a single message. Give each one the full list of changed files, the list of files marked as deleted, the diff from the base commit including the deletions, and a note of which files are untracked and so have no diff. Ask them to check for imports and callers that the deletions break. Assign each a different focus:

- **Reviewer A:** report only bugs, including security problems.
- **Reviewer B:** report only code smells and complexity.

Wait for both to finish before continuing. If either one fails, run it again once. If it fails again, stop and report which review is missing.

## Step 3: Combine the findings

Merge the two lists into one:

- Combine findings that describe the same problem, keeping the higher severity.
- Where two recommendations conflict, keep the one that fixes the bug.
- Order from High to Low severity and number the findings from 1.
- Keep each finding's location, problem, recommendation, and any "Unconfirmed" or "Pre-existing" label.

Show the user this list. If it is empty, say that no issues were found, and stop.

## Step 4: Resolve the issues

This step depends on step 3. Launch a single `resolve-issues` subagent and give it the complete combined list. It cannot see the reviewers' results, so include every finding in full. Also give it the files in scope, which are the changed files from step 1. It reports findings marked "Pre-existing", and fixes that need an edit to any other file, as needing a decision.

Use only one resolver, so that two agents never edit the same file at once.

## Step 5: Report

Tell the user:

- how many findings were fixed, skipped, not fixed, or need a decision
- every finding that was not fixed, with the reason
- any decisions the user needs to make
- the test and lint results, and any fixes that could not be verified
- the files that were changed

Do not commit or push. The user reviews the changes first.
