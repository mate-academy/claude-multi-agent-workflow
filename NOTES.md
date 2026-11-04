# Notes

## What it does and how to install
`code-quality` bundles two subagents, a `/code-quality:quality` workflow command, an `api-conventions` skill and a lint-on-edit hook. Install with `/plugin marketplace add prokhorenko1/multi-agent-workflow` then `/plugin install code-quality@code-quality-marketplace`, or test locally with `claude --plugin-dir .`.

## Scoping decision
`code-reviewer` only gets `Read, Grep, Glob`: a reviewer should never change code, and removing Write/Edit/Bash makes that guarantee structural instead of relying on instructions. It runs on sonnet because judging convention violations and subtle bugs needs more than a cheap model. `test-writer` additionally gets `Write, Edit, Bash` (Bash only to run `npm test`), and its prompt restricts edits to `tests/`.

## Orchestration decision
Step 1 runs the reviewer and the test writer in parallel because they are independent: one only reads, the other only touches `tests/`. Step 2 (regression tests) is sequential because it needs the reviewer's findings. Step 3 (`npm test` + lint) is last because it must verify everything the earlier steps produced.
