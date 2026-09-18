# NOTES

## What this plugin does

`code-quality-kit` is a two-agent code-quality workflow for the `course-api` Express project. It reviews existing routes for convention compliance, and — when a new resource is requested — scaffolds the route and re-checks it before calling the work done.

## Install

From a fresh Claude Code session, with this repo pushed to GitHub:

```
/plugin marketplace add iirovpulkkinen-del/claude-multi-agent-workflow
/plugin install code-quality-kit@code-quality-kit-marketplace
```

To iterate on the plugin itself, run `claude --plugin-dir .` from the repo root instead, and `/reload-plugins` after each edit.

## Scoping decision: why `api-reviewer` only gets `Read, Grep, Glob`

`api-reviewer`'s job is to catch convention violations (missing validation, wrong status code, wrong error shape) and describe them — it never needs to change a file to do that. Giving it write access would let a review silently turn into an edit, which hides what changed from whoever asked for the review. Keeping it read-only also means it's safe to run against routes automatically (e.g. from the hook) without risking an unreviewed change slipping in. `route-scaffolder`, by contrast, exists specifically to produce new files, so it needs `Write`, `Edit`, and `Bash` (the last to run `npm test`/`npm run lint` after generating code) — its whole value is making a change, so scoping it down to read-only would defeat the point.

## Orchestration decision: why the workflow runs reviews in parallel but scaffolding after

The two review targets, `routes/users.js` and `routes/health.js`, don't depend on each other in any way — reviewing one doesn't need the outcome of reviewing the other, so running them at the same time (parallel step) gets the same result faster than reviewing them one at a time. Scaffolding a new route is different: it needs to follow the same conventions the review step just confirmed (or flagged as broken) in the existing code, so it has to run after that step finishes, not alongside it (dependent step). The final re-review of the newly scaffolded file is dependent for the same reason — there's nothing to review until the scaffolder has produced a file.

## Verified

- **Local (`claude --plugin-dir .`)**: `/code-quality-kit:quality-check` reviewed `users.js` and `health.js` in parallel, correctly skipped scaffolding when no new resource was requested, then on a second run scaffolded a full `products` resource (route, store helpers, `server.js` mount) and re-reviewed it — `npm test` and `npm run lint` stayed clean throughout. That `products` resource is committed in `course-api/` as evidence the write path works end to end.
- **Marketplace install, fresh session**: `claude plugin marketplace add iirovpulkkinen-del/claude-multi-agent-workflow` then `claude plugin install code-quality-kit@code-quality-kit-marketplace` (the CLI form of `/plugin marketplace add` / `/plugin install`) installed cleanly from the pushed repo, and the command ran from the real install — not the local dev copy — and correctly proposed a dependent scaffolding step (a missing `DELETE /users/:id`) when it spotted a gap during review.
