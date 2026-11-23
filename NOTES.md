# NOTES

## What the plugin does and how to install it
The plugin `api-quality-kit` adds a reviewer, a test writer, a workflow command, a skill and a guard hook.

Before the merge into `main`, install from the branch: `/plugin marketplace add ekorik-tech/claude-multi-agent-workflow#feat/api-quality-plugin`, then `/plugin install api-quality-kit@api-quality-marketplace`. The plain form `/plugin marketplace add ekorik-tech/claude-multi-agent-workflow` works only after the plugin is merged into `main`. `main` does not contain the plugin yet.

## Scoping decision: the reviewer has no write tools
`api-reviewer` gets `Read, Grep, Glob` only. Its job is to report findings, and the workflow depends on that. Its analysis stage runs in parallel with the test writer, so a reviewer that could write would make parallel runs unsafe. The validator also requires one read-only agent. The test writer gets `Write` and `Edit`, because adding tests is its job. Its ANALYZE mode is read-only by instruction, and the workflow checks it by comparing snapshots after the stage.

## Model choice: both agents use sonnet
Both agents need careful reading: the reviewer has to tie code to contract lines, and the test writer has to turn contract rules into precise assertions. Haiku would be cheaper but more likely to report unsupported findings or weak tests. Opus is not needed for this scope.

## Orchestration decision: analysis in parallel, tests after the choice
The reviewer and the test writer's ANALYZE stage are independent, so they run together to save time. Writing tests depends on which gaps are real. The main Claude keeps only the gaps that the contract supports, so the writer receives a fixed list. Writing in parallel would mean tests for findings that might later be rejected.

## Hook scope
`guard-app-code.js` blocks Write and Edit calls that target course-api application code. It resolves paths from the session's working directory, so it works from the project root or from `course-api/`. It does not cover shell redirects or other write tools, and it fails open on unreadable input.

## Verification status

Marketplace install, checked without `--plugin-dir`:
- Installed `api-quality-kit@api-quality-marketplace`, version `0.1.0`, scope `user`, from `ekorik-tech/claude-multi-agent-workflow`, ref `feat/api-quality-plugin`.
- Verified install SHA: `813e04b3340348fecb883e16b27fb2b170d3d54c`. This is a historical record. The version was not bumped for this report. The remote branch pointed to the same SHA at the time of the check.
- The session init lists the plugin, its skill `api-quality-kit:api-test-conventions`, and both agents.

Repository checks:
- `node .github/scripts/validate-plugin.js` prints "Plugin structure looks complete" (exit 0).
- `claude plugin validate .` (Claude Code 2.1.330) passes with warnings: no icon, no author in plugin.json or marketplace owner, no LICENSE. The warnings are not fixed. The repository has no LICENSE file, so none is set.
- `claude plugin validate . --strict` failed on those same warnings (exit 1) in an earlier check.
- Baseline in `course-api/` before any changes: `npm test` 5/5 pass, `npm run lint` no errors.

Workflow run, `/api-quality-kit:api-quality`, on a fresh temporary copy with a git baseline (`claude -p`, project root as cwd):
- The skill `api-quality-kit:api-test-conventions` was loaded (Skill tool result "Launching skill").
- `api-reviewer` and `test-writer` (ANALYZE) started in one assistant message. Both results were received before the write stage.
- The snapshot after analysis showed no differences.
- The WRITE stage changed only files under `course-api/tests/`: `users.test.js` (additions only, no existing assertion changed), and the new `health.test.js` and `errors.test.js`. Writes came after both analysis results.
- Last run: `npm test` 16 tests, 14 pass, 2 fail (exit 1). `npm run lint` exit 0. Earlier runs gave different counts; this run supersedes them.
- Both failing tests expect a `{ "error": "..." }` body:
  - unknown route (`tests/errors.test.js`);
  - malformed JSON body on `POST /users` (`tests/users.test.js`).
  `CLAUDE.md` states JSON error responses as a general rule. `docs/api.md` does not describe these two cases separately. The application code was not changed, and the failing tests were left failing on purpose.

Hook check (`PreToolUse` guard, plugin installed from the marketplace):
- A real Edit of `course-api/routes/health.js` in the temporary copy was blocked: "api-quality-kit: blocked Edit to course-api application code".
- SHA-256 of `routes/health.js`, `routes/users.js`, `db/store.js` and `server.js` was unchanged before and after.
- Earlier probe (with `--plugin-dir`): a Write to `course-api/tests/hook-probe.test.js` was allowed.
- Not checked: Write to protected files, Edit to `server.js`, MultiEdit, shell redirects.

Limits:
- The skill is loaded by the main Claude. Subagents receive its rules as text in their prompts.
- Runs used `claude -p` with `--permission-mode acceptEdits` and a fixed tool list. Interactive permission prompts were not tested.
- The cached plugin files were not compared byte for byte with the clone. The SHA match relies on the install registry and the clone's HEAD.
- The reviewer's findings were inferred from code and were not re-run.
- The write stage appends to the existing `users.test.js` instead of creating a new file.
- The application code is not fixed by this plugin. A fix needs a separate, explicit decision.
- The temporary copies were not deleted. They are under the session scratchpad.
