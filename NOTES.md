# NOTES

## What this plugin does

`code-quality` is a two-agent Claude Code plugin built against `course-api/`, the Express API bundled in this repo. It pairs a read-only reviewer (`api-reviewer`) that checks route and store files against the conventions in `course-api/CLAUDE.md`, with a writer (`api-test-writer`) that turns any gaps it finds into `node:test`/`supertest` coverage and confirms the suite passes. The `/check` command runs both as one workflow; the `api-conventions` skill gives a standalone reference to the same conventions; a `PostToolUse` hook runs `npm run lint` in `course-api/` after every edit so lint failures surface immediately instead of at test time.

## Install

1. `cd course-api && npm install` once, so the API and its test suite are ready to run.
2. Locally, without installing: `claude --plugin-dir .` from the repo root, then `/reload-plugins` after any edit to plugin files.
3. As a marketplace install: `/plugin marketplace add <this-repo>` then `/plugin install code-quality@claude-multi-agent-workflow` in a fresh session.
4. Run `/check` to exercise the workflow against `course-api/routes/`.

## Scoping decision: why api-reviewer only gets Read, Grep, Glob

`api-reviewer`'s whole job is to compare existing code against a fixed list of conventions and report violations — it never needs to change anything to do that. Giving it Write or Edit would let a review step silently turn into an edit step, which breaks the read/write split the workflow depends on: `/check` treats the review phase as safe to fan out in parallel across every route file, precisely because none of those parallel runs can touch a file another one is reading. Restricting it to `Read, Grep, Glob` makes that safety property true by construction instead of by convention, and keeps the model cheap (`haiku`) since pattern-matching against a short, explicit convention list doesn't need a stronger model.

## Orchestration decision: why the review step is parallel and the test-writing step is dependent

The `/check` command runs `api-reviewer` once per route file, all at the same time, because each review is independent — reviewing `users.js` has no bearing on reviewing `health.js`, so there's no reason to make one wait on the other. `api-test-writer` runs after, and only after, every review finishes, because it needs the *combined* findings to know what coverage is actually missing across the whole API, not just one file's worth; running it earlier or in parallel with the reviews would mean writing tests against an incomplete picture of what's broken.
