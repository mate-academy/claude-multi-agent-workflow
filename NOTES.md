# NOTES

## What it does

`api-quality-kit` is a code-quality plugin for small Express APIs. It bundles two subagents (a read-only reviewer, a test-writing agent), a `/quality-check` workflow command that runs them as a two-step pipeline, a shared `api-conventions` skill both agents lean on, and a `PostToolUse` hook that runs the test suite after route/store/test edits and reports pass/fail inline. It was built and tested against `course-api/` in this repo.

## Install

```
/plugin marketplace add <this-repo>
/plugin install api-quality-kit@tvairakt-marketplace
```

Or for local development, from the repo root: `claude --plugin-dir .`, then `/reload-plugins` after any edit.

## Scoping decision: why `api-reviewer` only gets `Read, Grep, Glob`

`api-reviewer` is deliberately locked to read-only tools, with no `Bash` and no `Write`/`Edit`. Its whole job is to produce findings someone (or `test-writer`) acts on afterward — if it could edit files directly, a review pass could silently turn into an undiscussed code change, and a bug in its reasoning could corrupt working code with no second check. Keeping it read-only also means it's safe to run unattended or in parallel with other work (like the `npm test`/`npm run lint` run in step 1 of the command) without any risk of the two stepping on each other's file changes. `test-writer`, by contrast, gets `Write`, `Edit`, and `Bash` because its job — adding tests and re-running them to confirm — is meaningless without the ability to change files and execute the suite; scoping it down to read-only would defeat its purpose.

## Orchestration decision: why step 1 is parallel and step 2 is dependent

`/quality-check` runs `api-reviewer` and the `npm test`/`npm run lint` check in parallel in step 1 because neither depends on the other's output — the reviewer reads source files directly, and the test/lint run doesn't need the reviewer's opinion to execute. Running them together instead of in sequence cuts the wall-clock cost of the workflow roughly in half for that step. Step 2 (`test-writer`) has to be dependent and sequential, because it needs both results as input: it can't know what tests to add until it has the reviewer's findings and the actual test/lint failures from step 1. Starting it before step 1 finishes would mean it's working from incomplete information, so the dependency is real, not just a convenience ordering.
