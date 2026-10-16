# Notes on code-quality-kit

## What it does and how to install

`code-quality-kit` bundles a review-and-test workflow for Express-style APIs, built and tested against `course-api/` in this repo. It ships two subagents (`code-reviewer`, `test-writer`), a workflow command (`/code-quality-kit:quality-check`), a shared conventions skill (`api-conventions`), and a `PostToolUse` lint hook.

Install from this repo as a marketplace:

```
/plugin marketplace add Sameerabusara/claude-multi-agent-workflow
/plugin install code-quality-kit@claude-multi-agent-workflow
```

Or load it locally while developing: `claude --plugin-dir .` from the repo root.

## Scoping decision: why the two agents have different tools and the same model

`code-reviewer` is scoped to `Read, Grep, Glob` only — it has no way to change code, by design. A review is supposed to be a second opinion on existing changes; giving it `Edit`/`Write` would let it "fix" the very thing it's meant to be reporting on, which hides the finding instead of surfacing it, and the validator's split (read-only reviewer vs. a writer) also encodes this separation of concerns.

`test-writer` needs `Write`, `Edit`, and `Bash` because its job is unavoidably mutating: it has to create or update test files under `course-api/tests/` and then actually run `npm test` to prove they pass. Read-only tools can identify a coverage gap but can't close it.

Both use `model: sonnet` rather than a cheaper model, because both jobs require judgment, not pattern matching: the reviewer has to reason about whether a missing branch is a real bug versus an intentional simplification, and the test-writer has to reason about which inputs actually exercise a given validation path. A faster/cheaper model would pattern-match on surface structure and miss edge cases in a ~100-line Express app where the bugs are precisely in the edge cases.

## Orchestration decision: why Step 1 is parallel and Step 2 is sequential

Step 1 (review + coverage scan) runs `code-reviewer` and `test-writer` (scan mode) in parallel because they're independent reads of the same, currently-unchanged code: the reviewer doesn't need the coverage scan's output to find a bug, and the scan doesn't need the review's output to notice a route has no test file. Running them concurrently halves the wall-clock time of the workflow's first half with no cost, since neither mutates anything a step 1 process depends on.

Step 2 (write tests, then verify) must be sequential, not parallel, because it's a genuine dependency chain: `test-writer` can't write tests for gaps it doesn't know about until Step 1's scan finishes, and `npm test` can't verify tests that don't exist yet until the write step finishes. Collapsing this into one step, or running it in parallel with Step 1, would mean testing against stale information or verifying before the files exist.
