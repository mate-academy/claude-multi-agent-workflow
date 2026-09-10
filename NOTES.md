# NOTES

## What this plugin does

`code-quality-workflow` bundles a two-stage review-then-test workflow for `course-api`:

1. A **read-only reviewer** (`code-reviewer`) checks route handlers and the data-access layer for bugs, missing validation, and drift from the project's conventions.
2. A **writing agent** (`test-writer`) turns whatever gaps the review surfaces into real tests in `course-api/tests/`.

The `/check` command runs both as one workflow instead of requiring two manual invocations, and the `api-conventions` skill keeps both agents' output consistent with the existing codebase style rather than each inventing its own.

## Install

```
/plugin marketplace add <this-repo>
/plugin install code-quality-workflow@code-quality-marketplace
```

For local development, load it straight from the checkout instead:

```
claude --plugin-dir .
```

Then, with `course-api/` installed (`cd course-api && npm install`), run `/check` from the repo root.

## Scoping decision: why `code-reviewer` gets `Read, Grep, Glob` + `haiku`, and `test-writer` gets `Write, Edit` + `sonnet`

`code-reviewer`'s entire job is to read code and produce a findings list — it never needs to change anything, so it only gets `Read`, `Grep`, and `Glob`. Keeping it read-only isn't just tidiness: it means the review step in `/check` can safely run twice in parallel over overlapping context (`routes/` and `db/store.js` both reference each other) without any risk of one instance's edits stepping on the other's. A model that can only find and describe problems is also cheap to run often, so it's on `haiku` — the job is pattern-matching against a documented convention list, not deep reasoning.

`test-writer` has to create and modify files, so it needs `Write` and `Edit` (plus `Read`/`Grep`/`Glob` to find the right test file and match its style first). Writing a correct test that exercises the right code path, asserts the right status and body shape, and doesn't duplicate existing coverage takes more judgment than flagging a problem does, so it runs on `sonnet` rather than `haiku`.

## Orchestration decision: why the review runs in parallel and the test-writing step is dependent

The two review scopes — `course-api/routes/` and `course-api/db/store.js` — don't depend on each other's output; each reviewer instance can form its findings from its own scope alone. Running them sequentially would just add latency for no benefit, so `/check` launches both `code-reviewer` calls as a parallel step.

Test-writing is different: `test-writer` needs the *merged* findings from both reviews to know what to cover, and writing a test before knowing what's missing would mean guessing. So it's a dependent step that only starts once both parallel reviews have returned and been combined — the workflow can't skip ahead on it the way it can on the two reviews.
