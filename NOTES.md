# Notes — api-quality plugin

## What it does

`api-quality` bundles a code-quality workflow for the Express API in `course-api/`: a
read-only reviewer, a test-writing agent, a shared conventions skill, and an auto-lint
hook, orchestrated by one command, `/quality`.

## Install

Local development: `claude --plugin-dir .` from the repo root, then `/reload-plugins`
after each edit to pick up changes without restarting the session.

Published: `/plugin marketplace add Krupkolllia/claude-multi-agent-workflow` followed by
`/plugin install api-quality@krupkolllia-marketplace`.

## Scoping decision: why `api-reviewer` is Read/Grep/Glob on sonnet

`api-reviewer`'s tools are limited to `Read`, `Grep`, `Glob` — no `Write`, `Edit`, or
`Bash` — and it runs on `sonnet` rather than `opus`. A reviewer that *can* edit will
eventually just "fix" what it finds instead of reporting it, especially under time
pressure, and that quietly breaks the `/quality` workflow: step 2 depends on a clean,
complete findings list to merge with ESLint's output, and step 3 depends on that merged
list describing the *current* state of the code, not a state the reviewer already
silently rewrote. Restricting the tool list is what actually enforces "read-only" — a
prompt instruction alone is not reliable enough to guarantee it. Sonnet is enough model
for pattern-matching route code against a short, fixed convention list, and the reviewer
runs on every `/quality` invocation, so keeping it on the cheaper model keeps the common
case fast.

## Orchestration decision: why review and lint run in parallel, but test-author runs after

`api-reviewer` and `npm run lint` read the same target code but produce independent
output — neither reads what the other produces, and there's no shared state between them.
Running them sequentially would just add their wall-clock times for no benefit, so
`/quality` step 1 launches both in a single message.

`test-author` is different: it consumes the *merged* findings list from step 2, which
doesn't exist until both the reviewer and the linter have finished and been combined. It
cannot start earlier without risking writing tests against findings that haven't been
deduplicated or ranked yet, so it is a dependent step that waits for step 2 to complete
before it runs.
