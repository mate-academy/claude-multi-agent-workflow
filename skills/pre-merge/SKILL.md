---
name: pre-merge
description: Use when the user wants to know if the current changes are safe to merge or push. Triggers on phrases like "is this ready to merge?", "can I ship this?", "review before I push", or "check the diff before merging."
---

# Pre-Merge Review

You are doing a targeted, pre-merge review of the current branch to give the user a clear go/no-go verdict before they push or open a pull request.

## When to use this skill

When the user asks whether their current changes are safe to merge, push, or ship — before any CI run, not as a replacement for it.

## How to work

**Step 1 — Scope the diff**

Run `git diff main...HEAD --name-only` (or `git diff HEAD` if there is no diverged branch) to get the list of changed files. If no files are changed, tell the user there is nothing to review and stop.

**Step 2 — Launch the api-contract-reviewer**

If any route, handler, validator, middleware, or API documentation file appears in the diff, launch the `api-contract-reviewer` agent and tell it to focus on those specific files. Ask it to return its full structured report.

If the diff contains no API-adjacent files, note that contract review was skipped and explain why.

**Step 3 — Scan the remaining diff yourself**

Read the actual diff (`git diff main...HEAD`) for anything outside API contracts:
- Logic errors or missing edge cases in the changed code
- Test files: are they present and do they cover the new behaviour?
- Any obviously dangerous pattern (hardcoded secrets, debug output left in, `TODO: remove before merge`)

## What to return

A verdict at the top — one of:

- **Ready to merge** — no blocking issues found
- **Merge with caution** — minor issues noted, none blocking
- **Not ready** — one or more blocking issues that must be fixed first

Then a short bulleted list:
- **Contract** — summary of what the api-contract-reviewer found (or "not applicable")
- **Logic** — anything you spotted in the diff
- **Tests** — present / missing / inadequate
- **Blockers** — concrete list of what must be fixed, with file and line number; empty if none

Keep it tight. The user is about to merge — they need actionable signal, not a narration of the diff.
