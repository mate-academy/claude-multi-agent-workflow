---
description: Run the full code-quality workflow on the course-api — parallel review + lint, then a dependent fix pass.
argument-hint: "[path or area to focus on, e.g. routes/users.js]"
---

# /quality — code-quality workflow

Orchestrate the plugin's subagents to review and repair the `course-api`. If the
user named a focus area in `$ARGUMENTS`, scope everything below to it; otherwise
cover `server.js`, `routes/`, and `db/store.js`.

## Step 1 — Gather signals (run these two IN PARALLEL)

These are independent, so start them at the same time in a single batch and wait
for both to finish before moving on:

- **A. Review** — launch the `reviewer` subagent (read-only) to inspect the code and
  return a prioritized list of findings.
- **B. Lint** — run `npm run lint` inside `course-api/` and capture the ESLint output.

Neither depends on the other; do not wait for one before starting the other.

## Step 2 — Fix (DEPENDENT — waits for Step 1)

Once **both** A and B are back, combine their results into a single list of issues
(review findings + lint errors, de-duplicated). Then launch the `fixer` subagent and
hand it that combined list. This step is dependent: it must not start until Step 1
has produced its output, because the fixer needs to know what to fix.

The fixer applies minimal edits and then runs `npm test` and `npm run lint` in
`course-api/` to confirm everything is green.

## Step 3 — Report

Summarize for the user:

- what the review + lint found (grouped by severity),
- what the fixer changed (file-by-file),
- the final `npm test` / `npm run lint` status,
- anything left unaddressed and why.

If Step 1 surfaced nothing, say so and skip Step 2.
