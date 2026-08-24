# Notes — code-quality-guard

## What it does

`code-quality-guard` is a two-agent code-quality workflow for the course Express API. Running `/guard` reviews `course-api/routes/` and `course-api/db/store.js` for validation, status-code, and error-shape problems, then hands those findings to a second agent that writes or updates the matching tests in `course-api/tests/` and runs the suite to confirm they pass. A bundled hook lints any `.js` file the moment it's edited or written, and a shared skill (`api-conventions`) keeps both agents and the hook aligned on the same project conventions instead of guessing.

## Install

```
/plugin marketplace add Fanca123/claude-multi-agent-workflow
/plugin install code-quality-guard@fanca123-marketplace
```

For local testing from a clean checkout: `cd course-api && npm install`, then from the repo root run `claude --plugin-dir .` and invoke `/guard`.

## Scoping decision: why code-reviewer is read-only and test-writer isn't

`code-reviewer` gets `tools: Read, Grep, Glob` and nothing else — deliberately no `Write`/`Edit`/`Bash`. Its whole job is to produce an opinion about existing code, and an opinion doesn't need write access. Keeping it read-only means a bad review can't accidentally mutate the codebase, and it makes the agent easy to trust and reuse in read-only contexts (e.g. a future PR-comment bot) without re-auditing what it's allowed to touch. `test-writer`, by contrast, exists specifically to change files (new/updated tests) and to run `npm test`, so it needs `Write`, `Edit`, and `Bash` — the minimum set that actually lets it do its one job, not a general-purpose grant.

The two agents also get different models for the same reason they get different tools: `code-reviewer` runs on `sonnet`, which is enough judgment to catch validation/error-shape issues against a checklist. `test-writer` runs on `opus` because it's the agent whose output actually ships — a wrong test either hides a real bug or breaks the suite — so the harder, higher-stakes job gets the stronger model.

## Orchestration decision: why Step 1 is parallel and Step 2 is dependent

`routes/` and `db/store.js` are independent files with no shared state to reconcile between reviews, so reviewing them is launched as two simultaneous `code-reviewer` calls in Step 1 — there's no reason to make one wait on the other. Step 2 (`test-writer`) is sequential and depends on Step 1 on purpose: it can't know what test cases are missing until the review has actually found the gaps, so starting it any earlier would mean guessing instead of targeting real findings. Parallel where work doesn't depend on other work, sequential where it structurally can't start without a prior result.
