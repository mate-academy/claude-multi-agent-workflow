# code-quality plugin — notes

## What it does

`code-quality` bundles a review-and-format workflow for JavaScript projects, built and tested against the Express API in `course-api/`.

| Piece | Name | What it does |
|---|---|---|
| Subagent | `code-reviewer` | Read-only review for bugs, missing error handling, and unclear names; returns findings grouped by severity. |
| Subagent | `code-formatter` | Fixes indentation to 2 spaces with `Edit`; returns the files and line counts it changed. |
| Command | `/code-quality:quality [path]` | Runs the whole workflow (see below). Defaults to `course-api/`. |
| Skill | `code-style` | The API's conventions: formatting, route layout, status codes, `{ "error": "message" }` shape, data access through `db/store.js`. |
| Hook | `PostToolUse` on `Edit\|Write` | Runs `scripts/lint-edited.js`, which lints the edited `.js` file with the project's own ESLint and feeds errors back to Claude. |

## Install

From inside Claude Code:

```
/plugin marketplace add donci70/claude-multi-agent-workflow
/plugin install code-quality@donci70-plugins
```

To try it from a local clone without installing:

```
claude --plugin-dir .
```

The workflow and hook expect the target project's dependencies to be installed (`cd course-api && npm install`), because they run `npm test`, `npm run lint`, and the project's local ESLint.

## Scoping decision: the formatter gets `Read, Glob, Edit` on `haiku`

The formatter's job is mechanical — find JS files and change leading whitespace — so it runs on `haiku`, the cheapest and fastest model; there is no judgment call that needs a larger one. Its tools are the minimum that job requires: `Glob` to find files, `Read` because a file must be read before it can be edited, and `Edit` to change only the lines that need it. It deliberately does **not** get `Write`, which would let it replace whole files and silently drop or rewrite logic, and it gets no `Bash`, so it can't run commands or touch anything beyond the files it edits.

The reviewer is the opposite case: it has to reason about correctness, so it runs on `sonnet`, but it only reports, so it gets read-and-search tools only (`Read, Grep, Glob`) and can't change anything it reviews.

## Orchestration decision: what runs in parallel vs. in sequence

1. **Parallel — review + `npm test` + `npm run lint`.** All three only read the code, and none needs another's output, so running them together costs nothing in correctness and shortens the wait.
2. **Sequential — the formatter waits for step 1.** It depends on step 1 twice over: it uses the reviewer's and linter's formatting findings to know which files to fix first, and it *edits* files the reviewer and tests are reading. Running it alongside them would mean reviewing and testing code that is changing underneath them.
3. **Sequential — re-run `npm test` after formatting.** This verifies the formatter's edits didn't break anything, so it can only run once those edits exist.

The command reports the reviewer's non-formatting findings rather than fixing them: those need a human decision, while indentation is safe to fix automatically.
