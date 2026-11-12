# Notes

## What it does and how to install
`code-quality` is a Claude Code plugin that runs a multi-agent code-quality workflow against the Express API in `course-api/`. The `/code-quality:quality-check` command runs a read-only `code-reviewer` and a test-gap analysis in parallel, then a `test-writer` that writes the missing tests. A skill (`api-conventions`) holds the API rules and a PostToolUse hook lints after every edit.

Install:
```
/plugin marketplace add jpzetina14-cyber/claude-multi-agent-workflow
/plugin install code-quality@code-quality-marketplace
```
Locally: `claude --plugin-dir .` from the repo root (run `cd course-api && npm install` once).

## Scoping decision
`code-reviewer` only gets `Read, Grep, Glob` so it physically cannot modify code while reviewing; a reviewer that can edit may "fix" things silently and blur the report. `test-writer` gets `Write, Edit, Bash` because it must create test files and run `npm test`, but runs on the cheaper `haiku` model since writing tests that follow existing patterns is routine work, while the reviewer uses `sonnet` for the harder judgment task.

## Orchestration decision
The review and the test-gap analysis are independent: neither needs the other's output, so they run in parallel to save time. Writing tests is sequential and comes afterward because it depends on both results - the gaps to cover and the reviewer's findings about behavior that is wrong or risky - and running it earlier would mean writing tests blind.
