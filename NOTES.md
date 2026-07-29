# NOTES

## What the plugin does

`code-quality-kit` bundles a review-and-test workflow for small Node/Express services: `code-reviewer` finds correctness bugs and convention violations, `test-writer` fills in the regression tests those changes are missing, a shared checklist skill keeps both of them consistent, and a hook lints every `.js` file the moment it's edited or written. The `/quality-check` command ties the two subagents together into one workflow.

## Install

```
/plugin marketplace add <this-repo>
/plugin install code-quality-kit@claude-multi-agent-workflow
```

or, for local testing: `claude --plugin-dir .` from the repo root, then run `/quality-check` against `course-api/`.

## Scoping decision: why the two agents got different tools and models

`code-reviewer` is restricted to `Read`, `Grep`, `Glob` and runs on `sonnet`. A reviewer's whole job is to *judge* code — spot the subtle bug, the missing edge case, the convention drift — which needs stronger reasoning, but it never needs to change anything, so giving it `Write`/`Edit` would only add blast radius for zero benefit. It's also the agent most likely to be run against someone else's in-progress work, where an accidental edit would be actively harmful.

`test-writer` gets `Write`, `Edit`, and `Bash` (to run `npm test`) on `haiku`. Its job is comparatively mechanical: follow the existing test file's established pattern (`node:test` + `supertest` + `store.reset()`) and add a case shaped like the ones already there. That's well-defined enough for a cheaper, faster model, and it genuinely needs write access — a test-writer that can't write tests isn't one. Keeping it on a cheaper model also means running it in parallel with `code-reviewer` roughly doubles throughput without doubling cost.

## Orchestration decision: why `/quality-check` runs parallel then dependent

Step 1 dispatches `code-reviewer` and `test-writer` in the same message because neither depends on the other's output — one is reading for bugs, the other is reading for test gaps, over the same files, at the same time. Running them sequentially would just add wall-clock time for no accuracy gain.

Step 2 has to be dependent: the most valuable part of the combined report — "this blocker code-reviewer flagged isn't covered by any test test-writer added" — only exists once both results are in hand to cross-reference. There's no way to compute that gap from either agent's output alone, so the synthesis step has a real, not just organizational, reason to wait.
