---
name: git-commit
description: Creates git commits whose messages follow the Conventional Commits type prefixes (feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert). Use whenever the user asks to commit changes or write a commit message.
---

# Git commit

Every commit message must follow this format:

```
<type>: <short description>

[optional body explaining what and why]
```

## Types

| Type | Use for |
| --- | --- |
| `feat` | Introducing new features or significant improvements |
| `fix` | Bug fixes that resolve issues in the code |
| `docs` | Updates or additions to documentation |
| `style` | Cosmetic changes that don't affect functionality (formatting, whitespace) |
| `refactor` | Code changes that neither fix a bug nor add a feature but improve structure |
| `test` | Adding or fixing tests |
| `chore` | Routine tasks or updates to the build process |
| `perf` | Enhancements that improve performance |
| `ci` | Changes to CI/CD processes |
| `build` | Changes affecting the build system or external dependencies |
| `revert` | Undoing previous changes |

## Process

1. Run `git status` and `git diff` (staged and unstaged) to see what changed. Check `git log -5 --oneline` for context.
2. Pick the single type that best describes the change. If the changes mix unrelated types, suggest splitting them into separate commits.
3. Write the description:
   - Lowercase type, followed by a colon and a space
   - Imperative mood ("add", "fix", not "added", "fixes")
   - Under 72 characters, no trailing period
   - Describe the why, not just the what
4. Stage only the relevant files by name (avoid `git add -A` so secrets or unrelated files are not committed).
5. Commit, passing the message with a heredoc to preserve formatting.
6. Run `git status` to confirm the commit succeeded.

## Rules

- Never use a type outside the list above.
- For `revert`, name the commit being reverted in the description or body.
- Never push, amend, or skip hooks unless the user asks.
- Follow any attribution or trailer instructions given for commits in the session.

## Examples

```
feat: add endpoint to delete users
fix: return 404 when user id does not exist
docs: document the users API in api.md
test: add cases for PUT /users/:id
revert: revert "feat: add endpoint to delete users"
```
