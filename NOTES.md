# NOTES - quality-gate

## What it does and how to install it
`quality-gate` is a pre-PR "code quality" pass for Express APIs. `/quality-gate:quality-pass [path]` runs three subagents as a workflow and returns one report: review findings, mismatches between the docs and the code, and the tests added for untested behaviour. It also ships an `api-conventions` skill with the endpoint house rules, and a PostToolUse hook that lints every `.js` file Claude edits.

Install it from this repo, which is also its marketplace:

```
/plugin marketplace add airnovaeurope/claude-multi-agent-workflow
/plugin install quality-gate@airnovaeurope-tools
```

To use it locally without installing, run `claude --plugin-dir .`.

## One scoping decision: what each subagent may touch, and on which model
- **`route-reviewer` and `docs-checker` get only `Read, Grep, Glob`.** Their job is to find problems, not fix them. With no `Edit`, `Write` or `Bash`, a review can't quietly "fix" code, which would mix judging with changing. And because they can't change anything, they are safe to run in parallel.
- **`test-writer` is the only agent with `Edit, Write, Bash`.** It needs to write test files and run `npm test`. Its body limits it further: tests only, never application code. When a new test exposes an app bug, it marks the test `FAILS` and reports it instead of fixing the app.
- **Models.**
  - `docs-checker` runs on **Haiku**. Comparing a markdown table with route handlers is mechanical, and this step runs on every pass.
  - `route-reviewer` and `test-writer` run on **Sonnet**. Spotting a wrong 400/404 order, or writing tests in the existing style, needs real judgement.
  - I don't use Opus. Nothing in this flow is a hard design problem, and the pass is meant to be cheap enough to run before every PR.

## One orchestration decision: what runs in parallel and what waits
- **In parallel:** `route-reviewer` and `docs-checker`. Both are read-only, both read the same code, and neither needs the other's output, so running them together roughly halves the wait.
- **In sequence:** `test-writer` runs only after the reviewer finishes, because its input is the reviewer's `UNTESTED:` list. If it started at the same time, it would have to guess what to test and would duplicate the reviewer's work. When the list is `none`, the step is skipped instead of writing filler tests.
- **The report** waits for all three, because it merges their outputs.

## Testing against `course-api/`
I worked through the workflow's steps on `course-api/` to check that the outputs are useful.

- **Review.**
  - [medium] `PUT /users/:id` (`routes/users.js:41`) checks for a missing body (400) before checking that the user exists (404). An unknown id with an empty body therefore gets a 400. The `api-conventions` skill says to check the 404 first.
  - UNTESTED: `GET /users/:id` success, `POST /users` 400, `PUT /users/:id` 400.
- **Docs check.** All 5 endpoints MATCH and nothing is undocumented.
- **Tests.** I added the three missing tests to `course-api/tests/users.test.js`. `npm test` went from 5/5 to 8/8 passing, and `eslint` is clean.
- **Hook.** For a deliberately broken file (`bar()` undefined), `lint-changed.sh` exits 2 with ESLint's errors. For a clean file it exits 0, and non-JS files are skipped. It finds the nearest ESLint config above the edited file, so it works in any project, and it is referenced only through `${CLAUDE_PLUGIN_ROOT}`.
- **Structure.** `node .github/scripts/validate-plugin.js` passes, and so does `claude plugin validate .`.

**Honest note.** The Claude Code CLI in the cloud workspace I built this in couldn't sign in. So I couldn't run `claude --plugin-dir .`, the namespaced command, or `/plugin marketplace add` / `/plugin install` in a live session there. The structure is validated offline with both validators above. To verify a fresh install, run the two install lines, then `/quality-gate:quality-pass course-api`.
