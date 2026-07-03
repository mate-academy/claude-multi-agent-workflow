# GQPlug — notes

## What it does
GQPlug is a **code-quality workflow** for the Express `course-api/`. It bundles:

- **`api-reviewer`** (agent) — a read-only reviewer of routes, the store, and server wiring.
- **`test-author`** (agent) — writes and runs tests in `course-api/tests/`.
- **`/quality-gate`** (command) — orchestrates both agents into one review → test pass.
- **`api-conventions`** (skill) — the API's route/status/store/error conventions.
- **post-edit lint hook** — lints `course-api/` after any Write/Edit, advisory only.

## Install
Local (development):
```
claude --plugin-dir .
```
Use `/reload-plugins` to pick up edits. Components are namespaced, e.g. `/gqplug:quality-gate`.

As a marketplace (first user):
```
/plugin marketplace add <this-repo>
/plugin install gqplug@gqplug-marketplace
```

Then run the workflow against the API:
```
/quality-gate routes/users.js
```

## One scoping decision
**`api-reviewer` is limited to `Read, Grep, Glob` on `model: opus`.** A reviewer's whole value is judgment, and judgment is where the strongest model pays off — so it gets `opus`. But a reviewer should never be able to "fix" what it finds; that would blur review and change into one unaccountable step. Restricting it to read-and-search tools makes the boundary structural, not a matter of trust: it can point at `file:line` and describe the fix, but the edit is always a separate, visible action. `test-author`, by contrast, does mechanical, well-specified work, so it runs on the cheaper `model: sonnet` and gets `Write, Edit, Bash` because it genuinely needs to create files and run the suite.

## One orchestration decision
Inside `/quality-gate`, **review and lint run in parallel, but test-authoring runs sequentially after them.** Review and lint are independent — neither reads the other's output — so running them together halves the wait. Test-authoring is deliberately *dependent*: it consumes the reviewer's list of coverage gaps as its work list, so it cannot start until the review finishes. Making it wait isn't a limitation — it's the point: the tests written are exactly the ones the review proved were missing.
