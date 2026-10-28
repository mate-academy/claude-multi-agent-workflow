# Notes

## What it does and how to install
`code-quality` is a plugin with two subagents (a read-only reviewer and a test writer), a `/code-quality:quality` workflow command, an `api-conventions` skill, and a PostToolUse hook that lints edited JavaScript files. Install it with `/plugin marketplace add kenu21/claude-multi-agent-workflow` followed by `/plugin install code-quality@code-quality-marketplace`. For local testing run `claude --plugin-dir .` from the repo root.

## Scoping decision
The `code-reviewer` only gets `Read, Grep, Glob` and runs on sonnet. Reviewing needs reasoning over code but must never change it, so removing write and shell tools makes that guarantee structural rather than a matter of instructions. The `test-writer` gets `Write, Edit, Bash` because it has to create test files and run `npm test`; its prompt confines it to `tests/` so it cannot quietly "fix" the app to make tests pass.

## Orchestration decision
Step 1 runs in parallel: the correctness review, the test-gap analysis, and the baseline `npm test` / `npm run lint` read the same code but do not depend on each other, so running them together saves time. Step 2 (test writing) is sequential because it needs the findings and gaps from step 1. Step 3 (the report) runs last because it needs the final test results from step 2.
