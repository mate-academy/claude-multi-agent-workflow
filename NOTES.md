# NOTES: quality-gate

## What it does and how to install it

`quality-gate` is a pre-PR check for an Express API, packaged as a plugin. The `/quality-gate:check` command runs three subagents as one workflow (code review, API docs check, missing tests) and ends with a PASS/FAIL report. A skill teaches the test conventions, and a hook lints every JS file Claude edits.

This repo is both the plugin and its marketplace:

```
/plugin marketplace add sabarish1993/claude-multi-agent-workflow
/plugin install quality-gate@sabarish-tools
```

For local development: `claude --plugin-dir .` from the repo root, then `/reload-plugins` after edits.

## Scoping decision: who gets which tools and model

- **`code-reviewer` and `docs-checker` are read-only (`Read, Grep, Glob`).** Their job is to report, and the workflow trusts their output enough to act on it. If a reviewer could also edit, a vague finding could turn into an unreviewed change. With no Write, Edit or Bash, the worst a confused run can do is give a bad report.
- **`docs-checker` runs on Haiku.** It does a mechanical comparison of method, path and status codes between two short sources, so Haiku is enough and it's the cheapest step to run on every check.
- **`code-reviewer` runs on Sonnet.** Spotting a missing 404 path or a validation gap needs real reasoning about the code, so it isn't worth economising here.
- **`test-writer` is the only agent with `Write, Edit, Bash`.** It has to create test files and run `npm test`. Its body forbids touching application code, so a failing test is reported instead of "fixed" by changing the app to match.

## Orchestration decision: what runs in parallel and what waits

- **Parallel:** `code-reviewer` and `docs-checker`. Neither needs the other's output: one reads the changed routes, the other compares the docs with the routes. Running them together takes about as long as the slower of the two, and each keeps its file reading in its own context.
- **Sequential:** `test-writer` waits for `code-reviewer`. Its input is the reviewer's "Untested paths" list, so it can't start before that exists. Starting it earlier would mean it guessing what to test, and duplicating the reviewer's work.
- **Last:** the main session combines all three results into the report, which needs everything finished.

That's why the reviewer's return format has a separate "Untested paths" section: it's the hand-off point between the parallel step and the dependent one.
