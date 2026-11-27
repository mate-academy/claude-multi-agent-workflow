---
name: pre-commit-check
description: Checks whether changes are ready to commit by running tests and linting and looking for leftover debug code, conflict markers, and secrets. Use when the user asks if their work is ready to commit, push, or open a pull request, or after review findings have been fixed.
---

# Pre-commit check

Decide whether the current changes are ready to commit. Report problems without fixing them, and do not stage, commit, or push.

## 1. Find the changes

- Run `git status --short --untracked-files=all` to list staged, unstaged, and untracked files, including every file inside a new directory.
- Run `git diff --cached` to see staged changes, and `git diff HEAD` to see the working tree against the last commit. Check both, because a line can be staged and then removed only from the working tree. Read new untracked files directly.
- If the user asks about pushing or opening a pull request, also check the committed work. Find the base with `git merge-base HEAD <branch>`, using the first of `origin/HEAD`, `origin/main`, local `main`, or the default branch that exists. Then run `git diff <base>..HEAD`.

If there are no changes, say so, and stop. For a push or pull request, stop only if the committed diff and the working tree are both empty.

## 2. Run the project's checks

For each project that contains a changed file, find its checks in `CLAUDE.md`, `package.json`, or the equivalent, and run its tests and linter.

If dependencies are not installed, report the check as "Not run" and give the install command. Do not install them yourself.

## 3. Inspect the added lines

Look for these in the added lines of every diff from step 1, and in new files:

- Merge conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`)
- Debugging leftovers, such as `debugger`, temporary `console.log` calls, or `set -x` in shell scripts
- Focused or skipped tests, such as `.only` or `.skip`
- Secrets, such as API keys, tokens, passwords, private keys, or a `.env` file
- Files that should not be committed, such as dependencies, build output, or logs

Judge each match in context. For example, a startup log message in a server is intentional. If you report a secret, give its location and never repeat its value.

## 4. Report

Start with one verdict:

- **Ready:** every check passed and nothing blocking was found.
- **Not ready:** a check failed, or there is a conflict marker, a secret, or another blocking problem.
- **Unverified:** nothing blocking was found, but a check could not be run.

Then list:

- each check, with the command and its result (Passed, Failed, or Not run)
- each problem, with `path/to/file:line` and what to change

If the fixes need code review, suggest running `/code-review:review`.
