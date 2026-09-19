---
name: pr-description
description: Use when asked to write, draft, or summarize a pull request description, commit summary, or release note for the changes on the current branch — especially right after the review/test workflow, when the ask is "write up a PR description", "summarize this for the PR", or "what should I put in the pull request".
---

# PR description

Turn a reviewed, tested set of changes into a short, paste-ready pull request description.

## What to do

1. Identify the changed files (diff against the base branch).
2. If `code-reviewer` findings and `test-writer` output from a `/ship` run are available in the conversation, pull from them instead of re-reviewing from scratch:
   - Note any findings that were fixed before this PR, briefly, so reviewers know what was already caught.
   - List the new/updated test files and what each one covers.
3. For each changed file, write one line describing what changed and why, not just what the diff shows.
4. Do not invent motivation that wasn't stated — if the "why" isn't known, describe the "what" plainly instead of guessing.

## What to return

A short markdown block with:
- **Summary** — one or two sentences on the overall change.
- **Changes** — one bullet per file: `path — one-line description`.
- **Tests** — bullets for any tests added or updated, or "No tests added" if none.
- Nothing else. Keep it short enough to paste directly into a PR description field.
