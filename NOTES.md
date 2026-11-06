# Notes

## What it does and how to install it

`code-quality` bundles a review-and-test workflow. The command `/code-quality:quality-check [path]` reviews code, runs the linter and the tests, and then writes tests for the behaviour nobody tested. A hook also lints every JavaScript file Claude edits.

Install it from this repo's marketplace:

```
/plugin marketplace add the-dsw/claude-multi-agent-workflow
/plugin install code-quality@oporto-plugins
```

For local development, run `claude --plugin-dir .` from the repo root. The hook needs the project's ESLint, so run `npm install` inside `course-api/` once.

## Scoping decision: why the reviewer is read-only

`quality-reviewer` gets only `Read`, `Grep` and `Glob`. Its job is to judge code, not to change it, and a reviewer that can also edit will be tempted to fix what it finds. Then the review and the fix blur together, and the person reading the report can no longer tell what was wrong in the first place. Limiting its tools makes the guarantee structural instead of relying on the prompt.

`test-writer` is the opposite. It needs `Write` and `Edit` to create tests and `Bash` to run them. Even so, its prompt limits it to test files and tells it to report a failing test as a bug instead of fixing the code or weakening the assertion.

Both use `sonnet`. Finding subtle bugs and deciding what is untested takes real judgment, and writing correct tests against live code does too. A smaller model would save little on a workflow that makes two focused calls.

## Orchestration decision: what runs in parallel and what waits

Step 1 runs the reviewer, the linter and the test suite in parallel. None of them needs another's output: each reads the same code and reports on its own. Running them together costs the time of the slowest one instead of the sum of all three.

Step 2, the `test-writer`, runs only after step 1 is finished. It depends on the reviewer's list of untested behaviour, and on any failing tests, so it cannot start earlier. Running it first would mean it guesses at gaps.

Step 3 runs the linter and the tests again, so the final report shows before and after. It must come last, since it has to include the tests the test-writer added.
