# Notes — code-quality plugin

## What it does

`code-quality` bundles a two-agent code-review-and-fix workflow for Express APIs, built and tested against `course-api/` in this repo:

- **`code-reviewer`** (read-only) — reads route/db/server code and reports bugs, missing validation, and convention violations, but never edits anything.
- **`test-fixer`** (read+write) — runs `npm test` / `npm run lint`, fixes what's broken, adds missing test coverage, and re-verifies.
- **`/code-quality:audit`** — the workflow command: runs two `code-reviewer` passes in parallel (routes vs. db+server), then hands the combined findings to `test-fixer` for a dependent fix-and-verify pass.
- **`api-review-checklist`** skill — the house rules (validation, status codes, error shape, data access) both agents check against.
- **`PostToolUse` hook** — runs `eslint --fix` on `course-api/` after every `Edit`/`Write`, via a bundled script resolved through `${CLAUDE_PLUGIN_ROOT}` so it works from any install location.

## Install

```
/plugin marketplace add <this-repo>
/plugin install code-quality@dimadiyarov-marketplace
```

Local, no install:

```
claude --plugin-dir .
```

Then, inside `course-api/` (`npm install` once), run `/code-quality:audit`.

## Scoping decision: why `code-reviewer` only gets Read/Grep/Glob

`code-reviewer`'s whole job is to produce a findings list someone (or `test-fixer`) acts on — it never needs to change a file. Giving it Edit/Write/Bash would let review and fix collapse into one uncontrolled step, which defeats the point of having a separate review phase: findings wouldn't be inspectable before code changes, and a review-only agent no longer offers a safety boundary before mutation. Keeping it strictly read-and-search means it can be run freely, in parallel, on code nobody has approved changing yet, with no risk of it touching anything. `test-fixer` gets Edit/Write/Bash because its entire job is to act on those findings and verify the result — a real code change without the ability to run `npm test`/`npm run lint` couldn't be verified before being handed back. This also happens to satisfy the plugin's read-only-vs-writer split.

Both agents use `model: sonnet` rather than `haiku`/`opus`: reviewing for subtle validation gaps and correctness bugs (and later, fixing them without breaking other tests) needs more reasoning than a cheap model reliably gives, but neither task is hard enough to justify paying for the top-tier model on every run.

## Orchestration decision: why the review step is parallel and the fix step is dependent

The two `code-reviewer` runs (routes vs. db+server) don't share any state or read/write the same files, so running them sequentially would just be waiting twice for no benefit — parallelizing them cuts audit latency roughly in half with no downside.

The fix step has to be sequential/dependent, for two reasons: `test-fixer` needs the *combined* findings from both reviews to avoid fixing the same root cause twice or missing one reviewer's findings, and it edits the same files (`routes/`, `server.js`) that were just being read — running it concurrently with the reviews could hand a reviewer a half-edited file and produce garbage findings. So: independent read-only work runs in parallel, and the one step that mutates code waits until every read-only input it depends on has actually finished.
