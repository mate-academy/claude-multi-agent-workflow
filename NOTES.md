# Notes

## What it does and how to install
The `code-quality` plugin bundles a read-only `code-reviewer` subagent, a `test-writer` subagent, the `/code-quality:quality-check` workflow command, an `api-conventions` skill, and a hook that lints any `.js` file Claude writes or edits (via `${CLAUDE_PLUGIN_ROOT}/scripts/lint-on-edit.sh`).

Install:
```
/plugin marketplace add Sango-dev/claude-multi-agent-workflow
/plugin install code-quality@code-quality-marketplace
```
Local test: `claude --plugin-dir .` from the repo root, against `course-api/`.

## Scoping decision
`code-reviewer` only gets `Read, Grep, Glob` and runs on `sonnet`. A reviewer must never change the code it judges, so removing write tools makes that guarantee structural rather than a matter of prompt wording. Reviewing needs reasoning about bugs, so a mid-tier model fits. `test-writer` gets write/edit and Bash (to run `npm test`) but runs on the cheaper `haiku` model, because writing tests that follow existing patterns is repetitive and well-bounded.

## Orchestration decision
The review and test-writing steps run in parallel because they are independent: both only read the same source, and neither needs the other's output, so running together saves time. Lint runs afterwards, sequentially, because it must see the files the test-writer created; the final summary also waits for all results.
