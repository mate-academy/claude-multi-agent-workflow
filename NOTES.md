# Notes

## What the plugin does and how to install it

`code-quality` bundles a review-and-test workflow for Express APIs. One command runs two reviewers in parallel, passes their findings to a test writer, and returns a single summary. A skill gives both agents the same coding rules, and a hook syntax-checks every JavaScript file Claude writes or edits.

Install from a fresh Claude Code session:

```
/plugin marketplace add Dcb7305/claude-multi-agent-workflow
/plugin install code-quality@chris-quality-tools
```

## Scoping decision

The `code-reviewer` only gets Read, Grep, and Glob. A reviewer's job is to find problems, not fix them, so giving it no write access means it can't change code by accident. It also makes it safe to run two copies at the same time, since neither can touch a file the other is reading.

The `test-writer` gets Write, Edit, and Bash because it has to create test files and run `npm test`. Its instructions limit it to test files only, so it tests bugs instead of quietly fixing them.

Both use Sonnet. Finding real bugs and writing correct tests takes solid reasoning, and Haiku would likely miss things.

## Orchestration decision

The two reviews run in parallel because they look at different folders (routes vs. everything else) and neither needs the other's results. Running them together cuts the wait roughly in half.

The test writer runs after both reviews because it needs their findings to know what to test. The summary runs last because it reports on everything.

In testing, the tests also caught a false alarm: one reviewer flagged a missing request body as causing a 500, and the test showed it didn't. Pairing a reviewer with a tester double-checks the review.