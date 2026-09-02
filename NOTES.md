# NOTES

## What the plugin does

`code-quality` is a Claude Code plugin that bundles a multi-agent code review and fix workflow, built and tested against the Express API in `course-api/`. It packages:

- Two subagents (`agents/`): `code-reviewer` (read-only) and `quality-fixer` (writes/edits).
- A workflow command (`commands/quality.md`) that orchestrates both subagents plus `lint`/`test` runs.
- A skill (`skills/code-quality-standards/SKILL.md`) capturing this project's lint, error-handling, and test conventions.
- A hook (`hooks/hooks.json`) that runs a lint check after every `Edit`/`Write`.

## How to install

From a marketplace:

```
/plugin marketplace add Bohdan-Maksymiuk/claude-multi-agent-workflow
/plugin install code-quality@claude-multi-agent-workflow
```

Or locally, from the repo root:

```
claude --plugin-dir .
```

Then run `/code-quality:quality` (or the workflow's namespaced command) against `course-api/`.

## Scoping decision: why `quality-fixer` gets `Bash` and `haiku`, while `code-reviewer` doesn't

`code-reviewer`'s job is to read and report — it never needs to touch a file, so its `tools` line is limited to `Read, Grep, Glob`. Giving it `Edit` or `Bash` would let it "helpfully" start fixing things mid-review, which defeats the point of having a separate, deliberate fix step with its own verification. It runs on `sonnet` because judging correctness bugs, security issues, and test-coverage gaps well requires stronger reasoning than a lint pass does.

`quality-fixer`, by contrast, is handed a *concrete* list of problems (lint output, failing tests, or the reviewer's findings) and applies minimal, mechanical fixes — so it needs `Edit` to make the changes and `Bash` to run `npm run lint`/`npm test` itself and confirm each fix actually resolved the problem, rather than trusting that it did. Because the task is well-specified (apply this fix, verify it) rather than open-ended judgment, it runs on the cheaper/faster `haiku` model.

## Orchestration decision: why Step 1 is parallel and Step 2 is dependent

Step 1 runs `code-reviewer` and `npm run lint`/`npm test` at the same time because neither depends on the other's output — the reviewer reads code, while lint/test run independently against the current state of the repo. Running them in parallel gets both sets of findings without one waiting on the other.

Step 2 (`quality-fixer`) must run after Step 1 finishes, because it needs the *combined* findings — the reviewer's issues plus the actual lint errors and failing tests — as its input list. Fixing before those results are in would mean fixing blind, and re-running fixes per source instead of once against a consolidated list.
