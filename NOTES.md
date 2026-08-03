# NOTES

## What this plugin does

`code-quality-kit` bundles a two-agent code-quality workflow for Express-style APIs: `code-reviewer` reads the code and reports bugs, convention violations, and test-coverage gaps; `test-writer` takes those concrete findings and fixes the bugs / adds the missing tests, then confirms with `npm test` and `npm run lint`. A skill (`api-conventions`) gives both agents a shared checklist of this project's conventions, and a `PostToolUse` hook runs `eslint` automatically after any edit to a `course-api/*.js` file so drift gets flagged the moment it's introduced, not at review time.

## How to install

From this repo, as a marketplace:

```
/plugin marketplace add <this-repo-url-or-local-path>
/plugin install code-quality-kit@code-quality-kit-marketplace
```

Or for local development, from the repo root:

```
claude --plugin-dir .
```

Then set up the target codebase once (`cd course-api && npm install`) and run `/ship` from a Claude Code session.

## One scoping decision, and why

`code-reviewer` is restricted to `Read, Grep, Glob` — no `Edit`, `Write`, or `Bash` — and runs on `sonnet`. Its whole job is to *find* problems and describe them precisely enough for another agent to act on; giving it write access would blur the boundary between "reporting a bug" and "silently patching it," which defeats the point of having a dedicated review step whose output can be inspected before anything changes. `sonnet` is enough model for pattern-matching against a fixed conventions checklist and spotting missing validation/coverage — it doesn't need to reason about multi-step code changes.

`test-writer`, by contrast, gets `Read, Grep, Glob, Edit, Write, Bash` and runs on `opus`, because its job is the opposite: take findings and actually change code and tests correctly, then verify the change by running the suite. That requires both file mutation and the judgment to make a minimally-invasive, convention-correct fix rather than a naive one — hence the stronger model. Splitting review and fix into two differently-scoped agents also means a run of `/ship` never silently edits code without first producing an inspectable list of findings.

## One orchestration decision, and why

`/ship` runs two `code-reviewer` passes in **parallel** — one scoped to `routes/` + `db/store.js`, one scoped to `tests/` — because they read disjoint parts of the codebase and neither needs the other's output to do its job; running them concurrently is strictly faster with no loss of correctness. The `test-writer` pass is **sequential and dependent**: it needs the *combined* findings from both review passes as its input (a bug review pass and a coverage review pass together tell it what to fix and what to test), so it cannot start until both finish. That dependency is real, not just convenient ordering — acting on partial or stale findings would risk fixing the wrong thing or duplicating a test that the other review pass already accounted for.
