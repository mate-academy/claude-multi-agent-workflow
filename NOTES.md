# NOTES

## What it does

`code-quality` is a Claude Code plugin that bundles a small multi-agent workflow for keeping `course-api/` (the Express API used throughout this course) clean:

- **`code-reviewer`** subagent — reads code and returns a severity-ordered list of findings. Never edits anything.
- **`code-fixer`** subagent — takes a concrete problem (findings, a failing test, a lint error) and applies the minimal correct edit, verifying with `npm test` / `npm run lint`.
- **`/qa`** command — orchestrates the two subagents into a workflow: parallel review, then a dependent fix pass.
- **`api-review-checklist`** skill — the project-specific conventions (status codes, error shapes, validation, test quality) both subagents check against.
- **`hooks/hooks.json`** — a `PostToolUse` hook that lints a file the moment `code-fixer` (or anyone) writes or edits it under `course-api/`, so lint errors surface immediately instead of only at the end.

## Install

Local development, from the repo root:

```
claude --plugin-dir .
```

then run `/qa` (namespaced as `code-quality:qa`) with `course-api/` in context. `cd course-api && npm install` first if you haven't.

Once published as a marketplace (`.claude-plugin/marketplace.json` is already in this repo):

```
/plugin marketplace add <this-repo>
/plugin install code-quality@code-quality-marketplace
```

## Scoping decision: why `code-reviewer` is read-only and `code-fixer` isn't

`code-reviewer` gets `Read, Grep, Glob` only — no `Edit`/`Write`/`Bash`. The point of running review as a separate step *before* any fix is applied is to get an honest, uninfluenced diagnosis: a subagent that can edit tends to reach for a fix as soon as it spots something, which skips the "is this actually the right fix, and did I miss something else" pass that a dedicated review step is for. Restricting its tools enforces that discipline structurally instead of relying on the prompt alone — it *cannot* silently patch something as a side effect of "reviewing" it, so `/qa`'s Step 2 always has a complete, independent findings list to work from before any code changes.

`code-fixer` gets `Read, Grep, Glob, Edit, Write, Bash` because its whole job is to turn a diagnosis into a change and then prove the change is correct — that last part needs `Bash` to actually run `npm test` / `npm run lint`, not just claim it did.

Model-wise, `code-reviewer` runs on `opus`: judging whether an error path is really missing, or whether a test is meaningfully weak, is the kind of open-ended reasoning that benefits from the strongest model. `code-fixer` runs on `sonnet`: by the time it runs, the problem is already scoped (a specific finding, a specific failing test), so it's executing a defined task rather than diagnosing one — `sonnet` is enough and cheaper/faster for that.

## Orchestration decision: why Step 1 is parallel and Step 2 is sequential

`/qa` Step 1 launches two `code-reviewer` invocations at once — one scoped to `course-api/routes/`, one to `course-api/tests/`. These are independent: reviewing route handlers doesn't need the test-review's output or vice versa, they're read-only (no risk of two agents stepping on the same edit), and they touch non-overlapping files. Running them in parallel just makes `/qa` faster with no downside.

Step 2 (`code-fixer` applying fixes) has to be sequential *after* Step 1 completes, because it's genuinely dependent: it needs the merged findings from both reviews as its input, and it can't start deciding what to change before it knows what's wrong. It also has to run as a single agent rather than fanned out, since multiple writers editing the same small set of files in parallel risks conflicting edits — fixes are applied one finding at a time, each verified before moving to the next, which only makes sense sequentially.
