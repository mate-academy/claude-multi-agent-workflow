# Notes: the api-quality plugin

## What it does and how to install it
`api-quality` packages a code-quality workflow for Express APIs. `/api-quality:quality-pass [path]` sends two read-only subagents to review the routes and check the docs at the same time. A third subagent then writes tests for the gaps the review found, and the main agent combines all three results into one report. The plugin also includes a test-writing skill (`api-test-conventions`) and a PostToolUse hook that lints every `.js` file Claude edits.

Install:
```
/plugin marketplace add Leoshiva/claude-multi-agent-workflow
/plugin install api-quality@leoshiva-plugins
```
To work on the plugin itself, run `claude --plugin-dir .` from the repo root.

## Scoping decision: the reviewers can't write, and the cheap job gets the cheap model
`route-reviewer` and `docs-checker` get only `Read, Grep, Glob`. Their job is to report, and a reviewer that can edit will sooner or later "just fix" something nobody asked it to touch. With these tools, that can't happen. `test-writer` is the only agent with `Write, Edit, Bash`, because it has to create test files and run `npm test`. Its body also limits it to `tests/`, so it can never change application code. For models: `docs-checker` runs on **haiku**, because comparing a list of routes with a list of documented endpoints is mechanical. `route-reviewer` and `test-writer` run on **sonnet**, because spotting missing validation and writing correct supertest cases needs real reasoning.

## Orchestration decision: what runs in parallel and what waits
The route review and the docs check read the same code but don't need each other's output, so step 1 runs them **in parallel** and the pass takes as long as the slower of the two. `test-writer` runs **after** step 1 because its input is the reviewer's "Untested cases" list. Started earlier, it would guess which tests to write and duplicate the review. The final report waits for all three because it combines their results. So the order is: independent work together, then dependent work in sequence.

## How I tested it
- `node .github/scripts/validate-plugin.js` passes.
- I ran `claude -p "/api-quality:quality-pass course-api" --plugin-dir .`. The log shows `api-quality:route-reviewer` and `api-quality:docs-checker` launched together, then `api-quality:test-writer` launched after both returned. The review found real issues: `POST /users` and `PUT /users/:id` return 500 when the request has no body, a non-numeric id returns 404 instead of 400, and errors aren't always JSON.
- The skill loaded as `api-quality:api-test-conventions` when I asked for a `/health` test without naming it.
- The hook script returned exit 2 with the ESLint `no-undef` error for a bad file, and exit 0 for a clean one.
