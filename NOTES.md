# NOTES

## What it does and how to install

`quality-kit` runs a code-quality workflow on an Express API: `/quality-check` has two `code-reviewer` subagents review the code, then a `test-writer` subagent covers the gaps they report, then lint and tests run. It also ships a skill with the route conventions and a PostToolUse hook that blocks leftover debug code.

Install: `/plugin marketplace add hernandezggg/claude-multi-agent-workflow` then `/plugin install quality-kit@quality-kit-marketplace`. Locally: `claude --plugin-dir .`.

## Scoping decision

`code-reviewer` only gets `Read, Grep, Glob` and runs on `sonnet`: reviewing is judgement-heavy but must never change code, so it has no write or shell tools. `test-writer` gets `Write, Edit, Bash` (it must create tests and run them) but runs on `haiku`, because writing tests that mimic existing ones is cheap, repetitive work. Its prompt also restricts it to `tests/` so it cannot patch application code.

## Orchestration decision

The two reviews (routes vs store/server) are independent, so they run in parallel in one message. Test writing depends on the reviewers' merged "untested behaviour" list, so it runs sequentially after them. The final lint/test run depends on the new tests, so it goes last.
