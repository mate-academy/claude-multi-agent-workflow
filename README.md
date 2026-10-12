# code-quality

A Claude Code plugin that reviews an Express API, writes the missing tests, and lints every file Claude edits. It is built and tested against the example API in `course-api/`.

## What is inside

| Part | Name | What it does |
| --- | --- | --- |
| Subagent | `api-reviewer` | Read-only reviewer (Read, Grep, Glob; haiku). Returns a short list of issues. |
| Subagent | `test-writer` | Writes and runs tests (Read, Grep, Glob, Write, Edit, Bash; sonnet). |
| Command | `/code-quality:quality-check` | Two reviewers in parallel (routes and tests), then the test writer. |
| Skill | `error-responses` | The API's error format: `{ "error": "message" }`. |
| Hook | PostToolUse `Edit\|Write` | Runs ESLint on the file that was just changed. |

## Install

```
/plugin marketplace add <path-or-github-repo-of-this-repo>
/plugin install code-quality@stas-marketplace
```

Or load it for one session from the repo root: `claude --plugin-dir .`

## Use

From a session in this repo, run `/code-quality:quality-check`.

The ESLint hook needs `npm install` to have been run in `course-api/`. If ESLint is not installed, the hook does nothing.

See `NOTES.md` for the design decisions.
