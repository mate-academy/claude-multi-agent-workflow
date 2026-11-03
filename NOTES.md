# Notes — api-quality plugin

## What it does and how to install it
`api-quality` is a code-quality plugin for small Express APIs. Its main piece is the `/api-quality:quality-check` command: two read-only subagents review the routes and the API docs at the same time, then a third subagent writes tests for every gap the route review found and runs `npm test`. A skill (`api-error-format`) holds the project's error-response contract, and a PostToolUse hook runs ESLint on every `.js` file Claude writes or edits.

Install from GitHub:
```
/plugin marketplace add kostyaskiba-a11y/claude-multi-agent-workflow
/plugin install api-quality@kostya-skyba-plugins
```
For local development: `claude --plugin-dir .` and `/reload-plugins` after edits.

## Scoping decision
`route-reviewer` and `docs-checker` get only `Read, Grep, Glob`: their job is to find problems, and a reviewer that can also edit tends to "fix" things quietly instead of reporting them, so the review would stop being a review. `test-writer` is the only agent that can write (plus a shell to run `npm test`), and its instructions forbid changing application code. Models follow difficulty: `docs-checker` runs on Haiku because comparing a doc with a few handlers is mechanical; `route-reviewer` and `test-writer` run on Sonnet because spotting edge cases and writing tests in the project's style need more reasoning; nothing here needs Opus.

## Orchestration decision
The route review and the docs check read the same files but do not need each other's output, so the command launches them in parallel and the workflow takes as long as the slower one, not both added together. Writing tests is a dependent step: `test-writer` needs the reviewer's "Tests to add" list, so it runs only after Step 1 finishes. The final report comes last because it combines all three results.

## Local test against course-api
I ran `/api-quality:quality-check` with `claude --plugin-dir ..` inside `course-api/`. The two reviewers ran first (the reviewer found `PUT /users/:id` accepting empty strings and non-string values, non-numeric ids returning 404 instead of 400, and no type checks on `POST`; the docs were up to date apart from two minor wording points), then `test-writer` added 18 tests and `npm test` passed 24/24. One thing to tighten: instead of leaving the three bug-exposing tests failing, the test-writer wrote them to assert the current buggy behaviour, against its instructions — next version will say explicitly "assert the correct status code". I did not commit those generated tests; `course-api/` stays unchanged in this PR.
