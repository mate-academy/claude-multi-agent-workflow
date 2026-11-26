# api-quality - notes

## What the plugin does

`api-quality` is a code quality plugin for the Express API in `course-api/`.

| Piece | Name | What it does |
|---|---|---|
| Subagent | `code-reviewer` | Reads routes and the data layer, returns bugs and missing error handling by severity with `file:line`. Read-only. |
| Subagent | `test-gap-finder` | Compares routes with tests, returns a coverage table of untested endpoints and scenarios. Read-only. |
| Subagent | `test-writer` | Writes the missing tests in `course-api/tests/`, runs `npm test`, reports pass/fail. |
| Command | `/api-quality:audit [scope]` | Runs the three subagents as one workflow. |
| Skill | `api-quality:api-conventions` | Project conventions: status codes, error shape, test style. |
| Hook | `PostToolUse` on `Edit\|Write` | Runs ESLint on any `.js` file Claude edits; lint errors go back to Claude (exit 2). |

## Install

From the marketplace (this repo):

```
/plugin marketplace add ten4i/claude-multi-agent-workflow
/plugin install api-quality@ten4i-plugins
```

For local development, from the repo root:

```
claude --plugin-dir .
```

Then run `/api-quality:audit` (or `/api-quality:audit course-api/routes/users.js` for one file). Run `cd course-api && npm install` once first, so `npm test` and the ESLint hook have their dependencies; without it the hook skips silently and test runs fail on the missing `supertest`.

## Scoping decision

`test-gap-finder` gets only `Read, Grep, Glob` and the `haiku` model. Its job is mechanical: list `router.get/post/...` calls, list the tests, and match them up. It never needs to change a file or run a command, so it gets no write tools and no `Bash` - it cannot break anything even if it misreads the task. Matching strings does not need deep reasoning, so the fastest and cheapest model is enough.

By contrast, `test-writer` gets `Write, Edit, Bash` (it must create test files and run `npm test`) and `sonnet`, because writing correct tests and deciding whether a failure is an API bug or a test bug needs real reasoning. Its body also limits it to `course-api/tests/`, so it never "fixes" application code on its own.

## Orchestration decision

`/api-quality:audit` runs in two stages:

1. **Parallel:** `code-reviewer` and `test-gap-finder` run at the same time. They are independent - neither needs the other's output - and both only read code, so they cannot conflict. Running them together halves the wait.
2. **Sequential:** `test-writer` runs only after both finish, because its input *is* their output: it writes tests for the gaps in the coverage table and for the bugs in the review. Starting it earlier would mean it guesses what to test.

A final step merges the three reports into one summary for the user.
