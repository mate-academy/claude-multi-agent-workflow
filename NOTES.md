# Notes

## What it does and how to install
`code-quality-workflow` bundles two subagents, one workflow command, one skill, and one hook. Running `/code-quality-workflow:quality-check` reviews the Express API in `course-api/` against its conventions, adds missing tests, runs `npm test` and `npm run lint`, and returns a single prioritised report (blockers, should-fix, added tests, next action).

Install from this repo as a marketplace:

```
/plugin marketplace add rezaparamarta/claude-multi-agent-workflow
/plugin install code-quality-workflow@code-quality-marketplace
```

For local development use `claude --plugin-dir .` from the repo root and `/reload-plugins` after edits.

## Scoping decision: why the reviewer is read-only and the writer is on haiku
`api-reviewer` gets only `Read, Grep, Glob`. Its job is to judge code, never to change it, so giving it Write, Edit or Bash would only add ways to go wrong (a "helpful" fix in the middle of a review, or a command run against the user's machine). Read-only also makes its output trustworthy: whatever it reports, the code is untouched. It runs on `sonnet` because spotting a convention violation or a subtle bug needs real judgement.

`test-writer` is the opposite. It needs `Write, Edit` to create tests and `Bash` to run `npm test`, and nothing else is granted to anyone, so only this agent can change files, and its prompt confines it to `course-api/tests/`. It runs on `haiku` because writing supertest cases that copy an existing test file is pattern work, where a cheaper and faster model is enough. The result is checked by actually running the tests, which catches mistakes.

One practical consequence: subagents launched in the background cannot ask for permission interactively, so `test-writer`'s file writes can be blocked ("no verdict") in auto mode. The fix is to pre-approve exactly its scope in your own `.claude/settings.local.json`: `Write(course-api/tests/**)` and `Edit(course-api/tests/**)`. That file is git-ignored, so the plugin never ships a permission grant on your behalf.

## Orchestration decision: what runs in parallel and what in sequence
Step 1 runs `api-reviewer` and `test-writer` in parallel. Neither needs the other's output: the reviewer reads `routes/` and `db/`, and the writer reads the same files and writes only under `tests/`. Running them together roughly halves the wall-clock time and keeps the two jobs from influencing each other.

Step 2 is sequential. The final `npm test` and `npm run lint` must run after the writer has finished, otherwise they would not include the new tests. The combined report also depends on the reviewer's findings and the test results. A step that consumes earlier results cannot start before them, so it waits.
