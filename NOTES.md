# NOTES

## What this plugin does

`code-quality` gives `course-api` (or any repo shaped like it) defense-in-depth quality checks, attacking convention drift at three points instead of one:

- **Prevent** — the `new-endpoint` skill scaffolds a brand-new Express resource (route, `db/store.js` helpers, tests) that's convention-compliant from the start.
- **Catch fast** — a `PostToolUse` hook (`check-store-bypass.js`) fires on every `Edit`/`Write` to a route file and heuristically flags the #1 violation (holding state outside `db/store.js`) instantly, without an LLM call.
- **Gate the boundary** — a `PreToolUse` hook (`gate-commit-on-tests.js`) intercepts `git commit`, runs `npm test`, and blocks the commit if it's red.
- **Catch and fix thoroughly** — the `convention-auditor` subagent (read-only) audits against `course-api/CLAUDE.md`'s conventions and missing test coverage, producing a structured checklist; the `fix-and-cover` subagent (write/edit) applies the mechanical fixes and writes missing tests, verified by re-running `npm test`. The `/code-quality-check` command orchestrates both into one sweep.

## Install

Local testing, from the repo root:

```
claude --plugin-dir .
/reload-plugins   # after any edit
```

Once published as a marketplace:

```
/plugin marketplace add <this-repo>
/plugin install code-quality@code-quality-marketplace
```

## One scoping decision — and why

`convention-auditor` is deliberately limited to `Read, Grep, Glob` — no `Edit`, `Write`, or `Bash` — even though it would be "simpler" to let it fix what it finds directly. The reason: its output is a structured checklist consumed by a separate decision point (`fix-and-cover`, or a human reading the report) that decides what's safe to auto-fix versus what needs a human call. Merging review and fix into one agent would remove that checkpoint — every finding would get silently rewritten, including the ones a person should see before the code changes underneath them.

## One orchestration decision — and why

`/code-quality-check` runs `convention-auditor` and `npm test` **in parallel**, then waits for both before invoking `fix-and-cover` **sequentially**. They're parallel because they're genuinely independent signals — one is a semantic/convention judgment call, the other an objective pass/fail — and neither depends on the other's result. `fix-and-cover` has to run after both finish, though: it needs the auditor's checklist to know *what* to fix, and it needs the pre-fix `npm test` baseline to tell a regression it introduced apart from a failure that was already there.