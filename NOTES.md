# NOTES

## What the plugin does

`code-quality` is a small plugin for reviewing and fixing code in `course-api/` (the Express API bundled in this repo). It bundles:

- **`agents/code-reviewer.md`** — a read-only subagent that reads routes, `db/store.js`, and tests, and reports convention violations and bugs against the project's own `CLAUDE.md` (missing `400`/`404` handling, wrong error shape, state held outside `db/store.js`, unused vars, logic bugs). It never edits anything.
- **`agents/quality-fixer.md`** — a subagent that takes a list of already-identified findings, applies the smallest correct edit for each, adds a regression test if one is missing, and re-runs `npm run lint` / `npm test` to confirm the fix holds.
- **`commands/code-quality.md`** — the `/code-quality:code-quality` command, which runs both subagents as a workflow: two `code-reviewer` instances in parallel over disjoint parts of the codebase, then one `quality-fixer` run that depends on both finishing.
- **`skills/api-conventions/SKILL.md`** — a skill that surfaces course-api's house rules (validation, status codes, error shape, state ownership) whenever Claude is writing or editing code there directly, not just when a subagent is invoked.
- **`hooks/hooks.json`** — a `PostToolUse` hook that runs `hooks/scripts/lint-file.js` after every `Edit`/`Write`, auto-fixing what ESLint can fix on the touched file and reporting back anything it can't.

### Install

From a fresh Claude Code session, as your own first user:

```
/plugin marketplace add RFrams/claude-multi-agent-workflow
/plugin install code-quality@claude-multi-agent-workflow
```

Or, for local development straight from a checkout, skip the marketplace entirely:

```
claude --plugin-dir .
```

Either way the components load under the `code-quality:` namespace — e.g. `/code-quality:code-quality`, `code-quality:code-reviewer`.

## Scoping decision: why `code-reviewer` and `quality-fixer` differ

`code-reviewer` gets `tools: Read, Grep, Glob` and `model: opus`. `quality-fixer` gets `tools: Read, Edit, Write, Grep, Glob, Bash` and `model: sonnet`. Two separate calls, made for two different reasons:

- **Tools**: a reviewer that can't write anything is a stronger guarantee than a reviewer that's merely instructed not to. Keeping it read-only means its output is always safe to run unattended (e.g. inside the parallel step of the workflow) — there's no risk of it silently "fixing" something it was only asked to look at. `quality-fixer` needs `Edit`/`Write` because its whole job is applying changes, and `Bash` because "the fix holds" is only real once `npm run lint` / `npm test` actually pass — a fixer that can't run tests can only ever claim success, not verify it.
- **Model**: reviewing means forming a judgment about unfamiliar code with no ground truth to check against — is this actually a bug, does this validation gap actually matter, is this convention violation worth flagging — which benefits from the strongest reasoning available, so it got `opus`. Fixing, by contrast, is scoped and mechanical once a finding is named: apply the specific fix, run the specific tests. That doesn't need frontier-level judgment, so `sonnet` is a better cost/latency fit for work that's well-specified and self-verifying (lint/test either pass or they don't).

## Orchestration decision: why parallel, then sequential

The workflow command runs two `code-reviewer` instances **in parallel** — one over `routes/` and `db/store.js`, one over `tests/` — because they read disjoint files and neither depends on the other's output. Nothing is gained by making them wait on each other, and running them together halves the wall-clock time of the review phase.

`quality-fixer` runs **sequentially, after both reviewers finish**, because it isn't independent work — it needs the combined findings list as its actual input. It doesn't go looking for problems itself; without both reviews done, it has nothing correct to act on. Running it in parallel with the reviewers would mean fixing based on incomplete (or no) information, which defeats the point of separating "find problems" from "fix problems" into two subagents in the first place.
