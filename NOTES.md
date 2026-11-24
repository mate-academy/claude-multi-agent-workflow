# Notes

## What the plugin does and how to install it

`api-quality-kit` keeps the Express API in `course-api/` healthy. The `/api-quality-kit:quality-check` command runs two subagents as a workflow: `api-reviewer` reviews the code, and `test-helper` finds untested behaviours and writes tests for them. The `api-quality` skill holds the route checklist, and a PostToolUse hook runs `node --check` on every JavaScript file Claude writes or edits.

Install it from this repository, which is also its marketplace:

    /plugin marketplace add iencivlad-prog/claude-multi-agent-workflow
    /plugin install api-quality-kit@api-quality-marketplace

To try it without installing, run `claude --plugin-dir .` from the repository root.

## Scoping decision: tools and model

`api-reviewer` gets only Read, Grep and Glob. Its job is to look, so it has no tool that could change a file or run a command, even if it misreads the task. That matters because it runs in the background as part of the workflow, where nobody sees a permission prompt to refuse.

`test-helper` gets Edit and Write because it creates test files, and Bash because it has to run `npm test` to prove the tests pass. Its body limits it further: it writes only inside `course-api/tests/` and never changes application code.

Both run on `sonnet`. Reviewing for bugs and writing correct tests both need judgment, so `haiku` would miss too much, while `opus` would cost more than a routine check on a small API needs.

## Orchestration decision: parallel versus sequence

Step 1 runs the review and the test-gap analysis in parallel. Neither needs the other's result: the reviewer reads the routes, and the analysis compares routes with tests. In analysis mode `test-helper` does not edit anything, so the two cannot get in each other's way.

Step 2 waits for both, because writing tests needs both inputs: the reviewer's High and Medium findings, and the list of uncovered behaviours. Starting it earlier would mean writing tests without knowing what is broken or missing.

Step 3, the final report, waits for Step 2 because it reports the test run result.

The rule: a step runs in parallel only when it needs no result from an unfinished step.

## Local test run

I loaded the plugin with `claude --plugin-dir .` and ran `/api-quality-kit:quality-check` against `course-api/`. The two Step 1 agents, `api-quality-kit:api-reviewer` and `api-quality-kit:test-helper`, started together and finished in 16s and 15s. The main session waited for both before starting `test-helper` in write mode, then wrote the four-part report.

The review found real gaps: no JSON 404 handler or error middleware in `server.js`, ids that are not validated (`/users/abc` returns 404 instead of 400), and PUT accepting an empty name. The new tests exposed four of them as failing tests. Fixing the API is outside this plugin task, so I discarded the generated tests and kept the application code unchanged.

One lesson: when the main session asked `test-helper` to keep failing tests, the agent followed its own body instead, which says to remove a test that fails because of a real application bug. The agent's file wins over a one-off request, so the body has to say what you really want every run.
