# NOTES

## What this plugin does

`code-quality` bundles a code-quality workflow for course-api-style projects: a read-only reviewer, a test-fixing worker, a command that runs both together, a lint-fix skill, and a hook that auto-lints files on edit.

## Install

```
/plugin marketplace add <this-repo>
/plugin install code-quality@code-quality-marketplace
```

Or locally, from the repo root:

```
claude --plugin-dir .
```

## Scoping decision

`code-reviewer` is restricted to `Read, Grep, Glob` — no `Edit`, `Write`, or `Bash` — because a reviewer should be safe to run at any time without risk of side effects; it only reports findings. `test-runner` needs `Edit, Write, Bash` because fixing a failing test requires changing code and running commands, which is a fundamentally different (and riskier) responsibility.

## Orchestration decision

`/quality-check` runs `code-reviewer` and `test-runner` in parallel because they're fully independent — the review doesn't depend on test results, and running tests doesn't depend on review findings. The final synthesis step is sequential/dependent because it can't produce a combined report until both prior steps have returned.
