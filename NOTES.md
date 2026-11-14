# qa-kit notes

## What it does and how to install it

`qa-kit` is a Claude Code plugin for wrapping up a branch before a pull request. It adds:

- `/qa-kit:ship`: the one-word workflow. It reviews the branch, fills test gaps, writes regression tests for real bugs, and returns a PR-ready report with a verdict.
- `/qa-kit:summarize`: a per-file, one-line summary of the branch.
- `qa-kit:code-reviewer` and `qa-kit:test-writer`: the two subagents the workflow drives.
- `qa-kit:pr-description`: a skill that drafts a PR description when you ask for one.
- A `PostToolUse` hook that scans every file Claude writes or edits for hard-coded secrets and tells Claude to remove them.

Install from the marketplace in this repo:

```
/plugin marketplace add abdomostafa/claude-assemble-and-ship
/plugin install qa-kit@qa-kit-marketplace
```

To try local edits without installing, run `claude --plugin-dir .` from the repo root and use `/reload-plugins` after changes.

## Scoping decision: why `code-reviewer` is read-only

`code-reviewer` gets exactly `Read`, `Grep` and `Glob`. It has no `Write`, `Edit` or `Bash`, so it cannot even run git.

Why:

- **Its job is to report, not fix.** If the reviewer could edit, it would quietly "fix" what it found, and the report would stop describing what the author actually wrote. Keeping it read-only means a review can never change the code under review.
- **It gets the diff handed to it.** Because it can't run git, `ship` captures `git diff` and pastes it into the reviewer's prompt. That keeps the reviewer's tools to pure read-and-search, at the cost of the command doing a little more work.
- **The writer is the only agent that can write, and it is boxed in by instructions.** `test-writer` gets `Write`, `Edit` and `Bash` because it has to create test files and run them. Its prompt limits it to test files and tells it to report suspected bugs instead of fixing them. This is a prompt-level limit, not a tool-level one, so it is weaker than the reviewer's guarantee.

Both agents use `sonnet`. Spotting bugs needs real judgment, and writing correct tests is moderately hard, so the cheapest model seemed too risky for either. I did not add a cheaper `haiku` agent because no job in the plugin is mechanical enough to need one.

## Parallel versus sequential steps in `ship`

| Step | Mode | Why |
|------|------|-----|
| 0. List changed files | Sequential, first | Every later step needs the same file list, and giving both agents an identical list keeps them on the branch's changes. |
| 1. `code-reviewer` and `test-writer` | Parallel | Neither needs the other's output. The reviewer reads the files and the test-writer adds tests for uncovered code, so running them together saves the time of one whole agent run. |
| 2. Regression tests for High bugs | Sequential, after step 1 | It depends on the reviewer's findings, so it can't start earlier. It also waits for the test-writer, because both write to test files. Findings are handled one after another since they may touch the same file. |
| 3. Report | Sequential, last | It needs everything above. |

In a real run against a scratch copy of `course-api`, step 1 launched both agents in a single message and the report came only after both returned. Step 2 was skipped there, because the test-writer's step 1 tests already failed on both bugs. So that path has not been exercised yet.
