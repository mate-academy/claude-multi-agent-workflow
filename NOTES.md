# NOTES

## What the plugin does

`code-quality-workflow` reviews and improves the Express API under `course-api/`. It combines a read-only reviewer with a test/fix worker, then performs a dependent validation step. The post-edit hook reruns `npm test` after plugin-driven changes.

## Installation

From a clean checkout:

```bash
claude --plugin-dir .
```

For marketplace installation in a fresh Claude Code session, add this repository as a marketplace and install `code-quality-workflow` from `fredrik-claude-marketplace`.

## Scoping decision

The `code-reviewer` subagent is deliberately read-only and receives only `Read`, `Glob`, and `Grep`. Its job is analysis, so write or shell tools would add unnecessary mutation risk. The `test-fixer` receives write/edit and `Bash` because it must run the API's tests and make focused, evidence-backed fixes.

Both use the `sonnet` model because code review and safe test-driven maintenance need stronger reasoning than a simple file lookup, while still being a practical default for repeated workflows.

## Orchestration decision

The reviewer and test-fixer run in parallel because their first-pass work is independent: the reviewer analyzes the current code while the fixer executes the existing checks and addresses safe failures. The final validation step is sequential because it needs both workers' results and the post-edit working tree before deciding whether the API is healthy.

## Hook decision

The `PostToolUse` hook targets `Write|Edit` and executes `npm test` from `${CLAUDE_PLUGIN_ROOT}/course-api`. Using the plugin-root variable keeps the hook portable across installations instead of relying on an absolute path.
