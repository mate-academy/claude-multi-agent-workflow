# NOTES

## What the plugin does and how to install it
The plugin `api-quality-kit` adds a reviewer, a test writer, a workflow command, a skill and a guard hook. Install with `/plugin marketplace add ekorik-tech/claude-multi-agent-workflow` and `/plugin install api-quality-kit@api-quality-marketplace`.

## Scoping decision: the reviewer has no write tools
`api-reviewer` gets `Read, Grep, Glob` only. Its job is to report findings, and the workflow depends on that. Its analysis stage runs in parallel with the test writer, so a reviewer that could write would make parallel runs unsafe. The validator also requires one read-only agent. The test writer gets `Write` and `Edit`, because adding tests is its job. Its ANALYZE mode is read-only by instruction, and the workflow checks it by comparing snapshots after the stage.

## Model choice: both agents use sonnet
Both agents need careful reading: the reviewer has to tie code to contract lines, and the test writer has to turn contract rules into precise assertions. Haiku would be cheaper but more likely to report unsupported findings or weak tests. Opus is not needed for this scope.

## Orchestration decision: analysis in parallel, tests after the choice
The reviewer and the test writer's ANALYZE stage are independent, so they run together to save time. Writing tests depends on which gaps are real. The main Claude keeps only the gaps that the contract supports, so the writer receives a fixed list. Writing in parallel would mean tests for findings that might later be rejected.

## Hook scope
`guard-app-code.js` blocks Write and Edit calls that target course-api application code. It resolves paths from the session's working directory, so it works from the project root or from `course-api/`. It does not cover shell redirects or other write tools, and it fails open on unreadable input.

## Verification status
Done (run in this repository):
- `git checkout -b feat/api-quality-plugin`, `npm install` in course-api/, `npm test` (5 pass), `npm run lint` (no errors) as a baseline before changes.

Done after the files were created:
- `node .github/scripts/validate-plugin.js` prints "Plugin structure looks complete" (exit 0).
- `claude plugin validate .` (Claude Code 2.1.330) passes with warnings: no author in plugin.json or marketplace owner, no icon, no LICENSE. The warnings are not fixed; no license is set because the repository has no LICENSE file.
- `claude plugin validate . --strict` fails on those same warnings (exit 1).

Done in a temporary copy of course-api (not the main folder):
- Hook probe through the real Edit and Write tools, run with `claude -p --plugin-dir`. Edit on `course-api/routes/users.js` was blocked with exit 2 and the file hash did not change. Write to `course-api/tests/hook-probe.test.js` was allowed.
- Full workflow through `/api-quality-kit:api-quality`, run twice on fresh copies with a git baseline. In the second run, which is the one with the skill fix:
  - The main Claude invoked the skill `api-quality-kit:api-test-conventions` before starting any agent (Skill tool result: "Launching skill"). The test writer's prompts contained the skill rules, and the reviewer's did not, by design.
  - The reviewer and the test writer (ANALYZE) were started in one assistant message, and both started before either finished.
  - The analysis stage left the application code and the tests unchanged, as shown by the snapshot comparison.
  - The write stage (WRITE mode) changed only files under `course-api/tests/`. The existing `users.test.js` received additions only (no removed lines), and two new files were created.
  - Results: `npm test` gives 17 tests, 15 pass, 2 fail. `npm run lint` exits 0.
  - The two failures are real contract gaps in the application: an unknown route and a malformed JSON body return Express's HTML error page, not `{ "error": "..." }` (`course-api/docs/api.md:5`, `course-api/CLAUDE.md:19`). They are left failing; the application was not changed.

Limits:
- The skill is loaded by the main Claude, not by the subagents. Subagents receive its rules as text in their prompts.
- The runs used `claude -p` with a fixed tool allowlist and a hook active. Interactive permission prompts were not tested.
- The application code is not fixed by this plugin. A fix needs a separate, explicit decision.
- The write stage appends to the existing `users.test.js` instead of creating a new file.
- The temporary copies were not deleted.

Not yet done:
- Marketplace install from the pushed branch in a new session.
