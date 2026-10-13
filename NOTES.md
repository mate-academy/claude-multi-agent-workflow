# Notes

## What it does and how to install

`code-quality` bundles a two-agent workflow that checks a project and then closes test gaps. Install it from this repo's marketplace:

```
/plugin marketplace add Wongytron/claude-multi-agent-workflow
/plugin install code-quality@code-quality-marketplace
```

Then run `/code-quality:quality-check` inside a project. It was developed and tested against the Express API in `course-api/`.

## Scoping decision: the reviewer is read-only

`code-reviewer` only gets `Read, Grep, Glob`. Its job is to judge code, not change it, so it has no reason to hold `Write`, `Edit`, or `Bash`. Withholding them guarantees a review can never alter the code it is reviewing, and it keeps the findings trustworthy because they come from a worker that cannot "fix as it goes". `test-writer` is the opposite: it needs `Write`/`Edit` to add tests and `Bash` to run `npm test`, and its prompt confines edits to `tests/` so application code stays untouched. Both run on `sonnet`, since reviewing and writing small tests are bounded tasks that do not need the largest model.

## Orchestration decision: parallel gather, sequential write

Step 1 runs the reviewer, the linter, and the test suite in parallel because they are independent: each reads the same code and none needs another's output, so running them together is faster. Step 2 runs `test-writer` only afterwards because it depends on Step 1's results: it needs the reviewer's list of test gaps and any failing test output to know what to write. Running it in parallel would mean writing tests blind, and it could also race with the test run that is still in progress.
