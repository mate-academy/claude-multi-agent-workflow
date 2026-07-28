# Code Quality Plugin — Design

Date: 2026-07-27

## Purpose

Ship a Claude Code plugin, `code-quality`, that bundles a two-agent review/fix
workflow, tested against `course-api/`. The plugin and the repo's
`.claude-plugin/marketplace.json` are the same repo (this is also the
marketplace that offers the plugin).

## Components

### Plugin manifest — `.claude-plugin/plugin.json`
`name: "code-quality"`, `version: "0.1.0"`, short description, author. Only
manifest files live inside `.claude-plugin/`; every component folder
(`agents/`, `commands/`, `skills/`, `hooks/`) sits at the repo root.

### Subagents — `agents/`

**`code-reviewer.md`** (read-only)
- `tools: Read, Grep, Glob`
- `model: sonnet` — judging whether something is a real bug vs. acceptable
  style needs real reasoning, not just pattern matching.
- Triggers when someone wants a quality/bug/convention pass over the API
  code.
- Reads `course-api/` (routes, store, tests), checks it against the
  project's own conventions (input validation → 400, 404 on missing record,
  `{ "error": "message" }` shape, all data access through `db/store.js`),
  and returns a structured list of findings: file, line, problem,
  severity.

**`code-fixer.md`** (writes)
- `tools: Read, Grep, Glob, Edit, Bash` — Bash is scoped to running
  `npm test` / `npm run lint` inside `course-api/` to confirm a fix didn't
  break anything, not general shell access.
- `model: sonnet` — same reasoning bar as the reviewer, since it has to
  produce a correct patch, not just any patch.
- Triggers when there's a findings list and/or failing tests/lint to act
  on.
- Applies the minimal fix for each finding, re-runs `npm test` and
  `npm run lint`, and reports what changed and the final pass/fail state.

### Workflow command — `commands/quality-check.md`

1. **Parallel step:** run `code-reviewer` and, at the same time, run
   `npm test` + `npm run lint` inside `course-api/`.
2. **Dependent step:** once both finish, run `code-fixer`, handing it the
   reviewer's findings plus any test/lint failures as context.
3. Close with a summary: what was found, what was fixed, final test/lint
   result.

This gives the required "at least one parallel step and one dependent
step": the review and the test/lint run concurrently because they're
independent; the fix step must wait because it needs both results.

### Skill — `skills/code-conventions/SKILL.md`

Documents `course-api`'s conventions (validation, 400/404 rules, error
shape, `store.js` as the single data-access path) so both agents have a
shared, explicit definition of "problem" vs. acceptable style, instead of
re-deriving it from scratch each run.

### Hook — `hooks/hooks.json` + `hooks/lint-on-edit.js`

`PostToolUse` hook matching `Edit|Write`: after any edit, runs ESLint on
the touched file via `${CLAUDE_PLUGIN_ROOT}/hooks/lint-on-edit.js` and
prints warnings immediately — fast feedback independent of the workflow
command. No hardcoded absolute paths.

### Marketplace — `.claude-plugin/marketplace.json`

Lists `code-quality` with `source: "./"` so the repo can be added as a
marketplace and the plugin installed from it.

## Testing plan

- Run `.github/scripts/validate-plugin.js` locally to confirm structural
  validity before pushing (same check CI runs).
- Load with `claude --plugin-dir .` from the repo root; run
  `/code-quality:quality-check` against `course-api/`; confirm the
  reviewer and the test/lint run concurrently and the fixer waits for
  both.
- Add/keep `course-api` tests green (`npm test` in `course-api/`).

## Out of scope

- No changes to `course-api`'s actual routes/behavior beyond what the
  fixer agent addresses when actually run.
- No CI changes — `.github/workflows/validate.yml` already covers
  structural validation.
