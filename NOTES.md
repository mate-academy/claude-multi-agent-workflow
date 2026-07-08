# NOTES

## What the plugin does

`code-quality` bundles a review-and-fix workflow for `course-api/`:

- `code-reviewer` — a read-only subagent that audits code against the project's conventions (routing, input validation, error shape, data access through `db/store.js`) and returns a findings list.
- `code-fixer` — a subagent that takes findings and applies the actual edits, then verifies with `npm run lint` and `npm test`.
- `/code-check` — a workflow command that runs both reviewer instances in parallel, merges their findings, and hands them to the fixer in a dependent step.
- `skills/api-conventions` — the conventions checklist both subagents rely on, and that anyone can pull in directly.
- `hooks/hooks.json` — a `PostToolUse` hook that re-lints `course-api/` automatically right after an edit lands, via a bundled script resolved through `${CLAUDE_PLUGIN_ROOT}`.

## Install

```
/plugin marketplace add tuitioner/claude-multi-agent-workflow
/plugin install code-quality@claude-multi-agent-workflow
```

Or locally, from the repo root: `claude --plugin-dir .`, then `/reload-plugins` after edits.

## Scoping decision: why code-reviewer is Read/Grep/Glob + opus, and code-fixer is Read/Grep/Glob/Edit/Bash + sonnet

`code-reviewer` is scoped to `Read, Grep, Glob` with no `Edit` or `Bash` on purpose — its whole job is to judge code without the possibility of side effects, so a review run can never accidentally change the codebase it's evaluating. Because judging whether something is actually a bug (versus intentional) is the hard, ambiguous part of the workflow, it runs on `opus` — the stronger model, spent where the reasoning is genuinely hard.

`code-fixer` gets `Edit` (to make the change) and `Bash` (to run `npm run lint` / `npm test` and confirm the fix), since editing without being able to verify would leave fixes unchecked. Its job is mechanical once handed concrete findings — apply the smallest edit that resolves each one — so it runs on `sonnet`, a lighter model, rather than paying for `opus` on work that doesn't need open-ended judgment.

The split also means a run of `/code-check` can never silently mix "found a problem" with "changed a file": only one subagent in the pipeline is ever capable of writing.

## Orchestration decision: why /code-check parallelizes the review but not the fix

The two review passes — `routes/` and `db/store.js` + `server.js` — don't read each other's output and don't touch the same files, so there's nothing to gain from running them one after another; they run as two parallel `code-reviewer` launches and the workflow just waits for both.

The fix pass is deliberately sequential and dependent on both reviews finishing. `code-fixer` needs the *combined, de-duplicated* findings list to avoid two independent, possibly-conflicting fixes landing in the same file (e.g. `server.js`, which the db-focused review pass also touches). Running the fixer against only one reviewer's partial results would risk it "fixing" something the other pass already flagged differently, or missing an issue entirely. So review is parallel because it's independent read-only work; fixing is sequential because it's a single writer that must act on the full picture.
