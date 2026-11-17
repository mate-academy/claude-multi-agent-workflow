# NOTES: api-quality plugin

## What it does and how to install it
`api-quality` runs a code-quality pass on an Express API. A reviewer and a test-gap mapper work in parallel, a test writer closes the gaps using both results, and the main session runs the suite. A lint hook and a testing skill complete the bundle. The theme is "make an endpoint trustworthy": find bugs, find untested paths, pin both down with tests, and keep code lint-clean throughout.

Install it as a marketplace plugin:
```
/plugin marketplace add christopherjuhl/claude-multi-agent-workflow
/plugin install api-quality@christopherjuhl-plugins
```
Or load it without installing: `claude --plugin-dir .` from the repo root. Then run `/api-quality:quality-pass routes/users.js` from `course-api/`.

## Scoping decision: three workers, three different budgets
- **`reviewer`: read-only (Read, Grep, Glob), Sonnet.** Its job is judgment: is this validation right, is this status code wrong? That needs a capable model but never needs to change anything. Without Write or Edit, it can't "fix" what it finds, so its findings stay a report that a human or a later step acts on.
- **`test-gap-finder`: read-only, Haiku.** Mapping each handler and status code to an existing test is mechanical lookup work: read the branches, grep the tests, fill a table. Haiku does it well, faster and cheaper. It runs in parallel with the reviewer, so it rarely sets the pace anyway.
- **`test-writer`: Read, Grep, Glob, Write and Edit, but no Bash, on Sonnet.** It's the only agent that changes files, and its prompt limits it to `tests/`. I left out Bash on purpose. Running tests and lint happens in the main session (step 4), so the agent that writes tests can't also decide they pass. Without a shell it also can't install packages or run git.

Testing showed this scoping has real teeth. Claude Code treats a subagent's edit to a test file as **sensitive**, so it asks for approval even under `acceptEdits` and an explicit `Edit(tests/**)` rule. In headless runs that edit is refused; interactively you approve it. I think that's correct for an agent whose output is tests, so I documented it rather than working around it.

## Orchestration decision: what runs in parallel and what waits
- **Parallel (step 2): `reviewer` and `test-gap-finder`.** They answer independent questions, "is the code right?" and "which paths are tested?", from the same input files. Neither needs the other's output, so running them together roughly halves the wall-clock time of the analysis. In the live run, both were launched from the same assistant message.
- **Sequential (step 3): `test-writer` waits for both.** It needs the gap table to know *what* to test, and it needs the reviewer's findings to know *what not to lock in*. Where the reviewer flagged a bug, a test of current behaviour would pass while asserting the bug, so the writer records it as `test.todo` with the expected behaviour instead. Starting it before the review finishes would let exactly that slip through.
- **Sequential (step 4): verify after writing.** `npm test` and lint can only run once the tests exist, and they run in the main session, not by the writer. If a *new* test fails because the test is wrong, the writer gets one fix round. If it fails because the app is wrong, the workflow reports a bug and doesn't touch app code.

## How it was tested
I ran it headless against `course-api/` with `claude -p --plugin-dir <repo> "/api-quality:quality-pass routes/users.js"`, in a throwaway worktree:
- All five components loaded under their namespaced names: `api-quality:quality-pass`, `:reviewer`, `:test-gap-finder`, `:test-writer`, `:api-tests`.
- `reviewer` and `test-gap-finder` were launched from the same message (parallel), and `test-writer` only after both returned (dependent).
- The reviewer found real issues, e.g. POST/PUT with no JSON body return a 500 HTML page instead of a 400, and PUT accepts `""`/`null`. The gap finder found 3 untested status codes.
- The test-writer prepared 3 tests and the matching todos, but saving them needs interactive approval (see above). The main session then ran `npm test` (5/5) and lint (clean).
- I unit-tested the hook script directly: exit 2 with ESLint's `no-undef` output on a planted error, exit 0 for clean files, non-JS files and projects without ESLint. It finds ESLint by walking up from the edited file, so it works in `course-api/` and in any other repo the plugin is installed into.
