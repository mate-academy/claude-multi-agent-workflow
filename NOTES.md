# Notes

## What it does and how to install

`code-quality` reviews an Express API, checks that tests and lint pass, then adds missing tests and fixes the defects it found. One command, `/code-quality:quality`, runs the whole flow. A PostToolUse hook also lints every JS file in `course-api/` right after Claude edits it.

Install:

```
/plugin marketplace add iryna-knyzh/claude-multi-agent-workflow
/plugin install code-quality@code-quality-marketplace
```

## Scoping decision

`code-reviewer` only gets `Read, Grep, Glob` and runs on `sonnet`. A reviewer's job is to read and judge, so it cannot edit files or run commands — a bad review can never change code by accident, and it can safely run twice in parallel on different directories. `Write`, `Edit` and `Bash` live only on `test-writer`, because it has to create tests and run `npm test` and `npm run lint`. Both use `sonnet`: reviewing against written conventions and writing small tests is moderate work, and the heavier model isn't needed.

## Orchestration decision

Step 1 runs in parallel: two reviews (`routes/`, and `db/` plus `server.js`) and the baseline test and lint run. They read the same code but don't depend on each other's output, so running them together saves time. The merge step waits for all three, and `test-writer` runs strictly after it, because it needs the merged findings to know which tests to write and which defects to fix. A final test and lint run verifies the result.
