# NOTES

## What the plugin does and how to install it

`code-quality` bundles a multi-agent code review workflow for Claude Code. One command — `/code-quality:quality-check [path]` — fans out two read-only reviewer subagents over independent slices of the codebase (interface layer and core layer), merges their findings, and then hands the combined list of test gaps to a test-writer subagent that writes the missing tests and runs the suite. A `review-checklist` skill gives every piece the same severity rubric, and a `PostToolUse` hook lints any JS file Claude writes or edits, feeding lint errors straight back to be fixed.

Install (this repo is its own marketplace):

```
/plugin marketplace add ZarkoA/claude-multi-agent-workflow
/plugin install code-quality@claude-multi-agent-workflow
```

For local development: `claude --plugin-dir .` from the repo root, `/reload-plugins` after edits.

## One scoping decision: the reviewer is structurally read-only

`code-reviewer` gets exactly `Read, Grep, Glob` — no Write, no Edit, no Bash. That is not a stylistic choice: a reviewer that *can* fix things drifts into fixing them, and then the review output stops being a faithful account of what's wrong and becomes a diff to audit. With read-only tools the agent physically cannot cross that line, so its findings stay reportage and the decision to change code stays with the orchestrator (and ultimately the user). The inverse decision was made for `test-writer`: it gets `Bash` on top of file tools specifically so it can *run* the suite it writes — a test-writer that can't execute tests can only claim they pass. Both agents run on `sonnet`: review judgment and test design are the two genuinely hard jobs in the flow, and neither is high-volume enough for a smaller model to be worth the quality trade.

## Why parallel where parallel, sequential where sequential

The two review slices (routes/HTTP layer vs. data/app-setup layer) share no state and read disjoint files, so the command launches both reviewers in a single message — concurrent by construction, and the wall-clock cost of the review step is one reviewer, not two. The test-writing step is the opposite case: its *input is the reviewers' output* (the merged, deduplicated test-gap list), so it cannot start earlier without guessing what to cover. Running one writer after the merge also means a single agent owns the test files — two writers in parallel would race on the same `tests/` directory. In the live run against `course-api` this shape held up: the two reviewers returned independently, and the test-writer's 19 new tests exposed 9 real defects (missing type validation, error responses that break the documented JSON shape, a store that leaks live references) that both reviewers had flagged from opposite sides.
