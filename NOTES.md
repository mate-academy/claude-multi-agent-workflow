# code-quality plugin — notes

## What it does

The `code-quality` plugin adds three behaviours to Claude Code:

- **`/check` command** — runs a code review and a test update in one step. Invoke it after editing a file; it returns a prioritised action list (high bugs → medium issues → test gaps → low findings).
- **`reviewer` agent** — reads changed files and groups findings by severity (high / medium / low). Used by `/check` but can also be invoked directly for a second opinion.
- **`test-writer` agent** — reads changed files alongside the existing test suite and writes or updates tests so coverage reflects what the code actually does. Targets Node's built-in test runner and `supertest`.
- **ESLint hook** — automatically runs `eslint --fix` on any `.js` file the moment Claude writes or edits it, so formatting never drifts.

## How to install

1. Clone or copy this repository.
2. From the project root, run:
   ```
   claude plugin install ./.claude-plugin
   ```
3. Confirm the plugin is active:
   ```
   claude plugin list
   ```
   You should see `code-quality` in the output.

The ESLint hook requires `eslint` reachable via `npx` (i.e. listed in `devDependencies` or installed globally).

## Scoping decision: reviewer gets Read/Grep/Glob but not Edit or Write

The `reviewer` agent is intentionally read-only. It receives `Read`, `Grep`, and `Glob` but not `Edit` or `Write`.

The reason is trust boundary: a reviewer's job is to surface problems for the author to decide on, not to silently patch them. If the agent could write files it might apply a "fix" that looks correct locally but misses wider context — a renamed symbol, a contract expected by another module, a migration dependency. Keeping the reviewer read-only ensures every change stays visible and deliberate. The `test-writer` agent does get `Edit` and `Write` because producing a test file *is* its deliverable; there is no ambiguity about what it should create.

Both agents use `claude-sonnet-5` rather than a smaller model because the reviewer needs genuine reasoning to distinguish a real runtime bug from a stylistic preference, and the test-writer needs to read multiple files and synthesise correct test logic. A lighter model saves cost but tends to produce shallow findings and tests that pass trivially.

## Why /check runs the two agents in parallel

`/check` has two phases:

**Phase 1 — parallel:** the `reviewer` and `test-writer` agents run at the same time.  
**Phase 2 — sequential:** their outputs are collected and merged into a single prioritised list.

The reviewer reads the changed files and returns a finding list. The test-writer reads the same changed files plus the existing test suite and returns updated test content. Neither agent's output is an input to the other — they share source material but their work is completely independent. Running them in parallel cuts wall-clock time roughly in half with no coordination overhead.

Phase 2 must run after both agents finish because it needs the reviewer's severity buckets and the test-writer's test summary to assemble the final list in the right order. That dependency is real, so it runs sequentially.
