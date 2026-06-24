# code-quality Plugin — Notes

## What it does

This plugin bundles a multi-agent code quality workflow for Express API codebases. It provides:

- **`code-reviewer` subagent** — reads a route file and its imports, then returns a structured Issues / Warnings / Verdict report.
- **`test-writer` subagent** — reads a route and the existing test file, writes targeted test cases for uncovered paths, runs the suite, and confirms green.
- **`/quality` command** — orchestrates both subagents into a full pass: parallel reviews of every route, then a sequential test-writing step that acts on the combined findings.
- **`lint-check` skill** — runs ESLint across the API and returns a grouped error/warning report.
- **`lint-on-edit` hook** — automatically lints any `.js` file after every Write or Edit so style issues surface immediately rather than at commit time.

## Installation

```
/plugin marketplace add <your-repo-url>
/plugin install code-quality@<your-marketplace-name>
```

Then run `/quality` from the root of any Express project with the same layout as `course-api/`.

## Scoping decision — `code-reviewer` is read-only

The `code-reviewer` agent is scoped to `Read, Grep, Glob` only. It cannot write or execute anything. The reason: a reviewer's job is analysis, not action. Giving it `Edit` or `Bash` would mean a single agent could both identify a problem and silently change code to fix it — removing the human review step that the whole workflow is designed to surface. Keeping it read-only enforces the separation between "find issues" and "fix issues," which is handled by the separate `test-writer` agent.

## Orchestration decision — parallel reviews, then sequential test writing

Step 1 spawns two `code-reviewer` agents concurrently, one per route file. The reviews are fully independent: neither needs the other's output, and running them in parallel roughly halves the wall-clock time for the review phase.

Step 2 — the `test-writer` invocation — is sequential and depends on Step 1. It needs the combined findings from both reviews to know which edge cases to cover. Starting it before the reviews finish would mean passing it incomplete information, likely producing tests that miss issues flagged only in the second review. The dependency is real, so the step waits.
