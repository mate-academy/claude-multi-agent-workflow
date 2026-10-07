# Workflow notes

## Purpose and installation

api-quality bundles two complementary workers, a workflow command, an API contract skill, and a post-edit lint hook. Load the complete repository with `claude --plugin-dir .`; run `/api-quality:check-api main` on a feature branch. A marketplace catalog lists api-quality under the matching manifest name. Add a local complete checkout as a marketplace and install api-quality@walle-api-tools; the GitHub shorthand applies once the plugin is present on the fork default branch. This submission does not merge an upstream PR automatically.

## Scoping decision

api-reviewer has only Read, Grep, Glob, so it cannot edit files or execute shell commands. The coordinator provides an explicit frozen Git diff because the reviewer has no Bash tool. api-test-writer also gets Write/Edit to create regression cases, but no Bash. Both use Sonnet for multi-file reasoning. The writer tests-only path restriction is a prompt rule, not a filesystem sandbox; the coordinator must inspect the final diff.

## Orchestration decision

The initial reviewer and test writer receive the same immutable route snapshot and run in parallel: defect analysis and missing-test design are independent, and the reviewer ignores concurrent test edits. The coordinator waits for both before running the full suite and lint. A final reviewer pass depends on the resulting tests, actual command output, and final diff, so it runs sequentially. No concurrent production-file writers are involved.

## Actual checks versus theoretical walkthrough

Actually performed by Codex: created all component files, ran the repository plugin validator and Claude CLI manifest/component validator, installed the included API dependencies, ran its five existing tests and lint, and exercised the hook command directly against this repository. The marketplace JSON was checked locally. No credentials or tokens are included.

Interactive `claude --plugin-dir .`, namespaced command dispatch, skill routing, subagent execution, hook lifecycle triggering, and clean-session marketplace installation are theoretical here: this account lacks the paid Claude Code plan. Expected flow: review and test writing start together, both reports arrive, full checks run once edits settle, and final review consumes those results. Direct CLI structural validation and a direct lint command do not prove model routing or an actual parallel Claude run.

The included API tests are a baseline, not proof of all edge cases. Inspection shows POST uses truthiness rather than type validation and PUT accepts supplied values without type validation; stricter string validation needs a clarified contract before tests impose it. Do not claim those routes were fixed by this plugin submission.
