# Notes

## What the plugin does and how to install it

`code-quality` bundles a read-only `code-reviewer` subagent, a `test-writer` subagent, a `/code-quality:quality-check` workflow command, a `quality-conventions` skill and a PostToolUse lint hook. Run the command on the Express API in `course-api/` and it reviews the code, finds untested routes, writes tests for the gaps and reports the result.

Install:

```
/plugin marketplace add <github-user>/claude-multi-agent-workflow
/plugin install code-quality@code-quality-marketplace
```

For local development run `claude --plugin-dir .` from the repo root and use `/reload-plugins` after edits.

## Scoping decision

`code-reviewer` only gets `Read, Grep, Glob`. A reviewer's job is to report, not to fix, so it has no `Write`, `Edit` or `Bash`. That makes it safe to run in parallel with other work, because it cannot change files under another agent. `test-writer` gets `Write`, `Edit` and `Bash` because it must create test files and run `npm test`. Its prompt also limits it to `tests/`, so application code is never changed by it. Both use `sonnet`: reviewing and writing tests need real reasoning, but not the most expensive model.

## Orchestration decision

Step 1 runs the reviewer and the coverage-gap finder in parallel. Both only read the code and neither needs the other's output, so running them together saves time. Step 2, the test writer, runs sequentially after them because it needs their results to know what to cover. Starting it earlier would mean writing tests blind. The final report is the last sequential step, since it summarizes everything.
