# NOTES

## What the plugin does

`code-quality` bundles a two-stage code quality workflow for `course-api/`:

- `agents/code-reviewer.md` — reads code and reports quality findings (bugs, style, missing validation/error handling), without changing anything.
- `agents/code-fixer.md` — takes a list of findings and edits the files to resolve them.
- `commands/review-and-fix.md` — the `/code-quality:review-and-fix` command that runs the reviewer in parallel over independent parts of the codebase, then runs the fixer once both reviews are done.
- `skills/code-quality-conventions/SKILL.md` — the project's code quality conventions (routing, data access, validation, error shape) that both agents check against.
- `hooks/hooks.json` — a `PostToolUse` hook that lints any `.js` file right after Claude edits or writes it, via the bundled `hooks/lint-file.js` script.

## Install

From a fresh checkout:

```
/plugin marketplace add <this-repo>
/plugin install code-quality@code-quality-marketplace
```

For local development, load it directly without a marketplace:

```
claude --plugin-dir .
```

Then run `/code-quality:review-and-fix` against `course-api/` (after `cd course-api && npm install`).

## Scoping decision

`code-reviewer` is limited to `Read, Grep, Glob` and runs on `model: haiku`, while `code-fixer` gets `Read, Edit, Write, Grep, Glob` on `model: sonnet`. The reviewer only has to locate and describe issues — a cheap, fast model reading files is enough, and giving it no write access guarantees a review pass can never accidentally change code. The fixer has to make a correct edit that follows the project's conventions without breaking anything else, which needs both write access and a stronger model.

## Orchestration decision

The workflow runs two `code-reviewer` invocations in parallel (one over `routes/` + `db/`, one over `tests/`) because they're independent read-only passes over disjoint parts of the codebase — nothing about reviewing the tests depends on reviewing the routes, so running them at the same time costs nothing and saves time. The `code-fixer` step runs after and depends on both, since it needs the combined findings from both reviews before it can safely edit anything.
