# Notes on api-quality-flow

## What it does, and how to install it

`api-quality-flow` is a Claude Code plugin that reviews, tests, and safely fixes changes to the Express API in `course-api/`. It bundles three subagents (`api-reviewer`, `test-auditor`, `quality-fixer`), a workflow command (`/api-quality-flow:quality-flow`), a skill capturing `course-api`'s conventions, and a hook that guards test files from being edited.

To try it locally: `claude --plugin-dir .` from this repo's root, then `cd course-api && npm install` once so the API and its tests can run. To install it after publishing: `/plugin marketplace add <repo>` followed by `/plugin install api-quality-flow@anna-dev-tools`.

## Scoping decision: why api-reviewer is read-only and quality-fixer gets edit tools

`api-reviewer` is restricted to `Read`, `Grep`, and `Glob` on purpose. Its job is to *find* problems — bugs, missing validation, wrong status codes, wrong error shapes, store bypasses — and a review step that can also edit code is a step that might "fix" something it only half-understood, or paper over a finding instead of reporting it clearly. Keeping it read-only forces its output to be a legible findings report that a human or another agent can act on, rather than an opaque diff.

`quality-fixer`, by contrast, is the only agent with `Edit` and `Write`, and it's designed to run *after* findings already exist (from `api-reviewer`, `test-auditor`, or both) rather than to review from scratch. Concentrating write access in one agent that consumes vetted findings — instead of giving every agent edit rights — keeps the blast radius of any single step small and makes it obvious which step in the workflow is allowed to change code.

## Orchestration decision: why api-reviewer and test-auditor run in parallel, and quality-fixer waits

`api-reviewer` (static code review) and `test-auditor` (running the existing test suite) don't depend on each other's output — one reads code, the other executes it — so running them sequentially would just be wasted wall-clock time. The workflow command launches them in parallel and waits for both results before doing anything else.

`quality-fixer` is different: it needs the *combined* findings from both of the parallel agents as its input, so it genuinely cannot start until step 2 (both parallel results collected) is complete. That's a real dependency, not an arbitrary ordering choice, so it's modeled as a sequential step.

Finally, the workflow runs `test-auditor` a second time after `quality-fixer` finishes, as a dedicated, sequential verification step — it depends on the fix being applied first, so it cannot be folded into the initial parallel step. This gives the workflow a clean shape: parallel discovery, dependent fix, dependent verification.
