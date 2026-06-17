# NOTES — code-quality plugin

## What it does

`code-quality` bundles a small, themed quality workflow for the Express API in `course-api/`:

- **`/code-quality:quality-pass`** — the entry point. It runs a two-phase pass: a parallel inspection (review + test-gap scan), then a dependent step that writes the missing tests.
- **`code-reviewer`** subagent — read-only reviewer that reports bugs, missing validation, and convention breaks.
- **`test-author`** subagent — writes/extends tests and runs the suite to confirm green.
- **`quality-checklist`** skill — the project's quality rules to verify a change against.
- **auto-lint hook** — runs ESLint on JS files under `course-api/` after every Write/Edit, advisory only.

## Install

```bash
# From a clean checkout, add this repo as a marketplace and install the plugin:
/plugin marketplace add <this-repo-url-or-path>
/plugin install code-quality@mars-code-quality-marketplace
```

Or load it directly for local development from the repo root:

```bash
claude --plugin-dir .
# then, inside the session:
/code-quality:quality-pass
```

## One scoping decision — why `code-reviewer` is read-only

`code-reviewer` is restricted to `Read, Grep, Glob` and runs on **sonnet**. A reviewer's only job is to *surface* problems, so it has no business editing files — giving it `Write`/`Edit` would let a critique silently mutate the code it's judging, which destroys the separation between "find the problem" and "fix the problem". Keeping it read-only also makes it safe to run twice in parallel in Phase 1 (review + coverage scan) with zero risk of write conflicts. Sonnet is enough: spotting convention breaks and missing status codes in a tiny codebase doesn't need the heavier model.

By contrast, `test-author` genuinely changes code, so it gets `Write, Edit, Bash` (Bash to actually run `npm test`) and runs on **opus** — writing correct, non-duplicative tests and reasoning about whether a failure is a test bug or a real code bug is the harder job and earns the stronger model.

## One orchestration decision — parallel vs. sequential

**Phase 1 is parallel.** The review and the test-gap scan read the same source but share no state and neither needs the other's output — running them together halves the wall-clock for the inspection. Because both are read-only, parallelism is also safe: no two agents are writing files at once.

**Phase 2 is sequential (dependent).** `test-author` cannot start until both Phase-1 reports exist, because its input *is* their combined output — it writes tests for the gaps the scan found and pins down the bugs the reviewer flagged. Starting it early would mean writing tests blind. So the workflow deliberately waits at the phase boundary: independent work runs together, dependent work waits for its inputs.
