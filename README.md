# api-quality-flow

A Claude Code plugin that bundles a multi-agent workflow for reviewing, testing, and safely fixing changes to the Express API in `course-api/`. This repository is both the plugin and the marketplace (`anna-dev-tools`) that publishes it.

## What it does

`api-quality-flow` runs three scoped subagents as a single orchestrated workflow: a read-only reviewer finds problems, a test runner verifies behavior, and — only once both have reported back — an implementation worker makes the smallest safe fixes and re-verifies them.

## Agents

- **`api-reviewer`** — read-only. Reviews `course-api` routes for bugs, missing input validation, incorrect HTTP status codes, malformed JSON error responses, and code that bypasses `db/store.js`. Tools: `Read`, `Grep`, `Glob`. Model: `sonnet`. Never edits files.
- **`test-auditor`** — runs and analyzes the `course-api` test suite (`npm test`), summarizing failures with expected-vs-actual evidence. Tools: `Read`, `Grep`, `Glob`, `Bash`. Model: `haiku`. Never edits files.
- **`quality-fixer`** — implementation worker, used only after `api-reviewer` and/or `test-auditor` have produced findings. Makes the smallest safe fixes, never touches files under `course-api/tests/`, and runs the test suite after editing. Tools: `Read`, `Grep`, `Glob`, `Edit`, `Write`, `Bash`. Model: `sonnet`.

## Usage: `/api-quality-flow:quality-flow`

Run `/api-quality-flow:quality-flow [optional target or scope]` to execute the full workflow:

1. **Parallel** — `api-reviewer` and `test-auditor` launch together, since a static code review and a test run are independent of each other.
2. Wait for both to finish and combine their findings.
3. **Sequential/dependent** — `quality-fixer` receives the combined findings and makes fixes. It cannot start until step 2 completes, since it needs that input.
4. **Sequential/dependent** — `test-auditor` runs a second time, after `quality-fixer` finishes, purely to verify the fix and confirm nothing regressed.
5. The command reports the combined result: what was found, what was changed, and the final test outcome.

## The skill

`skills/express-api-quality/SKILL.md` captures this project's conventions — validation, HTTP status codes, the `{ "error": "message" }` error shape, the `db/store.js` data-access pattern, and how tests are structured — so agents and the workflow stay consistent with how `course-api` is actually built. It's scoped to trigger on Express API route-quality work in `course-api`, not on unrelated JavaScript.

## The test-edit guard

`hooks/hooks.json` registers a `PreToolUse` hook (`hooks/guard-test-edits.js`) that blocks any `Edit` or `Write` targeting a file under `course-api/tests/`. This keeps `quality-fixer` — or any other agent — from "fixing" a failing test by rewriting it instead of fixing the underlying code. The hook is referenced via `${CLAUDE_PLUGIN_ROOT}` so it resolves correctly no matter where the plugin is installed.

## Load it locally

From the repository root:

```
claude --plugin-dir .
```

Then set up `course-api` once if you haven't:

```
cd course-api && npm install
```

Run `/api-quality-flow:quality-flow` inside a Claude Code session to try the workflow. Use `/reload-plugins` after editing any plugin file to pick up the change.

## Add the marketplace and install after publishing

Once this repo is pushed, from a fresh Claude Code session:

```
/plugin marketplace add <this-repo-url-or-path>
/plugin install api-quality-flow@anna-dev-tools
```
