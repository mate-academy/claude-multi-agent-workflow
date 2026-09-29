# Notes on the shipmate plugin

## What it does and how to install it

`shipmate` is a pre-PR code-quality workflow for this Express API (`course-api/`). It bundles two subagents (a read-only reviewer and a test-writer), a workflow command that orchestrates them, a skill that teaches Claude the project's route pattern, and a hook that blocks commits while tests are red.

Install it from a fresh session:

```
/plugin marketplace add anomajaya/claude-multi-agent-workflow
/plugin install shipmate@shipmate-marketplace
```

Or for local development, `claude --plugin-dir .` from this repo's root.

## Scoping decision: why `code-reviewer` is read-only and `test-updater` isn't

`code-reviewer` gets `tools: Read, Grep, Glob` only — no `Write` or `Edit`. A reviewer's job is to *find* problems and report them; giving it write access would let it "fix" things silently, which defeats the point of a review step you can read before anything changes. Keeping it read-only also means it's safe to run in parallel across multiple scopes (routes and tests) without any risk of the two instances stepping on each other's edits.

`test-updater`, by contrast, needs `Write`, `Edit`, and `Bash` (plus `Read`/`Grep`/`Glob` to find what it's updating) because its whole job is to change test files and then run `npm test` to confirm the result. Both agents use `model: sonnet` — reviewing for convention violations and writing correct test cases both need real reasoning about the code's behavior, not just pattern-matching, so a lighter model wasn't worth the risk of missing something.

## Orchestration decision: why the review runs in parallel and the test fill-in runs after

`/shipmate:ship-check`'s step 1 launches two `code-reviewer` subagents at the same time — one over `routes/` and `db/store.js`, one over `tests/`. These two reviews don't depend on each other's output at all (one is checking application code, the other is checking test code against it), so running them sequentially would just be wasted wall-clock time for no benefit.

Step 2 (`test-updater`) has to run *after* step 1 finishes, because it needs step 1's findings as its actual input — it only acts on the specific coverage gaps the reviewers flagged. Running it in parallel with the reviews would mean it starts with nothing to do, since the gaps it's supposed to fill haven't been identified yet. That's the real dependency: step 2 consumes step 1's output, so it has to wait for it.
