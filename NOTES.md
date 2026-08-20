# NOTES

## What it does / how to install

`code-quality` is a Claude Code plugin that bundles a two-agent review-and-fix workflow for the Express API in `course-api/`. It ships two subagents (`code-reviewer`, `test-writer`), a workflow command (`/code-quality:ship-check`), a skill documenting the API's conventions, and a hook that lints touched files after every edit.

Install from a fresh session:

```
/plugin marketplace add MarinaKramarchuk/claude-multi-agent-workflow
/plugin install code-quality@code-quality-marketplace
```

Or locally, from a clone of this repo: `claude --plugin-dir .`. Run `cd course-api && npm install` once so the API and its test/lint scripts are ready, then invoke `/code-quality:ship-check`.

## Scoping decision: why `code-reviewer` is read-only

`code-reviewer`'s `tools` line is limited to `Read, Grep, Glob` — no `Edit`, `Write`, or `Bash`. A reviewer that can also edit files tends to "fix as it goes," which hides what it actually found and makes its output harder to trust or diff against. Keeping it read-only forces it to produce an explicit findings list (file, line, problem, suggested fix) instead of silently rewriting code, and it means the review step is safe to run in parallel with other work without any risk of it touching files another step also touches. `model: sonnet` is enough for reading a small Express codebase and applying a documented convention checklist — it doesn't need a heavier model for that.

`test-writer`, by contrast, is scoped with `Edit, Write, Bash` because its job is specifically to change code and verify the result by running `npm test` / `npm run lint` — it can't do that job read-only.

## Orchestration decision: why `ship-check` parallelizes stage 1

`commands/ship-check.md` runs `code-reviewer` and the `npm test` / `npm run lint` baseline **in parallel** in stage 1, because they're independent: the reviewer reads the source to reason about correctness and conventions, while the test/lint run exercises the code directly. Neither depends on the other's output, and running them together halves the wall-clock cost of stage 1 versus running them one after another.

Stage 2 (`test-writer`) is a **dependent** step — it can't start until stage 1 finishes, because its input is the combined findings from both parallel branches (the reviewer's list plus whatever tests or lint rules actually failed). Fixing issues before knowing the full set of findings would risk missing ones only lint or the test run caught, or ones only the reviewer caught by reading the code.
