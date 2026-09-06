# Notes

## What the plugin does

`code-quality` is a small multi-agent workflow for keeping an Express API honest as it changes. Running `/ship` reviews the codebase for bugs, missing validation, and untested behavior, then automatically writes the tests needed to close the gaps it found, and confirms the suite still passes. A `PostToolUse` hook additionally lints any JS file the moment it's written or edited, so feedback shows up during editing, not just at review time.

## Install

As a marketplace, from this repo:

```
/plugin marketplace add ktroch/claude-multi-agent-workflow
/plugin install code-quality@ktroch-marketplace
```

Or locally while developing, from the repo root:

```
claude --plugin-dir .
```

Test it against the bundled API:

```
cd course-api && npm install
```

then run `/ship` from a Claude Code session with the plugin loaded.

## Scoping decision: why code-reviewer is read-only and on the bigger model

`code-reviewer` gets only `Read, Grep, Glob` and runs on `opus`, while `test-writer` gets `Read, Grep, Glob, Write, Edit, Bash` and runs on `sonnet`.

Reviewing is the part of this workflow where mistakes are expensive and hard to catch after the fact: it has to hold the whole route/db/test relationship in mind at once, notice a missing edge case that isn't obviously wrong, and not talk itself into "this is probably fine." That reasoning load is worth the larger model. But a subagent that's only ever asked to *look* at code and report findings has no reason to hold `Write` or `Edit` — giving it those tools would mean a prompt-injected file or a bad instruction could turn "review this" into "silently patch this," which is exactly the failure mode a review step exists to prevent. Keeping it read-only makes the boundary enforceable, not just a suggestion in the prompt.

`test-writer`'s job — turn a list of already-identified gaps into new test files that match an established pattern — is mechanical enough that `sonnet` handles it well, and it genuinely needs `Write`/`Edit` (to create the tests) and `Bash` (to run `npm test` and confirm they pass) to do its job at all.

## Orchestration decision: why the reviews run in parallel and test-writing runs after

The two `code-reviewer` calls in step 1 look at disjoint parts of the codebase (`routes/` vs. `db/` + `tests/`) and produce independent findings — neither one needs to know what the other found to do its job, so running them sequentially would just be waiting for no reason. Parallelizing them means the review half of `/ship` takes as long as the slower of the two, not the sum of both.

`test-writer` runs after, and only after, because it is genuinely dependent: it needs the combined list of untested behaviors before it can decide what to write, and writing tests against a codebase that hasn't been reviewed yet risks locking in the wrong behavior as "correct" (i.e., writing a passing test for a route that actually has a bug). Making that step wait for both reviews isn't a performance choice — it's about correctness of the final test suite.
