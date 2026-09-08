---
name: commit-message-style
description: Use when writing a git commit message or PR description for this project — enforces Conventional Commits style (type(scope): summary) so history stays scannable and changelogs can be generated from it. Triggers on "write a commit message", "commit this", "draft a PR description".
---

# Commit message style

This project's history should read as a changelog. Every commit message follows Conventional Commits:

```
<type>(<scope>): <short summary, imperative mood, no trailing period>

<optional body: what changed and why, wrapped at ~72 chars>
```

## Allowed types

- `feat` — a new capability (e.g. a new route, a new subagent)
- `fix` — a bug fix
- `test` — adding or updating tests only
- `refactor` — code change that doesn't alter behavior
- `chore` — tooling, config, dependency, or plugin-scaffolding changes
- `docs` — README/NOTES/comment-only changes

## Rules

1. Scope is the touched area in lowercase, e.g. `users`, `store`, `agents`, `hooks` — omit it only if the change is truly repo-wide.
2. Summary is imperative present tense: "add", not "added" or "adds".
3. Keep the summary under ~72 characters; put detail in the body, not the summary.
4. One logical change per commit — if a diff mixes a fix and a refactor, say so and suggest splitting it rather than picking one type arbitrarily.
5. Never invent a "why" that isn't evidenced by the diff or the conversation — if the motivation isn't known, describe only what changed.

## When drafting a message

1. Look at the actual diff (`git diff --staged`, or the files just changed) — don't guess from the request alone.
2. Pick the single type that best matches the dominant change.
3. Write the summary line first; add a body only if the summary alone doesn't explain the change.
